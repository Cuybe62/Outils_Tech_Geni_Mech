"use client";
import { useResponsive } from "../responsive/hooks/useResponsive";
import Item from "./item";
import { useEffect, useState } from "react";
import "./style.css";
import Footer from "./footer";
import Avatar from "./Avatar";
export default function AppLayout({ children }) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isDesktop)
    return (
      <div>
        <div>
          <div className="drawer lg:drawer-open ">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content ">
              <nav className=" shadow  navbar w-full bg-base-300  ">
                <label
                  htmlFor="my-drawer-4"
                  aria-label="open sidebar"
                  className="btn btn-square btn-ghost "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2"
                    fill="none"
                    stroke="currentColor"
                    className="my-1.5 inline-block size-4"
                  >
                    <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                    <path d="M9 4v16"></path>
                    <path d="M14 10l2 2l-2 2"></path>
                  </svg>
                </label>
                <div className=" px-4">Navbar Title</div>
              </nav>

              <div className=" flex flex-col min-h-screen  px-0 py-0">
                <div className="flex-grow bg-base-200">{children}</div>
                <Footer></Footer>
              </div>
            </div>

            <div className="drawer-side is-drawer-close:overflow-visible">
              <label
                htmlFor="my-drawer-4"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>

              <div className=" shadow flex h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
                <div className=" w-auto h-2/10 ">
                  <Item name="homePage"></Item>
                </div>
                <div className="Window w-full h-6/10 "></div>
                <div className="user w-full h-2/10 p-2 flex">
                  <Avatar></Avatar>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
