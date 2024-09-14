import React, { useRef, useState } from "react";
import { DropdownIcon, UserIcon } from "../Icons";
import CopyToClipboard from "../CopyToClipboard";
import { Link } from "react-router-dom";

import LogoImg from "/logov1.png";

interface HeaderProps {
  address: string;
  logOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ address, logOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed top-0 z-10 flex h-[113px] w-full items-center justify-between bg-[#604CC3] px-10 shadow-sm">
      <div>
        <Link to="/">
          <img src={LogoImg} className="ml-5 w-12" alt="Logo" />
        </Link>
      </div>
      <div className="flex items-center gap-8 text-white">
        <Link to="/" className="text-xl font-medium">
          Home
        </Link>
        <div className="relative flex items-center gap-4">
          <Link to="/profile">
            <UserIcon className="h-10 cursor-pointer" />
          </Link>
          {/* <span
          className="cursor-pointer text-lg font-medium"
          onClick={() => setIsOpen(!isOpen)}
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </span> */}
          <button onClick={() => setIsOpen(!isOpen)}>
            <DropdownIcon
              className={`transform cursor-pointer duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-10 top-10 mt-10 w-48 rounded-lg bg-white p-4 text-black shadow-lg"
          >
            <div className="mb-2 flex items-center justify-between">
              <span>
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <CopyToClipboard textToCopy={address} />
            </div>
            <hr className="my-2" />
            <Link to="/profile">
              <div className="mb-2 flex items-center justify-between">
                Profile
              </div>
            </Link>
            <hr className="my-2" />
            <button
              onClick={logOut}
              className="w-full rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
