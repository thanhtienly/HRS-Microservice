"use client";
import "../app/globals.css";
import Image from "next/image";
import { Menu } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useGetCookie, useDeleteCookie } from "cookies-next";

export default function Navbar() {
  const router = useRouter();
  const getCookie = useGetCookie();
  const deleteCookie = useDeleteCookie();
  const [hidden, setHidden] = useState(true);
  const [isLogin, setLogin] = useState(false);

  const handleScreenSize = () => {
    const width = window.innerWidth;
    if (width < 1280) {
      setHidden(true);
      return;
    }
    setHidden(false);
    return;
  };

  const handleLogOut = () => {
    deleteCookie("accessToken");
    deleteCookie("refreshToken");
    console.log("Reload");
    router.reload();
  };

  /* Check if user login */
  useEffect(() => {
    const accessToken = getCookie("accessToken");
    if (accessToken) {
      setLogin(true);
    }
  }, [getCookie]);

  /* Onload event to show or hide navbar items */
  useEffect(() => {
    if (typeof window !== "undefined") {
      handleScreenSize();
    }
  }, []);

  /* Resize screen event to show or hide navbar items */
  useEffect(() => {
    window.addEventListener("resize", handleScreenSize);

    return () => window.removeEventListener("resize", handleScreenSize);
  }, []);

  const handleExpandNavBar = () => {
    if (hidden) {
      setHidden(!hidden);
      return;
    }
    setHidden(!hidden);
  };

  return (
    <nav className="fixed w-full bg-slate-900 p-2 flex flex-wrap items-center xl:flex-row sm:flex-col z-100">
      <div className="logo-container flex flex-row w-full xl:w-1/3">
        <div className="wrap-logo w-1/2">
          <a href="/" className="flex max-w-fit">
            <Image
              src={`/logo.jpg`}
              alt="Logo"
              width={100}
              height={50}
              className="ml-4"
            />
          </a>
        </div>
        <div className="wrap-expand w-1/2 flex justify-end xl:hidden">
          <div onClick={handleExpandNavBar}>
            <Menu
              fontSize="large"
              className="cursor-pointer"
              sx={{ color: "white" }}
            />
          </div>
        </div>
      </div>
      <div
        className={`page flex flex-col justify-start xl:flex-row xl:justify-center w-full xl:w-1/3 ${
          hidden ? "hidden" : ""
        }`}
      >
        <a
          href="/room"
          className="ml-4 mr-4 mt-1 mb-1 p-2 cursor-pointer text-white hover:bg-yellow-400 hover:text-slate-950 hover:rounded-md"
        >
          Booking
        </a>
        <a
          href="/booking-history"
          className="ml-4 mr-4 mt-1 mb-1 p-2 cursor-pointer text-white hover:bg-yellow-400 hover:text-slate-950 hover:rounded-md"
        >
          History
        </a>
      </div>
      <div
        className={`auth flex justify-start xl:justify-end w-full xl:w-1/3 ${
          hidden ? "hidden" : ""
        }`}
      >
        {isLogin == false && (
          <a
            className="ml-4 mr-4 mt-1 mb-1 cursor-pointer pt-2 pb-2 pl-4 pr-4 bg-white text-slate-950 rounded-lg hover:bg-yellow-400"
            href="/login"
          >
            Login
          </a>
        )}

        {isLogin && (
          <button
            className="ml-4 mr-4 mt-1 mb-1 cursor-pointer pt-2 pb-2 pl-4 pr-4 bg-white text-slate-950 rounded-lg hover:bg-yellow-400"
            onClick={handleLogOut}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
