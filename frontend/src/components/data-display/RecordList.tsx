import { FileText, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MockRecord } from "../../types/campus";

type RecordListProps = {
  title: string;
  rows: MockRecord[];
  onOpen?: (row: MockRecord) => void;
};

export function RecordList({ title, rows, onOpen }: RecordListProps) {
  const { t } = useTranslation();

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-bold">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">{t("common.sampleDataNotice")}</p>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div className="flex items-center gap-4 px-5 py-4" key={row.id}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <FileText aria-hidden="true" size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{t(row.titleKey)}</span>
              <span className="mt-1 block truncate text-xs text-slate-500">
                {t(row.detailKey)}
              </span>
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
              {t(row.statusKey)}
            </span>
            {onOpen && (
              <button
                aria-label={t("common.openRecord", { name: t(row.titleKey) })}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
                onClick={() => onOpen(row)}
              >
                <MoreHorizontal aria-hidden="true" size={17} />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
