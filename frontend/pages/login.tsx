"use server";
import Navbar from "@/components/navbar";
import { useEffect, useRef, useState } from "react";
import ErrorNotification from "@/components/notification/error";
import SuccessNotification from "@/components/notification/success";
import LoadingPage from "@/components/loading";
import { useRouter } from "next/router";
import { getCookie, setCookie } from "cookies-next/client";

export default function LoginPage() {
  const router = useRouter();

  const [isLoading, setLoading] = useState(true);

  /* Use for error notification component */
  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>("");

  /* Use for success notification component */
  const [isSuccess, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>("");

  const [isLoginFocus, setLoginFocus] = useState(true);
  const [isSignupFocus, setSignupFocus] = useState(false);

  /* Use to clear sign up input */
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const studentIdRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);

  /* Check if user is login */
  useEffect(() => {
    const accessToken = getCookie("accessToken");
    console.log(accessToken);
    if (accessToken) {
      router.push("/");
      return;
    }
    setLoading(false);
  }, []);

  const updateErrorState = (isVisible: boolean) => {
    setError(isVisible);
  };

  const updateSuccessState = (isVisible: boolean) => {
    setSuccess(isVisible);
  };

  const clearSignUpInput = (refs: any) => {
    refs.forEach((ref: any) => {
      if (ref.current) {
        ref.current.value = "";
      }
    });
  };

  const handleSignUpSubmit = async (e: any) => {
    e.preventDefault();
    const formElement = e.target;
    const formData = new FormData(formElement);

    const data = Object.fromEntries(formData.entries());

    if (data?.password != data?.confirmPassword) {
      setError(true);
      setErrorMessage("Confirm password not match");
      return;
    }

    console.log(data);
    await fetch(`${process.env.apiGatewayHost}/auth/student/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data?.email,
        password: data?.password,
        studentId: data?.studentId,
        firstName: data?.firstName,
        lastName: data?.lastName,
        gender: data?.gender,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((res: { success: boolean; data?: any; message?: string }) => {
        /* Data not exist in response => Sign up failed */
        if (!res?.data) {
          setError(true);
          setErrorMessage(res?.message);
          return;
        }
        setSuccess(true);
        setSuccessMessage(
          "Sign up success, check your email to verify account"
        );
        clearSignUpInput([
          emailRef,
          passwordRef,
          confirmPasswordRef,
          studentIdRef,
          firstNameRef,
          lastNameRef,
          genderRef,
        ]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleLoginSubmit = async (e: any) => {
    e.preventDefault();
    const formElement = e.target;
    const formData = new FormData(formElement);

    const data = Object.fromEntries(formData.entries());

    await fetch(`${process.env.apiGatewayHost}/auth/student/log-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data?.email,
        password: data?.password,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then(
        (res: {
          success: boolean;
          data?: {
            accessToken: string;
            refreshToken: string;
          };
          message?: string;
        }) => {
          /* Data not exist in response => Login failed */
          if (!res?.data) {
            setError(true);
            setErrorMessage(res?.message);
            return;
          }
          setCookie("accessToken", res.data.accessToken);
          setCookie("refreshToken", res.data.refreshToken);
          router.push("/");
        }
      )
      .catch((err) => {
        console.log(err);
      });
  };

  const toogleFocusForm = (e: any) => {
    e.preventDefault();

    if (e.target.id == "login-show") {
      setLoginFocus(true);
      setSignupFocus(false);
      return;
    }

    if (e.target.id == "signup-show") {
      setSignupFocus(true);
      setLoginFocus(false);
      return;
    }

    return;
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      {isError && (
        <ErrorNotification
          message={errorMessage}
          duration={3000}
          onTimeOut={updateErrorState}
        />
      )}

      {isSuccess && (
        <SuccessNotification
          message={successMessage}
          duration={3000}
          onTimeOut={updateSuccessState}
        />
      )}

      <div className="lg:h-screen lg:overflow-hidden">
        <Navbar></Navbar>
        <div className="w-full h-screen pt-[80] pb-[80] pl-[20] pr-[20] flex flex-col items-center justify-center">
          <div className="w-full max-w-md flex flex-col border-1 rounded-lg">
            <div className="w-full flex flex-row">
              <button
                className={`w-1/2 pt-1 pb-1 cursor-pointer ${
                  isLoginFocus
                    ? "bg-yellow-500 text-black"
                    : "bg-slate-900 text-white"
                } rounded-tl-md`}
                id="login-show"
                onClick={toogleFocusForm}
              >
                Log In
              </button>
              <button
                className={`w-1/2 pt-1 pb-1 cursor-pointer ${
                  isSignupFocus
                    ? "bg-yellow-500 text-black"
                    : "bg-slate-900 text-white"
                } rounded-tr-md`}
                id="signup-show"
                onClick={toogleFocusForm}
              >
                Sign Up
              </button>
            </div>
            <form
              id="login-form"
              className={`${
                isLoginFocus ? "" : "hidden"
              } w-full flex flex-col pt-3 pb-3 pl-2 pr-2 text-sm`}
              onSubmit={handleLoginSubmit}
            >
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="pl-1 text-xs italic font-medium"
                >
                  Email
                </label>
                <input
                  type="text"
                  name="email"
                  placeholder="example@gmail.com"
                  className="mt-1 pt-1 pb-1 pl-2 pr-2 rounded-md outline-none border-[1] hover:border-blue-500 bg-white"
                />
              </div>
              <div className="mt-2 flex flex-col">
                <label
                  htmlFor="password"
                  className="pl-1 text-xs italic font-medium"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="****************"
                  className="mt-1 pt-1 pb-1 pl-2 pr-2 rounded-md outline-none border-[1] hover:border-blue-500 bg-white"
                />
              </div>
              <div className="mt-3 flex flex-col">
                <button
                  className={`pt-1 pb-1 bg-slate-900 text-white rounded-md outline-none ${
                    isError == false
                      ? "cursor-pointer hover:bg-yellow-500 hover:text-black"
                      : ""
                  }`}
                  type="submit"
                  disabled={isError}
                >
                  Login
                </button>
              </div>
            </form>

            <form
              id="signup-form"
              className={`${
                isSignupFocus ? "" : "hidden"
              } w-full flex flex-col pt-3 pb-3 pl-2 pr-2 text-sm`}
              onSubmit={handleSignUpSubmit}
            >
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="pl-1 text-xs italic font-medium"
                >
                  Email
                </label>
                <input
                  ref={emailRef}
                  type="text"
                  name="email"
                  placeholder="example@gmail.com"
                  className="mt-1 pt-1 pb-1 pl-2 pr-2 rounded-md outline-none border-[1] hover:border-blue-500 bg-white"
                />
              </div>
              <div className="mt-2 flex flex-col">
                <label
                  htmlFor="password"
                  className="pl-1 text-xs italic font-medium"
                >
                  Password
                </label>
                <input
                  ref={passwordRef}
                  type="password"
                  name="password"
                  placeholder="****************"
                  className="mt-1 pt-1 pb-1 pl-2 pr-2 rounded-md outline-none border-[1] hover:border-blue-500 bg-white"
                />
              </div>
              <div className="mt-2 flex flex-col">
                <label
                  htmlFor="confirmPassword"
                  className="pl-1 text-xs italic font-medium"
                >
                  Confirm password
                </label>
                <input
                  ref={confirmPasswordRef}
                  type="password"
                  name="confirmPassword"
                  placeholder="****************"
                  className="mt-1 pt-1 pb-1 pl-2 pr-2 rounded-md outline-none border-[1] hover:border-blue-500 bg-white"
                />
              </div>
              <div className="mt-2 flex flex-col">
                <label
                  htmlFor="studentId"
                  className="pl-1 text-xs italic font-medium"
                >
                  Student Id
                </label>
                <input
                  ref={studentIdRef}
                  type="text"
                  name="studentId"
                  placeholder="Input your student id with length of 7"
                  className="mt-1 pt-1 pb-1 pl-2 pr-2 rounded-md outline-none border-[1] hover:border-blue-500 bg-white"
                />
              </div>
              <div className="mt-2 flex flex-col">
                <label
                  htmlFor="firstName"
                  className="pl-1 text-xs italic font-medium"
                >
                  First name
                </label>
                <input
                  ref={firstNameRef}
                  type="text"
                  name="firstName"
                  placeholder=""
                  className="mt-1 pt-1 pb-1 pl-2 pr-2 rounded-md outline-none border-[1] hover:border-blue-500 bg-white"
                />
              </div>
              <div className="mt-2 flex flex-col">
                <label
                  htmlFor="lastName"
                  className="pl-1 text-xs italic font-medium"
                >
                  Last name
                </label>
                <input
                  ref={lastNameRef}
                  type="text"
                  name="lastName"
                  placeholder=""
                  className="mt-1 pt-1 pb-1 pl-2 pr-2 rounded-md outline-none border-[1] hover:border-blue-500 bg-white"
                />
              </div>
              <div className="mt-2 flex flex-col">
                <label
                  htmlFor="gender"
                  className="pl-1 text-xs italic font-medium"
                >
                  Gender
                </label>
                <select
                  ref={genderRef}
                  name="gender"
                  className="mt-1 pt-1 pb-1 pl-2 pr-2 rounded-md focus:rounded-bl-none focus:rounded-br-none outline-none border-[1] hover:border-blue-500 bg-white"
                  defaultValue={""}
                >
                  <option value="" disabled className="hidden"></option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mt-3 flex flex-col">
                <button
                  className={`pt-1 pb-1 bg-slate-900 text-white rounded-md outline-none ${
                    isError == false
                      ? "cursor-pointer hover:bg-yellow-500 hover:text-black"
                      : ""
                  }`}
                  type="submit"
                  disabled={isError}
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
