import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/api";

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const user = getCurrentUser();
  const token = localStorage.getItem("token");

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
