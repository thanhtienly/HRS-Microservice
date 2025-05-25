"use client";

import Navbar from "@/components/navbar";
import LoadingPage from "@/components/loading";
import { CheckCircle } from "@mui/icons-material";
import { Cancel } from "@mui/icons-material";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyUserPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [isRetry, setRetry] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isVerifyError, setVerifyError] = useState(false);
  const [verifyErrorMessage, setVerifyErrorMessage] = useState<
    string | undefined
  >();

  /* Check if user have logged in */
  useEffect(() => {
    if (token) {
      verifyUser()
        .then()
        .catch((error) => console.log(error));
      return;
    }

    if (isRetry) {
      setLoading(false);
      setVerifyError(true);
      setVerifyErrorMessage(
        "Token parameter is required for verifying account"
      );
      return;
    }

    setTimeout(() => {
      setRetry(true);
    }, 2000);
  }, [token, isRetry]);

  const verifyUser = async () => {
    await fetch(
      `${process.env.apiGatewayHost}/auth/student/verify?token=${token}`
    )
      .then((res) => res.json())
      .then((res: { success: boolean; data?: any; message?: string }) => {
        if (res.success) {
          setLoading(false);
          return;
        }

        setLoading(false);
        setVerifyError(true);
        setVerifyErrorMessage(res.message);
      })
      .catch((err) => {
        setLoading(false);
        setVerifyError(true);
        setVerifyErrorMessage("Internal Server Error");
      });
  };

  return (
    <div className="w-full lg:h-screen lg:overflow-hidden">
      <Navbar />
      {isLoading && <LoadingPage />}

      {isLoading == false && isVerifyError == true && (
        <div className="w-full h-screen flex flex-col lg:flex-row pt-[80] pb-[80] pl-[20] pr-[20] items-center justify-center">
          <div className="p-4 w-full md:max-w-md md:min-w-md flex flex-col items-center justify-center bg-gray-100 rounded-lg">
            <Cancel sx={{ color: "red", fontSize: 60 }} />
            <p className="font-bold text-lg uppercase">Verify Account Failed</p>
            <p className="text-center">{verifyErrorMessage}</p>
            <a
              href={`/`}
              className="mt-2 pt-1 pb-1 pl-3 pr-3 bg-[#FF0000] text-white rounded-md hover:bg-orange-400"
            >
              Home page
            </a>
          </div>
        </div>
      )}

      {isLoading == false && isVerifyError == false && (
        <div className="w-full h-screen flex flex-col lg:flex-row pt-[80] pb-[80] pl-[20] pr-[20] items-center justify-center">
          <div className="p-4 w-full md:w-fit flex flex-col items-center justify-center bg-gray-100 rounded-lg">
            <CheckCircle sx={{ color: "green", fontSize: 60 }} />
            <p className="font-bold text-lg uppercase">
              {" "}
              Verify Account Successful
            </p>
            <p className="text-center">
              You can login and continue using website's feature now
            </p>
            <a
              href={`/login`}
              className="mt-2 pt-1 pb-1 pl-3 pr-3 bg-[#008000] text-white rounded-md hover:bg-lime-600"
            >
              Login
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
