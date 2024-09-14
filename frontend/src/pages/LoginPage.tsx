import React from "react";
import { useLogin } from "../context/UserContext";
import { GoogleIcon } from "../components/Icons";
import logo from "/logov1.png";

const LoginPage: React.FC = () => {
  const { login, loading } = useLogin();

  if (loading) {
    return <div>Logging In...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Left Side - Logo */}
      <div className="bg-gray- flex w-1/2 items-center justify-center">
        <img src={logo} alt="Logo" className="h-1/2" />
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex w-1/2 flex-col justify-center bg-white pl-10 text-2xl">
        <p>Hello,</p>
        <h2 className="mb-6 mt-3 text-3xl font-bold">
          Sign into Creator Economy Platform
        </h2>
        <button
          className="flex w-full max-w-sm items-center gap-5 rounded-md bg-gray-100 px-6 py-3 text-xl font-semibold text-blue-600 hover:bg-gray-200"
          onClick={login}
        >
          <GoogleIcon className="h-10" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
