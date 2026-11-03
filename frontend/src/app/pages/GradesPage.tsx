import { useState, type FormEvent, type ReactNode } from "react";
import { Eye, Plus, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PaginationControls } from "../../components/data-display/PaginationControls";
import { Button } from "../../components/ui/button";
import { gradesApi } from "../../api/gradesApi";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage } from "../../lib/apiErrorMessage";
import type { Grade, GradeInput } from "../../types/Grade";

const scoreFields = ["first_partial", "second_partial", "third_partial", "final_grade"] as const;

export function GradesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canManageGrades = user?.role?.name === "Administrator" || user?.role?.name === "Department Head";
  const canEditGrades = canManageGrades || user?.role?.name === "Teacher";
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const gradesQuery = useQuery({
    queryKey: ["grades", page],
    queryFn: () => gradesApi.list({ page, per_page: 15 }),
  });
  const detailQuery = useQuery({
    queryKey: ["grade", selectedId],
    queryFn: () => {
      if (selectedId === null) throw new Error("A grade ID is required.");
      return gradesApi.getById(selectedId);
    },
    enabled: selectedId !== null,
  });
  const createGrade = useMutation({
    mutationFn: gradesApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["grades"] });
      setShowCreate(false);
      setPage(1);
    },
  });
  const updateGrade = useMutation({
    mutationFn: (input: { id: number; grade: GradeInput }) => gradesApi.update(input.id, input.grade),
    onSuccess: async (_grade, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["grades"] }),
        queryClient.invalidateQueries({ queryKey: ["grade", input.id] }),
      ]);
    },
  });
  const deleteGrade = useMutation({
    mutationFn: gradesApi.remove,
    onSuccess: async (_result, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["grades"] }),
        queryClient.removeQueries({ queryKey: ["grade", id] }),
      ]);
      setSelectedId(null);
    },
  });

  function submitGrade(event: FormEvent<HTMLFormElement>, gradeId?: number) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const grade: GradeInput = gradeId === undefined
      ? { enrollment_id: Number(form.get("enrollment_id")), subject_id: Number(form.get("subject_id")) }
      : {};
    for (const field of scoreFields) {
      const value = String(form.get(field) ?? "").trim();
      grade[field] = value || null;
    }
    if (gradeId === undefined) createGrade.mutate(grade);
    else updateGrade.mutate({ id: gradeId, grade });
  }

  const grades = gradesQuery.data?.data ?? [];

  return (
    <>
      <section className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-700">{t("brand.name")}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{t("navigation.grades")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t("pageDescriptions.grades")}</p>
        </div>
        {canManageGrades && (
          <Button className="w-fit" onClick={() => {
            createGrade.reset();
            setShowCreate(true);
          }}>
            <Plus aria-hidden="true" size={16} />
            {t("gradesPage.create")}
          </Button>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 p-5 text-sm font-bold">{t("grades.title")}</h2>
        {gradesQuery.isPending ? (
          <p aria-live="polite" className="p-6 text-sm text-slate-600">{t("gradesPage.loading")}</p>
        ) : gradesQuery.isError ? (
          <p className="p-6 text-sm text-red-700" role="alert">{apiErrorMessage(gradesQuery.error)}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">{t("gradesPage.enrollment")}</th>
                    <th className="px-5 py-3 font-semibold">{t("gradesPage.subject")}</th>
                    <th className="px-5 py-3 font-semibold">{t("gradesPage.partials")}</th>
                    <th className="px-5 py-3 font-semibold">{t("gradesPage.final")}</th>
                    <th className="px-5 py-3 font-semibold">{t("gradesPage.average")}</th>
                    <th className="px-5 py-3 font-semibold"><span className="sr-only">{t("gradesPage.details")}</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.map((grade) => (
                    <GradeRow grade={grade} key={grade.id} onOpen={() => setSelectedId(grade.id)} t={t} />
                  ))}
                </tbody>
              </table>
            </div>
            {grades.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-500">{t("gradesPage.empty")}</p>}
            {gradesQuery.data && <PaginationControls meta={gradesQuery.data.meta} onPageChange={setPage} />}
          </>
        )}
      </section>

      {showCreate && (
        <GradeModal onClose={() => setShowCreate(false)} title={t("gradesPage.create")}>
          <GradeForm error={createGrade.isError ? apiErrorMessage(createGrade.error) : ""} isPending={createGrade.isPending} onSubmit={(event) => submitGrade(event)} submitLabel={t("gradesPage.create")} />
        </GradeModal>
      )}

      {selectedId !== null && (
        <GradeModal onClose={() => setSelectedId(null)} title={t("gradesPage.details")}>
          {detailQuery.isPending ? (
            <p aria-live="polite" className="mt-5 text-sm text-slate-600">{t("gradesPage.loading")}</p>
          ) : detailQuery.isError ? (
            <p className="mt-5 text-sm text-red-700" role="alert">{apiErrorMessage(detailQuery.error)}</p>
          ) : detailQuery.data && (
            <>
              {canEditGrades ? (
                <GradeForm grade={detailQuery.data} error={updateGrade.isError ? apiErrorMessage(updateGrade.error) : ""} isPending={updateGrade.isPending} onSubmit={(event) => submitGrade(event, detailQuery.data.id)} submitLabel={t("gradesPage.save")} />
              ) : <GradeDetails grade={detailQuery.data} t={t} />}
              {canManageGrades && (
                <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
                  <Button disabled={deleteGrade.isPending} onClick={() => {
                    if (window.confirm(t("gradesPage.confirmDelete", { id: detailQuery.data?.id }))) {
                      deleteGrade.mutate(selectedId);
                    }
                  }} variant="outline">
                    <Trash2 aria-hidden="true" size={16} />
                    {t("gradesPage.delete")}
                  </Button>
                </div>
              )}
              {deleteGrade.isError && <p className="mt-3 text-sm text-red-700" role="alert">{apiErrorMessage(deleteGrade.error)}</p>}
            </>
          )}
        </GradeModal>
      )}
    </>
  );
}

function GradeRow({ grade, onOpen, t }: { grade: Grade; onOpen: () => void; t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <tr>
      <td className="px-5 py-4 font-medium">{grade.enrollment_id}</td>
      <td className="px-5 py-4">{grade.subject_id}</td>
      <td className="px-5 py-4">{[grade.first_partial, grade.second_partial, grade.third_partial].map((value) => value ?? "—").join(" / ")}</td>
      <td className="px-5 py-4">{grade.final_grade ?? "—"}</td>
      <td className="px-5 py-4 font-semibold">{grade.average_grade ?? "—"}</td>
      <td className="px-5 py-4 text-right">
        <button aria-label={t("gradesPage.view")} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" onClick={onOpen} type="button">
          <Eye aria-hidden="true" size={16} />
        </button>
      </td>
    </tr>
  );
}

function GradeDetails({ grade, t }: { grade: Grade; t: ReturnType<typeof useTranslation>["t"] }) {
  const fields = [
    [t("gradesPage.enrollment"), grade.enrollment_id],
    [t("gradesPage.subject"), grade.subject_id],
    ...scoreFields.map((field) => [t(`gradesPage.fields.${field}`), grade[field] ?? "—"]),
    [t("gradesPage.average"), grade.average_grade ?? "—"],
  ];
  return <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">{fields.map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}</dl>;
}

function GradeForm({ grade, error, isPending, onSubmit, submitLabel }: { grade?: Grade; error: string; isPending: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; submitLabel: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canManageGrades = user?.role?.name === "Administrator" || user?.role?.name === "Department Head";
  return (
    <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit}>
      {grade ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadOnlyValue label={t("gradesPage.enrollment")} value={grade.enrollment_id} />
          <ReadOnlyValue label={t("gradesPage.subject")} value={grade.subject_id} />
        </div>
      ) : canManageGrades && (
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label={t("gradesPage.enrollment")} name="enrollment_id" required />
          <NumberField label={t("gradesPage.subject")} name="subject_id" required />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {scoreFields.map((field) => <NumberField key={field} defaultValue={grade?.[field] ?? ""} label={t(`gradesPage.fields.${field}`)} name={field} />)}
      </div>
      {grade && <ReadOnlyValue label={t("gradesPage.average")} value={grade.average_grade ?? "—"} />}
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      <div className="flex justify-end">
        <Button disabled={isPending} type="submit">{isPending ? t("gradesPage.saving") : submitLabel}</Button>
      </div>
    </form>
  );
}

function NumberField({ label, name, required = false, defaultValue }: { label: string; name: string; required?: boolean; defaultValue?: string | number }) {
  return <label className="flex flex-col gap-2 text-sm font-medium">{label}<input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" defaultValue={defaultValue} max={name.includes("partial") || name === "final_grade" ? 100 : undefined} min={name.includes("partial") || name === "final_grade" ? 0 : 1} name={name} required={required} step={name.includes("partial") || name === "final_grade" ? "0.01" : "1"} type="number" /></label>;
}

function ReadOnlyValue({ label, value }: { label: string; value: string | number }) {
  return <div className="text-sm"><p className="text-slate-500">{label}</p><p className="mt-1 font-medium">{value}</p></div>;
}

function GradeModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section aria-labelledby="grade-modal-title" aria-modal="true" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" role="dialog">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-medium text-blue-700">{t("brand.name")}</p><h2 className="mt-1 text-xl font-bold" id="grade-modal-title">{title}</h2></div>
          <button aria-label={t("common.close")} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} type="button"><X aria-hidden="true" size={19} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}