import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { StatRecord } from "../../types/campus";

const icons: Record<StatRecord["icon"], LucideIcon> = {
  attendance: CalendarCheck,
  courses: BookOpen,
  requests: ClipboardList,
  documents: FileText,
};

export function StatCard({ stat }: { stat: StatRecord }) {
  const { t } = useTranslation();
  const Icon = icons[stat.icon];

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
          <Icon aria-hidden="true" size={20} />
        </span>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            stat.positive === false
              ? "bg-amber-50 text-amber-800"
              : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {t(stat.changeKey)}
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-600">{t(stat.titleKey)}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{stat.value}</p>
    </article>
  );
}
