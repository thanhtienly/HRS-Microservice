"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next/client";
import errorMapping from "@/utils/error";

const TimeSlot = (props: {
  time: string;
  status: "available" | "booked";
  onSelect: (timeSlot: string, type: "choose" | "cancel") => void;
}) => {
  const [isSelected, setIsSelected] = useState(false);

  const toggleTimeSlotClick = (e: any) => {
    e.preventDefault();
    var targetTimeSlot = e.target;

    /* Pick a time slot */
    if (targetTimeSlot.tabIndex == 0) {
      setIsSelected(!isSelected);
      props.onSelect(targetTimeSlot.textContent, "choose");
      targetTimeSlot.tabIndex = 1;
      return;
    }

    setIsSelected(!isSelected);
    props.onSelect(targetTimeSlot.textContent, "cancel");
    targetTimeSlot.tabIndex = 0;
    return;
  };

  return (
    <button
      onClick={props.status == "available" ? toggleTimeSlotClick : () => {}}
      tabIndex={0}
      className={`time-slot mt-1 mb-1 ml-2 mr-2 pt-1 pb-1 pl-3 pr-3 rounded-md 
        ${
          props.status == "booked"
            ? "bg-red-500"
            : `${
                isSelected
                  ? "bg-black text-white"
                  : "bg-blue-500 hover:bg-lime-500"
              } cursor-pointer`
        }`}
    >
      {props.time}
    </button>
  );
};

export default function RoomBooking(props: {
  onError: (error: boolean, errorMessage: string | undefined) => void;
  onSuccess: (success: boolean, successMessage: string) => void;
  onBook: (success: boolean) => void;
}) {
  const [accessToken, setAccessToken] = useState<string | null>();
  const params = useParams<{ roomId: string }>();
  const [timeSlotList, setTimeSlotList] = useState([]);
  const [reservedDate, setReservedDate] = useState("");
  const [reservedTimeSlot, setReservedTimeSlot] = useState<string[]>([]);

  useEffect(() => {
    var token = getCookie("accessToken");

    if (token) {
      setAccessToken(token);
    }
  }, []);

  const handleDatePickerChange = (e: any) => {
    e.preventDefault();
    setReservedDate(e.target.value);
  };

  /* Get all time slot (available + booked) */
  const fetchTimeSlot = async () => {
    await fetch(
      `${process.env.apiGatewayHost}/booking/time-slot?date=${reservedDate}&roomId=${params?.roomId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setTimeSlotList(res.data);
          return;
        }

        props.onError(true, res?.message);
        return;
      })
      .catch((err) => {
        console.log(err);
      });
  };
  /* Fetch time slot of date */
  useEffect(() => {
    if (reservedDate) {
      fetchTimeSlot();
      setReservedTimeSlot([]);
    }
  }, [reservedDate]);

  const updateTimeSlotSelect = (
    timeSlot: string,
    type: "choose" | "cancel"
  ) => {
    if (type == "choose") {
      reservedTimeSlot.push(timeSlot);
      setReservedTimeSlot(reservedTimeSlot);
      return;
    }
    setReservedTimeSlot(
      reservedTimeSlot.filter((item) => {
        return item != timeSlot;
      })
    );
  };

  const handleBookAction = async (e: any) => {
    console.log(reservedTimeSlot);
    e.preventDefault();
    if (!reservedDate || reservedTimeSlot.length == 0) {
      return;
    }

    await fetch(`${process.env.apiGatewayHost}/booking/time-slot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        date: reservedDate,
        roomId: params?.roomId,
        timeSlot: reservedTimeSlot,
      }),
    })
      .then((res) => res.json())
      .then((res: { success: boolean; data?: any; message?: string }) => {
        /* Data not exist in response => Booking failed */
        if (!res.success) {
          props.onError(true, errorMapping(res?.message));
          props.onBook(false);
          return;
        }

        props.onSuccess(true, "Book the time slot successfully");
        props.onBook(true);
        setReservedTimeSlot([]);
        fetchTimeSlot();
      })
      .catch((err) => {
        console.log(err);
        props.onBook(false);
      });
  };

  return (
    <div className="mt-[20] h-fit flex flex-col p-4 shadow-xl rounded-lg bg-slate-300 text-sm lg:mr-[20] lg:w-2/3">
      <div className="flex flex-col text-xs">
        <label htmlFor="date-picker" className="mb-1 text-xs font-semibold">
          Select date
        </label>
        <input
          onChange={handleDatePickerChange}
          type="date"
          name="date-picker"
          id="date-picker"
          className="border-[1] pt-1 pb-1 pl-3 pr-3 rounded-lg outline-none hover:border-blue-700"
        />
      </div>
      <div className="flex flex-col text-xs">
        <label className="mb-1 text-xs font-semibold mt-3">
          Select time slot
        </label>
        <div className="flex flex-row flex-wrap">
          {timeSlotList.map(
            (timeSlot: {
              date: string;
              startTime: string;
              endTime: string;
              status: "available" | "booked";
            }) => (
              <TimeSlot
                time={`${timeSlot["startTime"]} - ${timeSlot["endTime"]}`}
                status={`${timeSlot["status"]}`}
                onSelect={updateTimeSlotSelect}
                key={`${timeSlot["date"]}T${timeSlot["startTime"]}`}
              ></TimeSlot>
            )
          )}
        </div>
        <div className="mt-3 w-full flex flex-column justify-center">
          <div className="w-fit max-w-md flex flex-row justify-around">
            <div className="mr-2 ml-2 flex flex-row items-center">
              <span className="w-[10] h-[10] bg-red-500"></span>
              <label className="ml-2">Booked</label>
            </div>
            <div className="mr-2 ml-2 flex flex-row items-center">
              <span className="w-[10] h-[10] bg-black"></span>
              <label className="ml-2">Selected</label>
            </div>
            <div className="mr-2 ml-2 flex flex-row items-center">
              <span className="w-[10] h-[10] bg-blue-500"></span>
              <label className="ml-2">Available</label>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 w-full">
        <button
          onClick={handleBookAction}
          className="w-full pt-2 pb-2 bg-slate-900 text-white rounded-lg hover:bg-black cursor-pointer"
        >
          Book
        </button>
      </div>
    </div>
  );
}
