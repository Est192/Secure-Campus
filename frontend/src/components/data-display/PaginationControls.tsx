import { useTranslation } from "react-i18next";
import type { PaginationMeta } from "../../types/Pagination";
import { Button } from "../ui/button";

type PaginationControlsProps = {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
};

export function PaginationControls({ meta, onPageChange }: PaginationControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>
        {t("dataTable.range", {
          from: meta.from ?? 0,
          to: meta.to ?? 0,
          total: meta.total,
        })}
      </span>
      <div className="flex gap-2">
        <Button
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
          variant="outline"
        >
          {t("dataTable.previous")}
        </Button>
        <span className="flex items-center px-2">
          {t("dataTable.page", {
            current: meta.current_page,
            last: meta.last_page,
          })}
        </span>
        <Button
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
          variant="outline"
        >
          {t("dataTable.next")}
        </Button>
      </div>
    </div>
  );
}
