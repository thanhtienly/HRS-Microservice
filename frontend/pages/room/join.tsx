"use client";

import Navbar from "@/components/navbar";
import LoadingPage from "@/components/loading";
import { CheckCircle } from "@mui/icons-material";
import { Cancel } from "@mui/icons-material";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function JoinRoomPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [roomDetail, setRoomDetail] = useState<
    | {
        date: string;
        startTime: string;
        endTime: string;
        roomName: string;
        roomCapacity: number;
        roomType: string;
        roomFloor: number;
      }
    | undefined
  >();
  const [isRetry, setRetry] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isJoiningError, setJoiningError] = useState(false);
  const [joiningErrorMessage, setJoiningErrorMessage] = useState<
    string | undefined
  >();

  /* Check if user have logged in */
  useEffect(() => {
    if (token) {
      joinRoom()
        .then(() => {})
        .catch((error) => console.log(error));
      return;
    }

    if (isRetry) {
      setLoading(false);
      setJoiningError(true);
      setJoiningErrorMessage(
        "Token parameter is required for joining by invitation"
      );
      return;
    }

    setTimeout(() => {
      setRetry(true);
    }, 2000);
  }, [token, isRetry]);

  const joinRoom = async () => {
    return await fetch(
      `${process.env.apiGatewayHost}/booking/invite/verify?token=${token}`
    )
      .then((res) => res.json())
      .then((res: { success: boolean; data?: any; message?: string }) => {
        if (res.success) {
          setLoading(false);
          setRoomDetail(res?.data);
          return;
        }

        setLoading(false);
        setJoiningError(true);
        setJoiningErrorMessage(res.message);
      })
      .catch((err) => {
        setLoading(false);
        setJoiningError(true);
        setJoiningErrorMessage("Internal Server Error");
      });
  };

  return (
    <div className="w-full lg:h-screen lg:overflow-hidden">
      <Navbar />
      {isLoading && <LoadingPage />}

      {isLoading == false && isJoiningError == true && (
        <div className="w-full h-screen flex flex-col lg:flex-row pt-[80] pb-[80] pl-[20] pr-[20] items-center justify-center">
          <div className="p-4 w-full md:max-w-md md:min-w-md flex flex-col items-center justify-center bg-gray-100 rounded-lg">
            <Cancel sx={{ color: "red", fontSize: 60 }} />
            <p className="font-bold text-lg uppercase">Joining Failed</p>
            <p className="text-center">{joiningErrorMessage}</p>
            <a
              href={`/`}
              className="mt-2 pt-1 pb-1 pl-3 pr-3 bg-[#FF0000] text-white rounded-md hover:bg-orange-400"
            >
              Home page
            </a>
          </div>
        </div>
      )}

      {isLoading == false && isJoiningError == false && (
        <div className="w-full h-screen flex flex-col lg:flex-row pt-[80] pb-[80] pl-[20] pr-[20] items-center justify-center">
          <div className="p-4 w-full md:w-fit flex flex-col items-center justify-center bg-gray-100 rounded-lg">
            <CheckCircle sx={{ color: "green", fontSize: 60 }} />
            <p className="font-bold text-lg uppercase">Joining Successful</p>
            <p className="text-center">
              You can see more detail and invite your friend in booking history
              page
            </p>
            <div className="mt-3 mb-2 w-full flex flex-col italic text-sm md:text-lg">
              <div className="w-full flex flex-row">
                <div className="w-1/2 flex justify-start">
                  <div className="flex flex-row">
                    <p className="font-semibold mr-1">Room:</p>
                    <p>{roomDetail?.roomName}</p>
                  </div>
                </div>
                <div className="w-1/2 flex justify-end">
                  <div className="flex flex-row">
                    <p className="font-semibold mr-1">Room type:</p>
                    <p>{roomDetail?.roomType}</p>
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-row">
                <div className="w-1/2 flex justify-start">
                  <div className="flex flex-row">
                    <p className="font-semibold mr-1">Capacity:</p>
                    <p>{roomDetail?.roomCapacity}</p>
                  </div>
                </div>
                <div className="w-1/2 flex justify-end">
                  <div className="flex flex-row">
                    <p className="font-semibold mr-1">Date:</p>
                    <p>{roomDetail?.date}</p>
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-row">
                <div className="w-1/2 flex justify-start">
                  <div className="flex flex-row">
                    <p className="font-semibold mr-1">Start time:</p>
                    <p>{roomDetail?.startTime}</p>
                  </div>
                </div>
                <div className="w-1/2 flex justify-end">
                  <div className="flex flex-row">
                    <p className="font-semibold mr-1">End time:</p>
                    <p>{roomDetail?.endTime}</p>
                  </div>
                </div>
              </div>
            </div>
            <a
              href={`/booking-history`}
              className="mt-2 pt-1 pb-1 pl-3 pr-3 bg-[#008000] text-white rounded-md hover:bg-lime-600"
            >
              Booking History
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
