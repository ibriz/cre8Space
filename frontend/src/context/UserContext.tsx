import { useAuthCallback, useEnokiFlow, useZkLogin } from "@mysten/enoki/react";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { CrossIcon } from "../components/Icons";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;

interface LoginContextType {
  isLoggedIn: boolean;
  userDetails: UserDetails;
  login: () => void;
  logOut: () => void;
  loading: boolean;
}

const UserContext = createContext<LoginContextType | undefined>(undefined);

interface UserDetails {
  provider: string;
  salt: string;
  address: string;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserDetailsInitialValues = {
  provider: "",
  salt: "",
  address: "",
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const flow = useEnokiFlow();
  const zkLogin = useZkLogin();
  useAuthCallback();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserDetails>(
    UserDetailsInitialValues,
  );
  const [loading, setLoading] = useState<boolean>(true);

  const login = async () => {
    sessionStorage.setItem("login-state", "pending");
    window.location.href = await flow.createAuthorizationURL({
      provider: "google",
      clientId: GOOGLE_CLIENT_ID,
      redirectUrl: "https://localhost:5173",
      network: "testnet",
    });
  };

  const logOut = async () => {
    flow.logout();
    clearStates();
  };

  const clearStates = () => {
    setIsLoggedIn(false);
    setUserDetails(UserDetailsInitialValues);
    sessionStorage.clear();
  };

  useEffect(() => {
    const sessionUser = sessionStorage.getItem("userDetails");
    const sessionLoginState = sessionStorage.getItem("isLoggedIn");

    if (sessionUser && sessionLoginState === "true") {
      setUserDetails(JSON.parse(sessionUser));
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (zkLogin.address && zkLogin.salt && zkLogin.provider) {
      const userData = {
        provider: zkLogin.provider,
        salt: zkLogin.salt,
        address: zkLogin.address,
      };
      setUserDetails(userData);
      setIsLoggedIn(true);
      sessionStorage.setItem("userDetails", JSON.stringify(userData));
      sessionStorage.setItem("isLoggedIn", "true");
    }
    setLoading(false);
  }, [zkLogin.address]);

  const contextValue: LoginContextType = {
    isLoggedIn,
    userDetails,
    login,
    logOut,
    loading,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {loading ? (
        <div
          className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-white"
          style={{ content: " " }}
        >
          <div className="text-xl">Logging in...</div>
          <button
            className="absolute bottom-1 right-1 bg-black"
            onClick={logOut}
          >
            <CrossIcon className="w-10" />
          </button>
        </div>
      ) : (
        children
      )}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLogin = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useLogin must be used within UserProvider");
  }
  return context;
};
