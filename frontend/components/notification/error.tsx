import { useEffect, useState } from "react";

export default function ErrorNotification(props: {
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
      className={`min-w-[200] max-w-[250] fixed flex flex-col text-white bg-red-500 rounded-md border-l-10 border-red-700 z-200 ${
        isVisible
          ? "animate-fade-in top-[75] right-[20]"
          : "hidden top-[75] right-[0]"
      }`}
    >
      <div className="pt-2 pb-2 pl-3 pr-3 w-full">
        <p className="whitespace-pre-line">{props.message}</p>
      </div>
    </div>
  );
}
