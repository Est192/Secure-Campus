import { Download } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/button";

type LayoutContext = { notify: (message: string) => void };
const progress = [42, 58, 51, 72, 68, 86, 92];
const attendance = [94, 98, 89];

export function ReportsPage() {
  const { t } = useTranslation();
  const { notify } = useOutletContext<LayoutContext>();

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-700">{t("reports.eyebrow")}</p>
          <h1 className="text-2xl font-bold tracking-tight">{t("navigation.reports")}</h1>
          <p className="mt-2 text-sm text-slate-600">{t("pageDescriptions.reports")}</p>
        </div>
        <Button onClick={() => notify(t("reports.exportReady"))} size="sm">
          <Download aria-hidden="true" size={16} />
          {t("reports.export")}
        </Button>
      </header>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold">{t("reports.progressTitle")}</h2>
          <div className="mt-7 flex h-48 items-end gap-4">
            {progress.map((height, index) => (
              <div className="flex flex-1 flex-col items-center gap-2" key={index}>
                <span className="w-full rounded-t-lg bg-blue-700" style={{ height: `${height}%` }} />
                <span className="text-[10px] text-slate-500">
                  {t("reports.week", { number: index + 1 })}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold">{t("reports.attendanceTitle")}</h2>
          {attendance.map((percent, index) => (
            <div className="mt-6" key={index}>
              <div className="mb-2 flex justify-between text-xs">
                <span>{t(`courseTitles.${["security", "statistics", "networks"][index]}`)}</span>
                <span className="font-semibold">{percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <span
                  className="block h-2 rounded-full bg-emerald-600"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
