import { CalendarDays, Clock3 } from "lucide-react";
import { useTranslation } from "react-i18next";

const events = [
  { id: "biology", timeKey: "calendar.time1", titleKey: "calendar.event1", detailKey: "courseTitles.biology" },
  { id: "seminar", timeKey: "calendar.time2", titleKey: "calendar.event2", detailKey: "courseTitles.seminar" },
  { id: "advisor", timeKey: "calendar.time3", titleKey: "calendar.event3", detailKey: "people.advisor" },
];

export function CalendarPage() {
  const { t } = useTranslation();

  return (
    <>
      <header className="mb-6">
        <p className="mb-1 text-sm font-medium text-blue-700">{t("brand.name")}</p>
        <h1 className="text-2xl font-bold tracking-tight">{t("navigation.calendar")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("pageDescriptions.calendar")}</p>
      </header>
      <section className="max-w-3xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-5 py-4 text-sm font-semibold">
          {t("calendar.today")}
        </h2>
        <div className="divide-y divide-slate-100">
          {events.map((event) => (
            <article className="flex items-start gap-4 p-5" key={event.id}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <CalendarDays aria-hidden="true" size={19} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{t(event.titleKey)}</span>
                <span className="mt-1 block text-xs text-slate-600">{t(event.detailKey)}</span>
                <span className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <Clock3 aria-hidden="true" size={13} />
                  {t(event.timeKey)}
                </span>
              </span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
