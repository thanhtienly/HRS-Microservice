import { useEffect, useState } from "react";

export default function SuccessNotification(props: {
  message?: string;
  duration: number;
  onTimeOut: (isVisible: boolean) => void;
}) {
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    if (props.message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        props.onTimeOut(false);
      }, props.duration);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [props.duration]);
  return (
    <div
      className={`w-[200] fixed flex flex-col text-black bg-green-500 rounded-md ${
        isVisible
          ? "animate-fade-in top-[75] right-[20]"
          : "hidden top-[75] right-[0]"
      }`}
    >
      <div className="pt-2 pb-2 pl-3 pr-3 w-full">
        <p>{props.message}</p>
      </div>
    </div>
  );
}
