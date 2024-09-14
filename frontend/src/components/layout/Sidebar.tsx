import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  // DropdownIcon,
  // FireIcon,
  HomeIcon,
  HamburgerIcon,
  CrossIcon,
} from "../Icons"; // Add a CrossIcon and HamburgerIcon for hamburger

const menuItems = [
  { name: "Home", icon: <HomeIcon className="h-6 w-6" />, link: "/" },
  // {
  //   name: "Trending",
  //   icon: <FireIcon className="h-6 w-6" />,
  //   link: "/trending",
  // },
];
const topics = [
  { name: "Culture", link: "/topics/culture" },
  { name: "Games", link: "/topics/games" },
  { name: "Technology", link: "/topics/technology" },
  { name: "Sports", link: "/topics/sports" },
];

interface SidebarProps {
  onPageChange: (pageName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onPageChange }) => {
  const location = useLocation();
  const [isTopicsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to toggle sidebar visibility

  return (
    <>
      {/* Hamburger Icon */}
      <div className="fixed left-5 top-5 z-20 block md:hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white"
        >
          {isSidebarOpen ? (
            <CrossIcon className="h-8 w-8" /> // Icon to close sidebar
          ) : (
            <HamburgerIcon className="absolute h-8 w-8" /> // Icon to open sidebar
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed z-10 h-full w-[281px] transform bg-[#604CC3] transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:mt-20 md:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="ml-8 mt-20 flex flex-col">
            <ul>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.link;
                return (
                  <Link key={item.name} to={item.link}>
                    <li
                      className={`font-poppins flex cursor-pointer items-center px-3 py-5 text-base font-medium ${
                        isActive
                          ? "rounded-l-lg bg-white text-black"
                          : "text-white"
                      }`}
                      onClick={() => {
                        onPageChange(item.name);
                        setIsSidebarOpen(false); // Close sidebar on mobile after click
                      }}
                    >
                      <div className="ml-1">{item.icon}</div>
                      <span className="ml-4">{item.name}</span>
                    </li>
                  </Link>
                );
              })}
            </ul>
            {/* <hr className="my-4 border-t border-white" /> */}

            <div>
              {/* <div
                className="font-poppins flex cursor-pointer items-center justify-between px-3 py-5 text-base font-medium text-white"
                onClick={() => setIsTopicsOpen(!isTopicsOpen)}
              >
                <span className="ml-1">Topics</span>
                <DropdownIcon
                  className={`ml-4 h-5 w-5 transform duration-300 ${
                    isTopicsOpen ? "rotate-180" : ""
                  }`}
                />
              </div> */}

              {isTopicsOpen && (
                <ul className="ml-4 mt-2">
                  {topics.map((topic) => (
                    <Link key={topic.name} to={topic.link}>
                      <li
                        className={`font-poppins cursor-pointer rounded-lg px-3 py-3 text-base text-white hover:bg-white hover:text-black`}
                        onClick={() => {
                          onPageChange(topic.name);
                          setIsSidebarOpen(false); // Close sidebar on mobile after click
                        }}
                      >
                        {topic.name}
                      </li>
                    </Link>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop to close sidebar when clicked outside on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
