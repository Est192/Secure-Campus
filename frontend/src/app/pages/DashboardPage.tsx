import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  GraduationCap,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { campusService } from "../../services/mock/campusService";
import type {
  ActivityRecord,
  CourseRecord,
  StatRecord,
} from "../../types/campus";
import { StatCard } from "../../components/dashboard/StatCard";
import { Button } from "../../components/ui/button";
import { ActionDialog } from "../../components/dialogs/ActionDialog";

type LayoutContext = { notify: (message: string) => void };

const chartValues = [52, 60, 58, 72, 68, 80, 76, 88, 82, 91, 86, 94];

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { notify } = useOutletContext<LayoutContext>();
  const [stats, setStats] = useState<StatRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [activity, setActivity] = useState<ActivityRecord[]>([]);
  const [action, setAction] = useState("");
  const [role, setRole] = useState("student");

  useEffect(() => {
    void Promise.all([
      campusService.getStatistics(),
      campusService.getCourses(),
      campusService.getActivity(),
    ]).then(([nextStats, nextCourses, nextActivity]) => {
      setStats(nextStats);
      setCourses(nextCourses);
      setActivity(nextActivity);
    });
  }, []);

  const today = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: "full",
  }).format(new Date());

  return (
    <>
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-blue-700">{today}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("dashboard.greeting", { name: t("profile.firstName") })}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="role-switcher">
            {t("dashboard.roleSwitcher")}
          </label>
          <select
            className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
            id="role-switcher"
            onChange={(event) => setRole(event.target.value)}
            value={role}
          >
            {["student", "teacher", "head", "admin"].map((roleName) => (
              <option key={roleName} value={roleName}>
                {t(`roles.${roleName}`)}
              </option>
            ))}
          </select>
          <span className="self-center text-xs text-slate-500">
            {t("dashboard.rolePreview", { role: t(`roles.${role}`) })}
          </span>
          <Button onClick={() => setAction("newRequest")} size="sm">
            <Plus aria-hidden="true" size={15} />
            {t("dashboard.newRequest")}
          </Button>
        </div>
      </section>

      <section
        aria-label={t("dashboard.statistics")}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
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
          <div
            aria-label={t("performance.chartDescription")}
            className="mt-6 flex h-48 items-end gap-2"
            role="img"
          >
            {chartValues.map((value, index) => (
              <div className="flex h-full flex-1 flex-col justify-end" key={index}>
                <span
                  className="rounded-t-md bg-blue-700/85"
                  style={{ height: `${value}%` }}
                />
                <span className="mt-2 text-center text-[10px] text-slate-500">
                  {t(`chart.months.${index}`)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold">{t("activity.title")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t("activity.subtitle")}</p>
            </div>
            <button
              className="text-sm font-semibold text-blue-700 hover:underline"
              onClick={() => notify(t("activity.allOpened"))}
            >
              {t("common.viewAll")}
            </button>
          </div>
          <div className="mt-5 flex flex-col gap-5">
            {activity.map((item) => (
              <div className="flex gap-3" key={item.id}>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                    item.tone === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : item.tone === "info"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {item.tone === "success" ? (
                    <CheckCircle2 aria-hidden="true" size={17} />
                  ) : item.tone === "info" ? (
                    <FileText aria-hidden="true" size={17} />
                  ) : (
                    <ClipboardList aria-hidden="true" size={17} />
                  )}
                </span>
                <span>
                  <span className="block text-sm font-medium">{t(item.titleKey)}</span>
                  <span className="mt-0.5 block text-xs text-slate-600">
                    {t(item.detailKey)}
                  </span>
                  <span className="mt-1 block text-[11px] text-slate-500">
                    {t(item.timeKey)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
          <div>
            <h2 className="font-semibold">{t("courses.title")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("courses.subtitle")}</p>
          </div>
          <Button
            onClick={() => notify(t("courses.exportReady"))}
            size="sm"
            variant="outline"
          >
            <Download aria-hidden="true" size={15} />
            {t("courses.export")}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                {["course", "instructor", "credits", "progress", "grade"].map((column) => (
                  <th className="px-5 py-3 font-medium" key={column} scope="col">
                    {t(`courses.${column}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => (
                <tr className="hover:bg-slate-50/70" key={course.id}>
                  <td className="px-5 py-4">
                    <span className="font-medium">{course.code}</span>
                    <span className="ml-2 text-slate-600">{t(course.titleKey)}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{t(course.instructorKey)}</td>
                  <td className="px-5 py-4 text-slate-600">{course.credits}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-3">
                      <span className="h-1.5 w-20 rounded-full bg-slate-100">
                        <span
                          className="block h-1.5 rounded-full bg-blue-700"
                          style={{ width: `${course.progress}%` }}
                        />
                      </span>
                      <span className="text-xs text-slate-600">{course.progress}%</span>
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                      {course.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { key: "quickActions.documents", icon: FileText, action: "uploadDocument" },
          { key: "quickActions.calendar", icon: CalendarDays, action: "browseCalendar" },
          { key: "quickActions.academics", icon: GraduationCap, action: "browseAcademics" },
        ].map(({ key, icon: Icon, action: actionKey }) => (
          <button
            className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/30"
            key={key}
            onClick={() => setAction(actionKey)}
          >
            <Icon aria-hidden="true" className="text-blue-700" size={20} />
            <span className="text-sm font-semibold">{t(`${key}.title`)}</span>
          </button>
        ))}
      </section>

      {action && (
        <ActionDialog
          action={action}
          onClose={() => setAction("")}
          onComplete={(message) => {
            setAction("");
            notify(message);
          }}
        />
      )}
    </>
  );
}
