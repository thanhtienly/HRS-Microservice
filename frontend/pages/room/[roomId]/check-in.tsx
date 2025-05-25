import Navbar from "@/components/navbar";
import LoadingPage from "@/components/loading";
import ErrorNotification from "@/components/notification/error";
import { CheckCircle } from "@mui/icons-material";
import { Cancel } from "@mui/icons-material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next/client";
import { useRouter } from "next/router";

export default function CheckInPage() {
  const router = useRouter();

  const params = useParams<{ roomId: string }>();
  const [accessToken, setAccessToken] = useState<string | null>();

  /* Use for error notification component */
  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>("");

  const [isLoading, setLoading] = useState(true);
  const [isCheckInError, setCheckInError] = useState(false);
  const [checkInErrorMessage, setCheckInErrorMessage] = useState<
    string | undefined
  >();

  const updateErrorState = (isVisible: boolean) => {
    setError(isVisible);
  };

  const zeroPad = (num: number) => {
    if (num < 10) {
      return `0${num}`;
    }
    return `${num}`;
  };

  const getISODateWithOffset = (date: Date) => {
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - offset * 60 * 1000);
    return date.toISOString().split("T")[0];
  };

  const handleCheckIn = async (roomId: string, accessToken: string) => {
    const now = new Date();

    let currentHour = now.getHours();
    let nextHour = now.getHours() + 1;

    await fetch(`${process.env.apiGatewayHost}/booking/time-slot/check-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        date: getISODateWithOffset(now),
        roomId: roomId,
        timeSlot: `${zeroPad(currentHour)}:00 - ${zeroPad(nextHour)}:00`,
      }),
    })
      .then((res) => res.json())
      .then((res: { success: boolean; message?: string; data?: any }) => {
        if (!res.success) {
          setLoading(false);
          setCheckInError(true);
          setCheckInErrorMessage(res?.message);
          return;
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  /* Check if user have logged in */
  useEffect(() => {
    if (params?.roomId) {
      let token = getCookie("accessToken");

      if (token) {
        setAccessToken(token);
        console.log(token);
        handleCheckIn(params.roomId, token);
        return;
      }

      setError(true);
      setErrorMessage("Login required, wait for redirect to login page");
      setTimeout(() => {
        router.push(
          `/login?redirect=${process.env.frontendHost}/room/${params.roomId}/check-in`
        );
      }, 3000);
    }
  }, [params?.roomId, router]);

  return (
    <>
      {isError && (
        <ErrorNotification
          message={errorMessage}
          duration={3000}
          onTimeOut={updateErrorState}
        />
      )}
      <div className="w-full lg:h-screen lg:overflow-hidden">
        <Navbar />
        {isLoading && <LoadingPage />}

        {isLoading == false && isCheckInError == false && (
          <div className="w-full h-screen flex flex-col lg:flex-row pt-[80] pb-[80] pl-[20] pr-[20] items-center justify-center">
            <div className="p-4 w-full md:w-fit flex flex-col items-center justify-center bg-gray-100 rounded-lg">
              <CheckCircle sx={{ color: "green", fontSize: 60 }} />
              <p className="font-bold text-lg uppercase">
                {" "}
                Check-In Successful
              </p>
              <p className="text-center">
                Feel free to keep our service better by providing feedback about
                the room here
              </p>
              <a
                href={`/room/${params?.roomId}`}
                className="mt-2 pt-1 pb-1 pl-3 pr-3 bg-[#008000] text-white rounded-md hover:bg-lime-600"
              >
                Give feedback
              </a>
            </div>
          </div>
        )}

        {isLoading == false && isCheckInError == true && (
          <div className="w-full h-screen flex flex-col lg:flex-row pt-[80] pb-[80] pl-[20] pr-[20] items-center justify-center">
            <div className="p-4 w-full md:max-w-md md:min-w-md flex flex-col items-center justify-center bg-gray-100 rounded-lg">
              <Cancel sx={{ color: "red", fontSize: 60 }} />
              <p className="font-bold text-lg uppercase"> Check-In Failed</p>
              <p className="text-center">{checkInErrorMessage}</p>
              <a
                href={`/booking-history`}
                className="mt-2 pt-1 pb-1 pl-3 pr-3 bg-[#FF0000] text-white rounded-md hover:bg-orange-400"
              >
                Booking History
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
