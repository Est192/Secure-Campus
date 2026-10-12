import { createBrowserRouter } from "react-router-dom";
import { CampusLayout } from "../components/layout/CampusLayout";
import { CalendarPage } from "./pages/CalendarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HelpPage } from "./pages/HelpPage";
import { LoginPage } from "./pages/LoginPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ResourcePage } from "./pages/ResourcePage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
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
  { path: "/login", element: <LoginPage /> },
]);
