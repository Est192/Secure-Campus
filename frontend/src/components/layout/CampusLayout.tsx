import { useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { SupportedLanguage } from "../../i18n";
import { languageNames, supportedLanguages } from "../../i18n";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  {
    titleKey: "navigation.overview",
    links: [{ to: "/", labelKey: "navigation.dashboard", icon: LayoutDashboard }],
  },
  {
    titleKey: "navigation.academic",
    links: [
      { to: "/academics", labelKey: "navigation.academics", icon: BookOpen },
      { to: "/grades", labelKey: "navigation.grades", icon: GraduationCap },
      { to: "/documents", labelKey: "navigation.documents", icon: FileText },
      { to: "/requests", labelKey: "navigation.requests", icon: ClipboardCheck },
      { to: "/calendar", labelKey: "navigation.calendar", icon: CalendarDays },
    ],
  },
  {
    titleKey: "navigation.management",
    links: [
      { to: "/people", labelKey: "navigation.people", icon: Users },
      { to: "/groups", labelKey: "navigation.academicGroups", icon: Users },
      {
        to: "/reports",
        labelKey: "navigation.reports",
        icon: ChartNoAxesColumnIncreasing,
      },
    ],
  },
];

export function CampusLayout() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const profileName = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ");
  const profileInitials = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || profileName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const profileRoleKey = user?.role?.name === "Administrator"
    ? "roles.admin"
    : user?.role?.name === "Teacher"
      ? "roles.teacher"
      : user?.role?.name === "Department Head"
        ? "roles.head"
        : "roles.student";

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {sidebarOpen && (
        <button
          aria-label={t("common.closeNavigation")}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white px-3 transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2 py-5">
          <NavLink aria-label={t("brand.name")} className="flex items-center gap-3" to="/">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-lg shadow-blue-900/15">
              <ShieldCheck aria-hidden="true" size={22} />
            </span>
            <span>
              <span className="block font-semibold tracking-tight">{t("brand.name")}</span>
              <span className="block text-xs text-slate-500">{t("brand.tagline")}</span>
            </span>
          </NavLink>
          <button
            aria-label={t("common.closeNavigation")}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <nav aria-label={t("navigation.primary")} className="flex-1 overflow-y-auto py-4">
          {navigation.map((section) => (
            <section className="mb-6" key={section.titleKey}>
              <h2 className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {t(section.titleKey)}
              </h2>
              <div className="flex flex-col gap-1">
                {section.links.map(({ to, labelKey, icon: Icon }) => (
                  <NavLink
                    end={to === "/"}
                    key={to}
                    onClick={() => setSidebarOpen(false)}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-800"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                      }`
                    }
                  >
                    <Icon aria-hidden="true" size={17} />
                    {t(labelKey)}
                  </NavLink>
                ))}
              </div>
            </section>
          ))}
        </nav>

        <div className="border-t border-slate-100 py-4">
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                isActive ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-50"
              }`
            }
            to="/settings"
          >
            <Settings aria-hidden="true" size={17} />
            {t("navigation.settings")}
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                isActive ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-50"
              }`
            }
            to="/help"
          >
            <LifeBuoy aria-hidden="true" size={17} />
            {t("navigation.help")}
          </NavLink>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
            {profileInitials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold">{profileName}</span>
            <span className="block truncate text-[11px] text-slate-500">{t(profileRoleKey)}</span>
          </span>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label={t("common.openNavigation")}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu aria-hidden="true" size={20} />
            </button>
            <label className="relative hidden sm:block">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                aria-label={t("common.search")}
                className="h-9 w-64 rounded-lg border border-transparent bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-blue-200"
                placeholder={t("common.searchPlaceholder")}
              />
            </label>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <label className="sr-only" htmlFor="language-selector">
              {t("language.label")}
            </label>
            <select
              aria-label={t("language.label")}
              className="max-w-32 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700"
              id="language-selector"
              onChange={(event) => void i18n.changeLanguage(event.target.value)}
              value={supportedLanguages.find((item) => item === i18n.resolvedLanguage) ?? "en-US"}
            >
              {supportedLanguages.map((language: SupportedLanguage) => (
                <option key={language} value={language}>
                  {t(languageNames[language])}
                </option>
              ))}
            </select>

            <div className="relative">
              <button
                aria-expanded={notificationsOpen}
                aria-label={t("common.notifications")}
                className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  setProfileOpen(false);
                }}
              >
                <Bell aria-hidden="true" size={18} />
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                  <h2 className="text-sm font-semibold">{t("notifications.title")}</h2>
                  <p className="mt-2 text-sm text-slate-600">{t("dashboardData.notificationsUnavailable")}</p>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                aria-expanded={profileOpen}
                aria-label={t("common.openProfileMenu")}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100"
                onClick={() => {
                  setProfileOpen((open) => !open);
                  setNotificationsOpen(false);
                }}
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-800">
                  {profileInitials}
                </span>
                <ChevronDown aria-hidden="true" size={15} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="border-b border-slate-100 px-3 py-3">
                    <p className="text-sm font-semibold">{profileName}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{user?.email}</p>
                    <p className="mt-1 text-xs text-slate-500">{t(profileRoleKey)}</p>
                  </div>
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                    onClick={async () => {
                      setProfileOpen(false);
                      try {
                        await logout();
                      } catch {
                        notify(t("login.logoutError"));
                      }
                      navigate("/login", { replace: true });
                    }}
                  >
                    <LogOut aria-hidden="true" size={16} />
                    {t("navigation.signOut")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-8 lg:px-10">
          <Outlet context={{ notify }} />
        </main>
      </div>

      {toast && (
        <div
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-xl"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}