import "../app/globals.css";

export default function Banner() {
  return (
    <div className="w-full min-h-screen bg-[url(/banner.jpg)] bg-center bg-no-repeat">
      <div className="flex flex-col bg-[rgba(2,6,23,0.8)] text-white absolute top-1/4 mr-6 ml-6 p-8 rounded-lg">
        <p className="text-yellow-500 text-xl lg:text-4xl">
          Easiest way to book a study room at HCMUT
        </p>
        <p className="mt-3 lg:text-2xl">Step 1: Go to booking page</p>
        <p className="mt-1 lg:text-2xl">Step 2: Book a room</p>
        <p className="mt-1 lg:text-2xl">
          Step 3: Scan QR code to check-in the room
        </p>
        <div className="flex justify-center mt-6">
          <a
            href="/room"
            className="pt-2 pb-2 pl-4 pr-4 bg-white rounded-lg text-black hover:bg-yellow-400 lg:text-xl"
          >
            Book now
          </a>
        </div>
      </div>
    </div>
  );
}
