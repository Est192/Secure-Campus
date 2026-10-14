import { useDeferredValue, useState, type FormEvent, type ReactNode } from "react";
import { Eye, Plus, Search, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PaginationControls } from "../../components/data-display/PaginationControls";
import { Button } from "../../components/ui/button";
import { academicGroupsApi } from "../../api/academicGroupsApi";
import { degreeProgramsApi } from "../../api/degreeProgramsApi";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage } from "../../lib/apiErrorMessage";
import type { AcademicGroup, AcademicGroupInput } from "../../types/AcademicGroup";

export function AcademicGroupsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canManageGroups = user?.role?.name === "Administrator" || user?.role?.name === "Department Head";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const deferredSearch = useDeferredValue(search.trim());

  const groupsQuery = useQuery({
    queryKey: ["academic-groups", page, deferredSearch],
    queryFn: () => academicGroupsApi.list({ page, per_page: 15, search: deferredSearch || undefined }),
  });
  const programsQuery = useQuery({
    queryKey: ["degree-programs"],
    queryFn: degreeProgramsApi.list,
  });
  const detailQuery = useQuery({
    queryKey: ["academic-group", selectedId],
    queryFn: () => {
      if (selectedId === null) throw new Error("An academic group ID is required.");
      return academicGroupsApi.getById(selectedId);
    },
    enabled: selectedId !== null,
  });
  const createGroup = useMutation({
    mutationFn: academicGroupsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["academic-groups"] });
      setShowCreate(false);
      setPage(1);
    },
  });
  const updateGroup = useMutation({
    mutationFn: (input: { id: number; group: AcademicGroupInput }) => academicGroupsApi.update(input.id, input.group),
    onSuccess: async (_group, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["academic-groups"] }),
        queryClient.invalidateQueries({ queryKey: ["academic-group", input.id] }),
      ]);
    },
  });
  const deleteGroup = useMutation({
    mutationFn: academicGroupsApi.remove,
    onSuccess: async (_result, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["academic-groups"] }),
        queryClient.removeQueries({ queryKey: ["academic-group", id] }),
      ]);
      setSelectedId(null);
    },
  });

  function readGroupForm(event: FormEvent<HTMLFormElement>): AcademicGroupInput {
    const form = new FormData(event.currentTarget);
    const teacherId = String(form.get("teacher_id") ?? "").trim();
    return {
      name: String(form.get("name")).trim(),
      degree_program_id: Number(form.get("degree_program_id")),
      teacher_id: teacherId ? Number(teacherId) : null,
      academic_year: String(form.get("academic_year")).trim(),
      semester: String(form.get("semester")).trim(),
    };
  }

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createGroup.mutate(readGroupForm(event));
  }

  function submitUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedId !== null) updateGroup.mutate({ id: selectedId, group: readGroupForm(event) });
  }

  const groups = groupsQuery.data?.data ?? [];

  return (
    <>
      <section className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-700">{t("brand.name")}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{t("navigation.academicGroups")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t("pageDescriptions.academicGroups")}</p>
        </div>
        {canManageGroups && <Button className="w-fit" onClick={() => { createGroup.reset(); setShowCreate(true); }}><Plus aria-hidden="true" size={16} />{t("academicGroupsPage.create")}</Button>}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold">{t("academicGroupsPage.title")}</h2>
          <label className="relative w-full sm:max-w-sm">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input aria-label={t("academicGroupsPage.search")} className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500" onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={t("academicGroupsPage.search")} value={search} />
          </label>
        </div>
        {groupsQuery.isPending ? (
          <p aria-live="polite" className="p-6 text-sm text-slate-600">{t("academicGroupsPage.loading")}</p>
        ) : groupsQuery.isError ? (
          <p className="p-6 text-sm text-red-700" role="alert">{apiErrorMessage(groupsQuery.error)}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
                  <th className="px-5 py-3 font-semibold">{t("academicGroupsPage.name")}</th>
                  <th className="px-5 py-3 font-semibold">{t("academicGroupsPage.program")}</th>
                  <th className="px-5 py-3 font-semibold">{t("academicGroupsPage.teacher")}</th>
                  <th className="px-5 py-3 font-semibold">{t("academicGroupsPage.year")}</th>
                  <th className="px-5 py-3 font-semibold">{t("academicGroupsPage.semester")}</th>
                  <th className="px-5 py-3 font-semibold"><span className="sr-only">{t("academicGroupsPage.details")}</span></th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">{groups.map((group) => (
                  <tr key={group.id}>
                    <td className="px-5 py-4 font-semibold">{group.name}</td>
                    <td className="px-5 py-4">{programsQuery.data?.find((program) => program.id === group.degree_program_id)?.name ?? group.degree_program_id}</td>
                    <td className="px-5 py-4">{group.teacher_id ?? "—"}</td>
                    <td className="px-5 py-4">{group.academic_year}</td>
                    <td className="px-5 py-4">{group.semester}</td>
                    <td className="px-5 py-4 text-right"><button aria-label={t("academicGroupsPage.view")} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" onClick={() => setSelectedId(group.id)} type="button"><Eye aria-hidden="true" size={16} /></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            {groups.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-500">{t("academicGroupsPage.empty")}</p>}
            {groupsQuery.data && <PaginationControls meta={groupsQuery.data.meta} onPageChange={setPage} />}
          </>
        )}
      </section>

      {showCreate && (
        <GroupModal onClose={() => setShowCreate(false)} title={t("academicGroupsPage.create")}>
          <GroupForm error={createGroup.isError ? apiErrorMessage(createGroup.error) : programsQuery.isError ? apiErrorMessage(programsQuery.error) : ""} isPending={createGroup.isPending} onSubmit={submitCreate} programs={programsQuery.data ?? []} submitLabel={t("academicGroupsPage.create")} />
        </GroupModal>
      )}
      {selectedId !== null && (
        <GroupModal onClose={() => setSelectedId(null)} title={t("academicGroupsPage.details")}>
          {detailQuery.isPending ? <p aria-live="polite" className="mt-5 text-sm text-slate-600">{t("academicGroupsPage.loading")}</p>
            : detailQuery.isError ? <p className="mt-5 text-sm text-red-700" role="alert">{apiErrorMessage(detailQuery.error)}</p>
              : detailQuery.data && (canManageGroups
                ? <GroupForm group={detailQuery.data} error={updateGroup.isError ? apiErrorMessage(updateGroup.error) : programsQuery.isError ? apiErrorMessage(programsQuery.error) : ""} isPending={updateGroup.isPending} onSubmit={submitUpdate} programs={programsQuery.data ?? []} submitLabel={t("academicGroupsPage.save")} />
                : <GroupDetails group={detailQuery.data} t={t} />)}
          {canManageGroups && detailQuery.data && <div className="mt-4 flex justify-end border-t border-slate-100 pt-4"><Button disabled={deleteGroup.isPending} onClick={() => { if (window.confirm(t("academicGroupsPage.confirmDelete", { name: detailQuery.data?.name }))) deleteGroup.mutate(selectedId); }} variant="outline"><Trash2 aria-hidden="true" size={16} />{t("academicGroupsPage.delete")}</Button></div>}
          {deleteGroup.isError && <p className="mt-3 text-sm text-red-700" role="alert">{apiErrorMessage(deleteGroup.error)}</p>}
        </GroupModal>
      )}
    </>
  );
}

function GroupForm({ group, programs, error, isPending, onSubmit, submitLabel }: { group?: AcademicGroup; programs: { id: number; name: string }[]; error: string; isPending: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; submitLabel: string }) {
  const { t } = useTranslation();
  return (
    <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit}>
      <GroupField defaultValue={group?.name} label={t("academicGroupsPage.name")} name="name" required />
      <label className="flex flex-col gap-2 text-sm font-medium">{t("academicGroupsPage.program")}<select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" defaultValue={group?.degree_program_id ?? ""} name="degree_program_id" required><option value="">{t("academicGroupsPage.selectProgram")}</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <GroupField defaultValue={group?.teacher_id ?? ""} label={t("academicGroupsPage.teacherId")} name="teacher_id" min={1} type="number" />
        <GroupField defaultValue={group?.academic_year} label={t("academicGroupsPage.year")} name="academic_year" required />
      </div>
      <GroupField defaultValue={group?.semester} label={t("academicGroupsPage.semester")} name="semester" required />
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      {!programs.length && !error && <p className="text-sm text-slate-600">{t("academicGroupsPage.noPrograms")}</p>}
      <div className="flex justify-end"><Button disabled={isPending || !programs.length} type="submit">{isPending ? t("academicGroupsPage.saving") : submitLabel}</Button></div>
    </form>
  );
}

function GroupDetails({ group, t }: { group: AcademicGroup; t: ReturnType<typeof useTranslation>["t"] }) {
  const fields = [[t("academicGroupsPage.name"), group.name], [t("academicGroupsPage.program"), group.degree_program_id], [t("academicGroupsPage.teacher"), group.teacher_id ?? "—"], [t("academicGroupsPage.year"), group.academic_year], [t("academicGroupsPage.semester"), group.semester]];
  return <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">{fields.map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}</dl>;
}

function GroupField({ label, name, required = false, defaultValue, min, type = "text" }: { label: string; name: string; required?: boolean; defaultValue?: string | number; min?: number; type?: string }) {
  return <label className="flex flex-col gap-2 text-sm font-medium">{label}<input className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" defaultValue={defaultValue} min={min} name={name} required={required} type={type} /></label>;
}

function GroupModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const { t } = useTranslation();
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section aria-labelledby="academic-group-modal-title" aria-modal="true" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" role="dialog"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium text-blue-700">{t("brand.name")}</p><h2 className="mt-1 text-xl font-bold" id="academic-group-modal-title">{title}</h2></div><button aria-label={t("common.close")} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} type="button"><X aria-hidden="true" size={19} /></button></div>{children}</section></div>;
}