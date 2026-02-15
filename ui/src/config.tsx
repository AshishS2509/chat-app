import { useCallback, useEffect } from "react";
import { checkAuth } from "./api/auth";
import { useAppDispatch } from "./store";
import { login } from "./store/auth-slice";
import { useNavigate } from "react-router";

function ConfigProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const checkAuthentication = useCallback(async () => {
    try {
      if (window.location.pathname === "/register") {
        return;
      }
      const resp = await checkAuth();
      if (!resp) {
        navigate("/login");
        return;
      }
      dispatch(login(resp));
      navigate("/");
    } catch {
      navigate("/login");
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);
  return <>{children}</>;
}
export default ConfigProvider;
