"use client";
import { useEffect, useRef, useState } from "react";
import "../app/globals.css";

export default function SearchBox({
  onQueryChange,
}: {
  onQueryChange: (searchRoomType: string, searchBuilding: string) => void;
}) {
  const [searchBuilding, setSearchBuilding] = useState("");
  const [searchRoomType, setSearchRoomType] = useState("");
  const [ssaList, setSsaList] = useState([]);
  const [roomTypeList, setRoomTypeList] = useState([]);

  /* Hook to get all room type */
  useEffect(() => {
    const getRoomTypeList = async () => {
      return await fetch(`${process.env.apiGatewayHost}/room/type`)
        .then((res) => res.json())
        .then((res) => {
          if (res?.data) {
            return res?.data;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    };

    getRoomTypeList()
      .then((data) => {
        setRoomTypeList(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  /* Hook to get all self study area of university */
  useEffect(() => {
    const getSsaList = async () => {
      return await fetch(`${process.env.apiGatewayHost}/self-study-area`)
        .then((res) => res.json())
        .then((res) => {
          if (res?.data) {
            return res?.data;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    };

    getSsaList()
      .then((data) => {
        setSsaList(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const updateSearchBuilding = (e: any) => {
    setSearchBuilding(e.target.value);
  };
  const updateRoomType = (e: any) => {
    setSearchRoomType(e.target.value);
  };

  const getBookingQuery = () => {
    onQueryChange(searchRoomType, searchBuilding);
  };

  return (
    <div className="w-full lg:w-fit lg:min-w-xs lg:h-fit mt-[20] flex flex-col bg-slate-900 p-4 rounded-lg">
      <div className="flex flex-col text-sm">
        <label
          htmlFor="building-select"
          className="mb-1 text-xs font-semibold text-yellow-400"
        >
          Choose building
        </label>
        <select
          name="building-select"
          id="building-select"
          className="w-full border-[1] p-1 rounded-sm text-white bg-slate-950 outline-none hover:border-yellow-400"
          onChange={updateSearchBuilding}
          defaultValue={""}
        >
          <option value="" disabled className="hidden"></option>
          {ssaList.map((item: { id: string; building: string }) => (
            <option value={item.id} key={item.id}>
              Building {item.building}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col mt-3 text-sm">
        <label
          htmlFor="date-select"
          className="mb-1 text-xs font-semibold text-yellow-400"
        >
          Choose room type
        </label>
        <select
          name="room-type-select"
          id="room-type-select"
          className="w-full border-[1] p-1 rounded-sm text-white bg-slate-950 outline-none hover:border-yellow-400"
          onChange={updateRoomType}
          defaultValue={""}
        >
          <option value="" disabled className="hidden"></option>
          {roomTypeList.map((roomType: string) => (
            <option value={roomType} key={roomType}>
              {roomType}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center mt-3 text-sm">
        <button
          className="pt-2 pb-2 pl-4 pr-4 bg-white text-black rounded-lg cursor-pointer hover:bg-yellow-400"
          onClick={getBookingQuery}
        >
          Search
        </button>
      </div>
    </div>
  );
}
