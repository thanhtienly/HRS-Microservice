"use client";
import { useEffect, useRef, useState } from "react";
import { Close } from "@mui/icons-material";
import { getCookie } from "cookies-next/client";
import "../app/globals.css";
import { error } from "console";

export default function InviteModal(props: {
  isOpenModal: boolean;
  reservationId: string;
  secret: string;
  onClose: (isOpenModal: boolean) => void;
  onError: (isError: boolean, errorMessage?: string) => void;
  onSuccess: (isSuccess: boolean, successMessage?: string) => void;
}) {
  const [accessToken, setAccessToken] = useState("");
  const [isOpenModal, setOpenModalState] = useState(false);
  const [reservationId, setReservationId] = useState("");
  const [reservationSecret, setReservationSecret] = useState("");
  const [isSearchSuccess, setSearchSuccess] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState("");
  const [searchStudentInfo, setSearchStudentInfo] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    isVerify: boolean;
    studentId: string;
    verifiedAt: number;
  }>();
  const [inviteList, setInviteList] = useState<any>([]);

  const [participants, setParticipants] = useState<any>([]);

  /* Check if user logged in */
  useEffect(() => {
    var token = getCookie("accessToken");

    if (token) {
      setAccessToken(token);
      return;
    }
  }, []);

  useEffect(() => {
    if (props.reservationId) {
      setReservationId(props.reservationId);
    }
  }, [props.reservationId]);

  useEffect(() => {
    if (props.secret) {
      setReservationSecret(props.secret);
    }
  }, [props.secret]);

  useEffect(() => {
    console.log(`Current reservationId is ${reservationId}`);
  }, [reservationId]);

  useEffect(() => {
    console.log(`Current secret is ${reservationSecret}`);
    if (accessToken && reservationSecret && inviteList.length == 0) {
      fetchParticipants()
        .then((data) => {
          setParticipants(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [reservationSecret, accessToken, inviteList]);

  useEffect(() => {
    if (props.isOpenModal == true) {
      setOpenModalState(true);
    }
  }, [props.isOpenModal]);

  useEffect(() => {
    console.log(inviteList);
  }, [inviteList]);

  const fetchParticipants = async () => {
    return await fetch(`${process.env.apiGatewayHost}/booking/participants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        secret: reservationSecret,
      }),
    })
      .then((res) => res.json())
      .then((res: { success: boolean; data?: any; message?: string }) => {
        if (res.success) {
          return res.data;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchStudentInfo = async (studentId: string) => {
    await fetch(
      `${process.env.apiGatewayHost}/auth/student/find-by-student-id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          studentId: studentId,
        }),
      }
    )
      .then((res) => res.json())
      .then((res: { success: boolean; data?: any; message?: string }) => {
        if (res.success) {
          setSearchStudentInfo(res.data);
          setSearchSuccess(true);
          return;
        }

        props.onError(true, res.message);
      })
      .catch((error) => {
        props.onError(true, "Internal Server Error");
      });
  };

  const handleCloseModal = () => {
    setOpenModalState(false);
    props.onClose(false);
  };

  const handleChooseStudent = (e: any) => {
    e.preventDefault();
    if (!isSearchSuccess) {
      return;
    }

    const target = e.target;
    const classList = Array.from(target.classList);
    if (classList.indexOf("studentInfo") == -1) {
      setSearchSuccess(false);
      setStudentIdInput("");
      return;
    }

    var isExist = false;
    inviteList.forEach(
      (student: {
        email: string;
        firstName: string;
        lastName: string;
        gender: string;
        isVerify: boolean;
        studentId: string;
        verifiedAt: number;
      }) => {
        if (student.studentId == searchStudentInfo?.studentId) {
          isExist = true;
        }
      }
    );

    if (!isExist) {
      setInviteList([...inviteList, searchStudentInfo]);
    }
    setSearchSuccess(false);
    setStudentIdInput("");
  };

  const handleStudentIdInput = (e: any) => {
    setStudentIdInput(e.target.value);
  };

  const handleRemoveInvitation = (e: any) => {
    console.log(e.target);
    const studentId = e.target.value;

    console.log(studentId);
    setInviteList(
      inviteList.filter(
        (student: {
          email: string;
          firstName: string;
          lastName: string;
          gender: string;
          isVerify: boolean;
          studentId: string;
          verifiedAt: number;
        }) => student.studentId != studentId
      )
    );
  };

  const findStudent = async (e: any) => {
    const input = e.target.value;

    if (!input.match(/^[0-9]{7}$/)) {
      setSearchSuccess(false);
      return;
    }

    setStudentIdInput(input);
    await fetchStudentInfo(studentIdInput);
  };

  const sendInvitation = async () => {
    const participants = inviteList.map(
      (student: {
        email: string;
        firstName: string;
        lastName: string;
        gender: string;
        isVerify: boolean;
        studentId: string;
        verifiedAt: number;
      }) => {
        return { email: student.email, studentId: student.studentId };
      }
    );
    await fetch(`${process.env.apiGatewayHost}/booking/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        participants: participants,
        reservationId: reservationId,
      }),
    })
      .then((res) => res.json())
      .then((res: { success: boolean; data?: any; message?: string }) => {
        if (res.success) {
          props.onSuccess(true, "Send invitation successful");
          setInviteList([]);
          return;
        }

        props.onError(true, res.message);
      })
      .catch((err) => {
        props.onError(true, "Internal Server Error");
      });
  };

  return (
    <div
      className={`${
        isOpenModal ? "fixed" : "hidden"
      } top-0 left-0 w-full h-screen flex flex-row justify-center pt-[160] pb-[20] pl-[20] pr-[20] z-50 bg-[rgba(0,0,0,0.5)]`}
      onClick={handleChooseStudent}
    >
      <div className="w-full min-h-[300] h-fit lg:w-1/2 p-2 flex flex-col bg-white rounded-lg">
        <div className="w-full flex justify-end">
          <button
            className="p-1 w-fit h-fit flex justify-center items-center bg-slate-200 rounded-md cursor-pointer hover:bg-red-200"
            onClick={handleCloseModal}
          >
            <Close
              style={{
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </button>
        </div>

        <div className="mt-4 w-full text-sm">
          <label
            htmlFor="inviteSearch"
            className="text-xs font-semibold italic"
          >
            Search and invite your friends
          </label>
          <div className="w-full relative">
            <input
              type="text"
              name="inviteSearch"
              id="inviteSearch"
              className="h-[30] pt-1 pb-1 pl-2 pr-2  w-full border-[1] border-slate-900 rounded-md outline-none hover:border-blue-500 focus:border-blue-500"
              placeholder="Provide student id to search"
              onChange={handleStudentIdInput}
              onKeyUp={findStudent}
              value={studentIdInput}
            />
            <div
              className={`${
                isSearchSuccess ? "absolute" : "hidden"
              } top-[30] left-0 w-full pt-1 pb-2 pl-2 pr-2 bg-slate-200 flex flex-col italic`}
            >
              <div className="studentInfo mt-1 pt-1 pb-2 pl-2 flex flex-col md:flex-row cursor-pointer rounded-lg hover:bg-white">
                <p className="studentInfo mr-1 z-15">{`Name: ${searchStudentInfo?.firstName} ${searchStudentInfo?.lastName},`}</p>
                <p className="studentInfo mr-1">{`studentId: ${searchStudentInfo?.studentId},`}</p>
                <p className="studentInfo mr-1">{`gender: ${searchStudentInfo?.gender},`}</p>
                <p className="studentInfo mr-1">{`email: ${searchStudentInfo?.email}`}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 w-full flex flex-col text-sm">
          <p className="font-semibold">Participants List</p>
          <div className="w-full flex flex-col">
            {participants.map(
              (participant: {
                email: string;
                firstName: string;
                lastName: string;
                gender: string;
                isVerify: boolean;
                studentId: string;
                verifiedAt: number;
                state: string;
              }) => (
                <div className="mt-2 flex flex-col" key={participant.studentId}>
                  <div className="basis-full flex flex-row">
                    <p>
                      {`${participant.firstName} ${participant.lastName}`} -
                    </p>
                    <p className="ml-1"> {participant.studentId}</p>
                  </div>

                  <p className="italic text-xs">
                    <b>Status:</b> {participant.state}
                  </p>
                </div>
              )
            )}

            {inviteList.map(
              (student: {
                email: string;
                firstName: string;
                lastName: string;
                gender: string;
                isVerify: boolean;
                studentId: string;
                verifiedAt: number;
              }) => (
                <div className="mt-2 flex flex-row" key={student.studentId}>
                  <div className="basis-full flex flex-row">
                    <p>{`${student.firstName} ${student.lastName}`} -</p>
                    <p className="ml-1"> {student.studentId}</p>
                  </div>
                  <button
                    className="p-1 w-fit h-fit flex justify-center items-center bg-slate-200 rounded-md cursor-pointer hover:bg-red-200"
                    value={student.studentId}
                    onClick={handleRemoveInvitation}
                  >
                    <Close
                      style={{
                        width: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                      }}
                    />
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {inviteList.length != 0 && (
          <div className="mt-4 w-full flex flex-col items-center justify-center text-sm">
            <button
              className="pt-2 pb-2 pl-3 pr-3 bg-slate-900 text-white rounded-md cursor-pointer hover:bg-yellow-500 hover:text-black"
              onClick={sendInvitation}
            >
              Send Invitation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
