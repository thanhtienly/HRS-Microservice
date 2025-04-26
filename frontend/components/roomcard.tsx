"use client";

import "../app/globals.css";
import Image from "next/image";

export default function RoomCard(props: {
  roomName: string;
  roomBuilding: string;
  roomFloor: number;
  roomType: string;
  roomCapacity: number;
  roomId: string;
}) {
  return (
    <div className="w-full sm:w-fit h-fit flex flex-col justify-center p-4 mb-[20] sm:ml-[0] sm:mr-[30] border-[1] rounded-lg">
      <div className="w-full flex flex-col mt-2">
        <p id="roomName">
          <b>Room Name:</b> {props.roomName}
        </p>
        <p id="building">
          <b>Building:</b> {props.roomBuilding}
        </p>
        <p id="roomFloor">
          <b>Floor:</b> {props.roomFloor}
        </p>
        <p id="roomType">
          <b>Room type:</b> {props.roomType}
        </p>
        <p id="roomCapacity">
          <b>Capacity:</b> {props.roomCapacity}
        </p>
        <div className="w-full flex justify-center mt-2">
          <a
            href={`/room/${props.roomId}`}
            className="pt-2 pb-2 pl-4 pr-4 bg-slate-900 text-white rounded-lg hover:bg-yellow-400 hover:text-black"
          >
            Book now
          </a>
        </div>
      </div>
    </div>
  );
}
