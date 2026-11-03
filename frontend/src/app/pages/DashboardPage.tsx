import { useQuery } from "@tanstack/react-query";
import { CalendarDays, FileText, GraduationCap, Plus, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../../api/dashboardApi";
import { apiErrorMessage } from "../../lib/apiErrorMessage";
import { useAuth } from "../../context/AuthContext";
import type { DashboardStat } from "../../types/Dashboard";
import { StatCard } from "../../components/dashboard/StatCard";
import { Button } from "../../components/ui/button";

const quickActions = [
  { key: "quickActions.documents", icon: FileText, path: "/documents" },
  { key: "quickActions.calendar", icon: CalendarDays, path: "/calendar" },
  { key: "quickActions.academics", icon: GraduationCap, path: "/academics" },
];

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const overviewQuery = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardApi.getOverview,
  });
  const overview = overviewQuery.data;
  const stats: DashboardStat[] = [
    { id: "attendance", titleKey: "stats.attendance", value: "—", icon: "attendance", available: false },
    { id: "groups", titleKey: "academicGroupsPage.title", value: overview ? String(overview.academicGroupCount) : "—", icon: "courses", available: !!overview },
    { id: "requests", titleKey: "requestPage.statuses.Pending", value: overview ? String(overview.pendingRequests) : "—", icon: "requests", available: !!overview },
    { id: "documents", titleKey: "stats.documents", value: overview ? String(overview.documentCount) : "—", icon: "documents", available: !!overview },
  ];
  const today = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: "full",
  }).format(new Date());
  const displayName = user?.first_name || user?.name || "";

  return (
    <>
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-blue-700">{today}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("dashboard.greeting", { name: displayName })}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{t("dashboard.subtitle")}</p>
        </div>
        <Button onClick={() => navigate("/requests")} size="sm">
          <Plus aria-hidden="true" size={15} />
          {t("dashboard.newRequest")}
        </Button>
      </section>

      {overviewQuery.isError && (
        <p className="mb-4 text-sm text-red-700" role="alert">
          {apiErrorMessage(overviewQuery.error)}
        </p>
      )}

      <section
        aria-label={t("dashboard.statistics")}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => <StatCard key={stat.id} stat={stat} />)}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold">{t("performance.title")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t("performance.subtitle")}</p>
            </div>
            <TrendingUp aria-hidden="true" className="text-blue-700" size={20} />
          </div>
          {/* Attendance and performance history are not exposed by the current API. */}
          <p className="mt-6 text-sm text-slate-600">{t("dashboardData.chartUnavailable")}</p>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold">{t("activity.title")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t("activity.subtitle")}</p>
            </div>
          </div>
          {/* There is no activity feed endpoint or persisted activity source yet. */}
          <p className="mt-6 text-sm text-slate-600">{t("dashboardData.activityUnavailable")}</p>
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <h2 className="font-semibold">{t("academicGroupsPage.title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("pageDescriptions.academics")}</p>
        </div>
        {overviewQuery.isPending ? (
          <p aria-live="polite" className="p-6 text-sm text-slate-600">{t("dashboardData.loading")}</p>
        ) : overview ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    {["name", "program", "instructor", "year", "semester"].map((column) => (
                      <th className="px-5 py-3 font-medium" key={column} scope="col">
                        {t(`academicsPage.${column}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overview.academicGroups.map((group) => (
                    <tr className="hover:bg-slate-50/70" key={group.id}>
                      <td className="px-5 py-4 font-medium">{group.name}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {overview.degreePrograms.find((program) => program.id === group.degree_program_id)?.name ?? group.degree_program_id}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{group.teacher_id ?? "—"}</td>
                      <td className="px-5 py-4 text-slate-600">{group.academic_year}</td>
                      <td className="px-5 py-4 text-slate-600">{group.semester}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {overview.academicGroups.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-500">{t("academicsPage.empty")}</p>
            )}
          </>
        ) : (
          <p className="p-6 text-sm text-slate-600" role="alert">{t("dashboardData.unavailableData")}</p>
        )}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {quickActions.map(({ key, icon: Icon, path }) => (
          <button
            className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/30"
            key={key}
            onClick={() => navigate(path)}
            type="button"
          >
            <Icon aria-hidden="true" className="text-blue-700" size={20} />
            <span className="text-sm font-semibold">{t(`${key}.title`)}</span>
          </button>
        ))}
      </section>
    </>
  );
}
