import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/** Libera as rotas filhas só para usuário autenticado; caso contrário, manda para /login. */
export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { autenticado, verificando } = useAuth();
  const location = useLocation();

  if (!autenticado && verificando) {
    return <p className="carregando" role="status">Verificando sua sessão…</p>;
  }
  if (!autenticado) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return children ? <>{children}</> : <Outlet />;
}
