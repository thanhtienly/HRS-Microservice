"use client";
import { useEffect, useState } from "react";
import "../app/globals.css";
import { useParams } from "next/navigation";

export default function RoomDetailCard() {
  const params = useParams<{ roomId: string }>();
  const [roomData, setRoomData] = useState<{
    id: string;
    ssaId: string;
    name: string;
    capacity: number;
    type: string;
    floor: number;
    building: string;
  } | null>(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [reservationCount, setReservationCount] = useState(0);

  useEffect(() => {
    if (params?.roomId) {
      const getRoomReservedCount = async () => {
        return await fetch(
          `${process.env.apiGatewayHost}/booking/total?roomId=${params?.roomId}`
        )
          .then((res) => res.json())
          .then((res: { success: boolean; data: any; message: string }) => {
            console.log;
            if (res.success) {
              return res.data;
            }
          })
          .catch((err) => {});
      };

      getRoomReservedCount()
        .then((data) => {
          setReservationCount(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [params?.roomId]);

  useEffect(() => {
    if (params?.roomId) {
      const getRoomDetail = async () => {
        return await fetch(
          `${process.env.apiGatewayHost}/room/${params.roomId}`
        )
          .then((res) => res.json())
          .then((res: { success: boolean; data: any; message: string }) => {
            console.log;
            if (res.success) {
              return res.data;
            }
          })
          .catch((err) => {});
      };

      getRoomDetail()
        .then((data) => {
          setRoomData(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [params?.roomId]);

  if (roomData) {
    return (
      <div className="w-full lg:w-fit lg:min-w-xs lg:h-fit mt-[20] flex flex-col bg-slate-900 p-4 rounded-lg text-sm text-white shadow-xl">
        <p id="roomName">
          <b className="text-yellow-400">Room Name: </b>
          {roomData?.name}
        </p>
        <p id="building">
          <b className="text-yellow-400">Building: </b>
          {roomData?.building}
        </p>
        <p id="roomFloor">
          <b className="text-yellow-400">Floor: </b>
          {roomData?.floor}
        </p>
        <p id="roomType">
          <b className="text-yellow-400">Room type: </b>
          {roomData?.type}
        </p>
        <p id="roomCapacity">
          <b className="text-yellow-400">Capacity: </b>
          {roomData?.capacity}
        </p>
        <div className="flex flex-row justify-end italic font-bold mt-2">
          <p>Total reservations: </p>
          <p className="ml-2 text-yellow-400">{reservationCount}</p>
        </div>
      </div>
    );
  }
  return <div></div>;
}
