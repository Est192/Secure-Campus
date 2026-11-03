import { CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CalendarPage() {
  const { t } = useTranslation();

  return (
    <>
      <header className="mb-6">
        <p className="mb-1 text-sm font-medium text-blue-700">{t("brand.name")}</p>
        <h1 className="text-2xl font-bold tracking-tight">{t("navigation.calendar")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("pageDescriptions.calendar")}</p>
      </header>
      <section className="max-w-3xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <CalendarDays aria-hidden="true" size={19} />
          </span>
          <h2 className="text-sm font-semibold">{t("calendar.today")}</h2>
        </div>
        <p className="mt-4 text-sm text-slate-600">{t("dashboardData.scheduleUnavailable")}</p>
      </section>
    </>
  );
}
