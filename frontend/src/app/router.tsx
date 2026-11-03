import { createBrowserRouter, Navigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { CampusLayout } from "../components/layout/CampusLayout";
import { CalendarPage } from "./pages/CalendarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HelpPage } from "./pages/HelpPage";
import { LoginPage } from "./pages/LoginPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ResourcePage } from "./pages/ResourcePage";
import { SettingsPage } from "./pages/SettingsPage";

function RequireAuth() {
  const { user, isRestoring } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (isRestoring) {
    return <div aria-live="polite" className="sr-only" role="status">{t("login.restoringSession")}</div>;
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <RequireAuth />,
    children: [
      {
        element: <CampusLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/:section", element: <ResourcePage /> },
          { path: "/reports", element: <ReportsPage /> },
          { path: "/calendar", element: <CalendarPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/help", element: <HelpPage /> },
        ],
      },
    ],
  },
  { path: "/login", element: <LoginPage /> },
]);
