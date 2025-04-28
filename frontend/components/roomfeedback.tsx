"use client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getCookie } from "cookies-next/client";
import errorMapping from "@/utils/error";

export default function RoomFeedback(props: {
  onError: (error: boolean, errorMessage: string | undefined) => void;
  onSuccess: (success: boolean, successMessage: string) => void;
}) {
  const params = useParams<{ roomId: string }>();
  const [accessToken, setAccessToken] = useState<string | null>();
  const [feedbackList, setFeedbackList] = useState([]);
  const feedbackRef = useRef<HTMLTextAreaElement>(null);

  const fetchFeedbacks = (roomId: string | undefined) => {
    if (roomId) {
      fetch(`${process.env.apiGatewayHost}/room/${roomId}/feedback`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            setFeedbackList(res.data);
            return;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  useEffect(() => {
    fetchFeedbacks(params?.roomId);
  }, [params?.roomId]);

  useEffect(() => {
    var token = getCookie("accessToken");

    if (token) {
      setAccessToken(token);
    }
  }, []);

  const submitFeedback = async (content: string) => {
    await fetch(
      `${process.env.apiGatewayHost}/room/${params?.roomId}/feedback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: content,
        }),
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((res: { success: boolean; data?: any; message?: string }) => {
        if (!res.success) {
          props.onError(true, errorMapping(res?.message));
          return;
        }
      })
      .catch((err) => {
        console.log(err);
      });

    fetchFeedbacks(params?.roomId);
  };

  const handleKeyDown = async (e: any) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      /* Clear text area */
      if (feedbackRef.current) {
        const feedback = feedbackRef.current.value;

        await submitFeedback(feedback);
        feedbackRef.current.value = "";
      }
    }
  };

  return (
    <div className="mt-[20] mb-[20] h-fit flex flex-col p-4 shadow-xl rounded-lg bg-yellow-100 text-sm lg:ml-[20] lg:w-1/3 lg:mr-[20]">
      <div className="flex flex-col">
        <label htmlFor="feedback" className="text-xs mb-1 italic font-bold">
          Your feedback
        </label>
        <textarea
          name="feedback"
          id="feedback"
          className="pt-1 pb-1 pl-2 pr-2 bg-white rounded-sm outline-none text-wrap resize-none"
          rows={2}
          placeholder="Input your feedback"
          onKeyDown={handleKeyDown}
          ref={feedbackRef}
        ></textarea>
      </div>
      <div className="flex flex-col">
        {feedbackList.map(
          (feedback: {
            id: string;
            studentName: string;
            date: string;
            content: string;
          }) => (
            <div
              className="mt-[10] flex flex-col pt-2 pb-2 pr-3 pl-3 bg-gray-50 rounded-md"
              key={feedback.id}
            >
              <div className="flex flex-row text-xs">
                <p className="w-1/2 text-left font-bold">
                  {feedback.studentName}
                </p>
                <p className="w-1/2 text-right italic">{feedback.date}</p>
              </div>
              <p>{feedback.content}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
