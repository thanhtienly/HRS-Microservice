"use client";
import { useEffect, useRef, useState } from "react";
import { Close } from "@mui/icons-material";
import { getCookie } from "cookies-next/client";
import "../app/globals.css";
import { error } from "console";

export default function CancelModal(props: {
  isOpenModal: boolean;
  reservationId: string;
  secret: string;
  onClose: (isOpenModal: boolean) => void;
  onError: (isError: boolean, errorMessage?: string) => void;
  onSuccess: (isSuccess: boolean, successMessage?: string) => void;
}) {
  const [accessToken, setAccessToken] = useState("");
  const [isOpenModal, setOpenModalState] = useState(false);
  const [reservationId, setReservationId] = useState("");
  const [reservationSecret, setReservationSecret] = useState("");

  /* Check if user logged in */
  useEffect(() => {
    var token = getCookie("accessToken");

    if (token) {
      setAccessToken(token);
      return;
    }
  }, []);

  useEffect(() => {
    if (props.isOpenModal == true) {
      setOpenModalState(true);
    }
  }, [props.isOpenModal]);

  useEffect(() => {
    if (props.reservationId) {
      setReservationId(props.reservationId);
    }
  }, [props.reservationId]);

  useEffect(() => {
    if (props.secret) {
      setReservationSecret(props.secret);
    }
  }, [props.secret]);

  useEffect(() => {
    console.log(`Current reservationId is ${reservationId}`);
  }, [reservationId]);

  const handleCloseModal = () => {
    setOpenModalState(false);
    props.onClose(false);
  };

  const handleCancelReservation = async () => {
    console.log("Cancel reservation request");
    await fetch(`${process.env.apiGatewayHost}/booking/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reservationId: reservationId,
      }),
    })
      .then((res) => res.json())
      .then((res: { success: boolean; data?: any; message?: string }) => {
        if (res.success) {
          props.onSuccess(true, "Cancel booking successful");
          return;
        }

        props.onError(true, res.message);
      })
      .catch((err) => {
        props.onError(true, "Internal Server Error");
      });
  };

  return (
    <div
      className={`${
        isOpenModal ? "fixed" : "hidden"
      } top-0 left-0 w-full h-screen flex flex-row justify-center pt-[160] pb-[20] pl-[20] pr-[20] z-50 bg-[rgba(0,0,0,0.5)]`}
    >
      <div className="w-full h-fit lg:w-1/2 p-2 pb-6 flex flex-col bg-white rounded-lg">
        <div className="w-full flex justify-end">
          <button
            className="p-1 w-fit h-fit flex justify-center items-center bg-slate-200 rounded-md cursor-pointer hover:bg-red-200"
            onClick={handleCloseModal}
          >
            <Close
              style={{
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </button>
        </div>
        <div className="mt-5 w-full flex items-center justify-center">
          <p className="p-3 text-2xl text-center">
            Do you want to continue canceling the reservation?
          </p>
        </div>
        <div className="mt-2 w-full flex items-center justify-center">
          <button
            className="pt-2 pb-2 pl-3 pr-3 bg-slate-900 text-white rounded-md cursor-pointer hover:bg-red-500 hover:text-white"
            onClick={handleCancelReservation}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
