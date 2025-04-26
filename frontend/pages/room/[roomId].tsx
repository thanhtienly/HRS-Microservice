import Navbar from "@/components/navbar";
import RoomDetailCard from "@/components/roomdetail";
import RoomBooking from "@/components/roombooking";
import RoomFeedback from "@/components/roomfeedback";

export default function RoomDetailPage() {
  return (
    <div className="w-full lg:h-screen lg:overflow-hidden">
      <Navbar></Navbar>
      <div className="w-full lg:h-screen flex flex-col lg:flex-row pt-[80] pb-[80] pl-[20] pr-[20]">
        <RoomDetailCard></RoomDetailCard>
        <div className="w-full lg:h-screen lg:overflow-scroll lg:pl-[50] flex flex-col lg:flex-row">
          <RoomBooking></RoomBooking>
          <RoomFeedback></RoomFeedback>
        </div>
      </div>
    </div>
  );
}
