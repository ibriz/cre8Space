import React from "react";
import Header from "./Header";
// import Sidebar from "./Sidebar";
import { useLogin } from "../../context/UserContext";
import AskQuestion from "../AskQuestion";
import LeaderBoard from "../LeaderBoard";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isLoggedIn, userDetails, logOut } = useLogin();

  return (
    <div className="flex min-h-screen flex-col">
      {isLoggedIn && <Header address={userDetails.address} logOut={logOut} />}
      <div className="flex flex-1 flex-col items-center md:flex-row md:items-start">
        {/* {isLoggedIn && <Sidebar onPageChange={() => {}} />} */}

        <div className={`flex-1 ${isLoggedIn ? "mt-[120px]" : ""} md:p-6`}>
          <main>{children}</main>
        </div>
        <div className="mb-40 md:my-[120px] md:mb-0 md:mr-[80px] md:w-[300px]">
          <LeaderBoard />
        </div>

        <div className="fixed bottom-10 right-[80px]">
          <AskQuestion />
        </div>
      </div>
    </div>
  );
};

export default Layout;
