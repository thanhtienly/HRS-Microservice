import Navbar from "@/components/navbar";
import SearchBox from "@/components/searchbox";
import RoomCard from "@/components/roomcard";

import { useEffect, useState } from "react";

export default function RoomListPage() {
  const [searchRoomType, setSearchRoomType] = useState("");
  const [searchBuilding, setSearchBuilding] = useState("");
  const [roomList, setRoomList] = useState([]);

  const updateQuery = (searchRoomType: string, searchBuilding: string) => {
    setSearchRoomType(searchRoomType);
    setSearchBuilding(searchBuilding);
  };

  useEffect(() => {
    if (searchRoomType != "" && searchBuilding != "") {
      const getRoomList = async () => {
        return await fetch(
          `${process.env.apiGatewayHost}/room?ssaId=${searchBuilding}&roomType=${searchRoomType}`
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
      getRoomList()
        .then((data) => {
          setRoomList(data);
        })
        .catch((err) => {
          console.log(err);
        });
      return;
    }
  }, [searchRoomType, searchBuilding]);

  return (
    <div className="w-full lg:h-screen lg:overflow-hidden">
      <Navbar></Navbar>
      <div className="w-full lg:h-screen flex flex-col lg:flex-row pt-[80] pl-[20] pr-[20]">
        <SearchBox onQueryChange={updateQuery}></SearchBox>
        <div className="w-full lg:h-screen lg:overflow-scroll mt-[20] lg:pl-[50] flex flex-row flex-wrap justify-center md:justify-start content-start">
          {roomList.map(
            (room: {
              id: string;
              ssaId: string;
              name: string;
              capacity: number;
              type: string;
              floor: number;
              building: string;
            }) => (
              <RoomCard
                roomName={room.name}
                roomBuilding={room.building}
                roomFloor={room.floor}
                roomCapacity={room.capacity}
                roomType={room.type}
                roomId={room.id}
                key={room.id}
              ></RoomCard>
            )
          )}
        </div>
      </div>
    </div>
  );
}
