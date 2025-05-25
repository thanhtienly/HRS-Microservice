import { useState } from "react";
import ErrorNotification from "@/components/notification/error";
import SuccessNotification from "@/components/notification/success";
import Navbar from "@/components/navbar";
import RoomDetailCard from "@/components/roomdetail";
import RoomBooking from "@/components/roombooking";
import RoomFeedback from "@/components/roomfeedback";

export default function RoomDetailPage() {
  /* Use for error notification component */
  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>("");

  /* Use for success notification component */
  const [isSuccess, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>("");
  const [isBookSuccess, setBookSuccess] = useState(false);

  const clearBookSuccessState = () => {
    setBookSuccess(false);
  };

  const updateIsBookSuccess = (success: boolean) => {
    setBookSuccess(success);
  };

  const updateErrorState = (isVisible: boolean) => {
    setError(isVisible);
  };

  const updateSuccessState = (isVisible: boolean) => {
    setSuccess(isVisible);
  };

  const updateError = (error: boolean, errorMessage: string | undefined) => {
    setError(error);
    setErrorMessage(errorMessage);
  };

  const updateSuccess = (success: boolean, successMessage: string) => {
    setSuccess(success);
    setSuccessMessage(successMessage);
  };

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

      <div className="w-full lg:h-screen lg:overflow-hidden">
        <Navbar />
        <div className="w-full lg:h-screen flex flex-col lg:flex-row pt-[80] pb-[80] pl-[20] pr-[20]">
          <RoomDetailCard
            isBookSuccess={isBookSuccess}
            onRefresh={clearBookSuccessState}
          />
          <div className="w-full lg:h-screen lg:overflow-scroll lg:pl-[50] flex flex-col lg:flex-row">
            <RoomBooking
              onBook={updateIsBookSuccess}
              onError={updateError}
              onSuccess={updateSuccess}
            />
            <RoomFeedback onError={updateError} onSuccess={updateSuccess} />
          </div>
        </div>
      </div>
    </>
  );
}
