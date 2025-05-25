import Navbar from "@/components/navbar";
import InviteBox from "@/components/invite";
import CancelModal from "@/components/cancelModal";
import ErrorNotification from "@/components/notification/error";
import SuccessNotification from "@/components/notification/success";
import { AccessTimeFilled, DoorFront } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { getCookie } from "cookies-next/client";
import { useRouter } from "next/router";

export default function BookingHistory() {
  const router = useRouter();

  const [category, setCategory] = useState("incoming");
  const [accessToken, setAccessToken] = useState<string | null>();
  const [isOpenInviteModal, setOpenInviteModal] = useState(false);
  const [reservationId, setReservationId] = useState("");
  const [reservationSecret, setReservationSecret] = useState("");
  const [reservationList, setReservationList] = useState([]);

  const [isSuccess, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const [isOpenCancelModal, setOpenCancelModal] = useState(false);

  const roomType = {
    individual: "Individual",
    group: "Group",
    mentoring: "Mentoring",
  };

  const bookingStatus = {
    booked: "Booked",
    waiting: "Waiting",
    cancelled: "Cancelled",
  };

  const bookingHistoryCategory = {
    upcoming: "incoming",
    past: "past",
  };

  /* Check if user logged in */
  useEffect(() => {
    const token = getCookie("accessToken");

    if (token) {
      setAccessToken(token);
      return;
    }

    router.push(`/login?redirect=${process.env.frontendHost}/booking-history`);
  }, [router]);

  useEffect(() => {
    if (accessToken) {
      fetchReservationHistory()
        .then(() => {})
        .catch((err) => {
          console.log(err);
        });
    }
  }, [accessToken]);

  useEffect(() => {
    fetchReservationHistory()
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });
  }, [category]);

  const updateCategoryFilter = (e: any) => {
    e.preventDefault();

    setCategory(e.currentTarget.value);
  };

  const updateError = (isError: boolean, errorMessage?: string) => {
    setError(isError);
    setErrorMessage(errorMessage);
  };

  const updateErrorState = (isVisible: boolean) => {
    setError(isVisible);
  };

  const updateSuccess = (isSuccess: boolean, successMessage?: string) => {
    setSuccess(isSuccess);
    setSuccessMessage(successMessage);
  };

  const updateCancelBookingSuccess = (
    isSuccess: boolean,
    successMessage?: string
  ) => {
    setSuccess(isSuccess);
    setSuccessMessage(successMessage);
    fetchReservationHistory();
  };

  const updateSuccessState = (isVisible: boolean) => {
    setSuccess(isVisible);
  };

  const handleOpenInviteModal = (e: any) => {
    e.preventDefault();

    setReservationId(e.currentTarget.value);
    setReservationSecret(e.currentTarget.getAttribute("security"));
    setOpenInviteModal(true);
  };

  const handleOpenCancelModal = (e: any) => {
    e.preventDefault();

    setReservationId(e.currentTarget.value);
    setReservationSecret(e.currentTarget.getAttribute("security"));
    setOpenCancelModal(true);
  };

  const handleCloseInviteModal = (isOpenInviteModal: boolean) => {
    setReservationId("");
    setReservationSecret("");
    setOpenInviteModal(isOpenInviteModal);
  };

  const handleCloseCancelModal = (isOpenCancelModal: boolean) => {
    setReservationId("");
    setReservationSecret("");
    setOpenCancelModal(isOpenCancelModal);
  };

  const fetchReservationHistory = async () => {
    await fetch(
      `${process.env.apiGatewayHost}/booking/history?category=${category}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
      .then((res) => res.json())
      .then((res: { success: boolean; message?: string; data?: any }) => {
        if (res.success) {
          setReservationList(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      {isSuccess && (
        <SuccessNotification
          message={successMessage}
          duration={3000}
          onTimeOut={updateSuccessState}
        />
      )}

      {isError && (
        <ErrorNotification
          message={errorMessage}
          duration={3000}
          onTimeOut={updateErrorState}
        />
      )}

      {isOpenInviteModal && (
        <InviteBox
          isOpenModal={isOpenInviteModal}
          onClose={handleCloseInviteModal}
          reservationId={reservationId}
          onError={updateError}
          onSuccess={updateSuccess}
          secret={reservationSecret}
        />
      )}

      {isOpenCancelModal && (
        <CancelModal
          isOpenModal={isOpenCancelModal}
          onClose={handleCloseCancelModal}
          reservationId={reservationId}
          onError={updateError}
          onSuccess={updateCancelBookingSuccess}
          secret={reservationSecret}
        />
      )}

      <div className="w-full">
        <Navbar></Navbar>
        <div className="w-full h-screen flex flex-row justify-center pt-[80] pb-[20] pl-[20] pr-[20]">
          <div className="w-full h-full lg:w-1/2 p-4 flex flex-col rounded-lg bg-slate-200 text-sm overflow-y-scroll">
            <div className="w-full p-1 flex flex-row rounded-lg bg-yellow-500">
              <button
                className={`pt-1 pb-1 pl-2 pr-2 rounded-md cursor-pointer ${
                  category == bookingHistoryCategory.upcoming
                    ? "bg-white font-semibold"
                    : ""
                }`}
                onClick={updateCategoryFilter}
                value={"incoming"}
              >
                Upcoming
              </button>
              <button
                className={`pt-1 pb-1 pl-2 pr-2 rounded-md cursor-pointer ${
                  category == bookingHistoryCategory.past
                    ? "bg-white font-semibold"
                    : ""
                }`}
                onClick={updateCategoryFilter}
                value={"past"}
              >
                Past
              </button>
            </div>

            <div className="w-full mt-5 flex flex-col text-sm">
              {reservationList.map(
                (reservation: {
                  id: string;
                  roomId: string;
                  studentId: string;
                  date: string;
                  from: string;
                  to: string;
                  secret: string;
                  reservedAt: string;
                  state: string;
                  roomName: string;
                  roomCapacity: number;
                  roomType: string;
                  ssaName: string;
                }) => (
                  <div
                    className="mt-2 w-full flex flex-col items-center justify-center rounded-md bg-white text-gray-600 shadow-xl md:flex-row md:justify-start"
                    key={reservation.id}
                  >
                    <div className="w-full pl-2 pr-2 md:w-fit md:pt-2 md:pb-2">
                      <div className="flex flex-col justify-center items-center border-b-[1] border-gray-300 md:border-b-[0] md:border-r-[1]">
                        <div className="p-2 w-fit min-w-[80] flex flex-col justify-center items-center">
                          <span className="font-bold text-base text-red-600">
                            {new Date(reservation.date)
                              .toLocaleString("en-US", {
                                month: "short",
                                day: "2-digit",
                              })
                              .split(" ")
                              .reverse()
                              .join("-")}
                          </span>
                          <span className="font-bold text-base text-red-600">
                            {new Date(reservation.date).getFullYear()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full pl-2 pr-2 mt-1 flex flex-row italic md:w-fit md:min-w-[150] md:h-full md:mt-0 md:flex-col md:justify-center">
                      <div className="w-1/2 flex flex-row items-center justify-start md:w-fit">
                        <AccessTimeFilled
                          sx={{ color: "#4a5565", fontSize: 16 }}
                        />
                        <p className="ml-1">
                          {reservation.from} - {reservation.to}
                        </p>
                      </div>

                      <div className="w-1/2 flex flex-row items-center justify-end md:w-fit md:mt-1">
                        <DoorFront sx={{ color: "#4a5565", fontSize: 16 }} />
                        <p className="ml-1">{reservation.roomType}</p>
                      </div>
                    </div>

                    <div className="w-full pl-2 pr-2 mt-1 mb-1 flex flex-col italic md:w-fit md:min-w-[120]">
                      <div className="flex flex-row">
                        <p className="font-bold">Room:</p>
                        <p className="ml-1">{reservation.roomName}</p>
                      </div>
                      <div className="flex flex-row">
                        <p className="font-bold">Building:</p>
                        <p className="ml-1">{reservation.ssaName}</p>
                      </div>
                      <div className="flex flex-row">
                        <p className="font-bold">Capacity:</p>
                        <p className="ml-1">{reservation.roomCapacity}</p>
                      </div>
                      <div className="flex flex-row">
                        <p className="font-bold">Status:</p>
                        <p className="ml-1">{reservation.state}</p>
                      </div>
                    </div>

                    {reservation.state == bookingStatus.booked && (
                      <div className="w-full flex justify-end pl-2 pr-2 mt-1 mb-2 md:mb-1">
                        {reservation.roomType != roomType.individual && (
                          <button
                            className="pt-2 pb-2 pl-4 pr-4 bg-slate-900 text-white rounded-md cursor-pointer hover:bg-yellow-500 hover:text-black"
                            onClick={handleOpenInviteModal}
                            key={`invite-${reservation.id}`}
                            value={reservation.id}
                            security={reservation.secret}
                          >
                            Invite
                          </button>
                        )}

                        <button
                          className="ml-3 pt-2 pb-2 pl-4 pr-4 bg-red-900 text-white rounded-md cursor-pointer hover:bg-yellow-500 hover:text-black"
                          onClick={handleOpenCancelModal}
                          key={`cancel-${reservation.id}`}
                          value={reservation.id}
                          security={reservation.secret}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
