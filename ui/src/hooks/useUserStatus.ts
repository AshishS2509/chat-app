import { useState, useEffect } from "react";
import { getUserData } from "../lib/user.localStorage";

interface UserStatusState {
  online: boolean;
  connected: boolean;
  loggedIn: boolean;
}

export const useUserStatus = () => {
  const data = getUserData();
  const [userStatus, setUserStatus] = useState<UserStatusState>({
    online: false,
    connected: false,
    loggedIn: !!data?.isLoggedIn,
  });

  useEffect(() => {
    const handleOnline = () => {
      setUserStatus((prev) => ({
        ...prev,
        online: true,
      }));
    };

    const handleOffline = () => {
      setUserStatus((prev) => ({
        ...prev,
        online: false,
      }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const setStatus = (status: boolean) => {
    setUserStatus((prev) => ({ ...prev, status }));
  };

  const setLoggedIn = (loggedIn: boolean) => {
    setUserStatus((prev) => ({ ...prev, loggedIn }));
  };

  const setConnected = (connected: boolean) => {
    setUserStatus((prev) => ({ ...prev, connected }));
  };
  return { ...userStatus, setStatus, setLoggedIn, setConnected };
};
