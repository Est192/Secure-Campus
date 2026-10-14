import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PaginationControls } from "../../components/data-display/PaginationControls";
import { academicGroupsApi } from "../../api/academicGroupsApi";
import { degreeProgramsApi } from "../../api/degreeProgramsApi";
import { enrollmentsApi } from "../../api/enrollmentsApi";
import { subjectsApi } from "../../api/subjectsApi";
import { apiErrorMessage } from "../../lib/apiErrorMessage";

type AcademicTab = "groups" | "subjects" | "enrollments";

export function AcademicsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<AcademicTab>("groups");
  const [page, setPage] = useState(1);
  const groupsQuery = useQuery({
    queryKey: ["academic-groups", "academics", page],
    queryFn: () => academicGroupsApi.list({ page, per_page: 15 }),
  });
  const programsQuery = useQuery({ queryKey: ["degree-programs"], queryFn: degreeProgramsApi.list });
  const subjectsQuery = useQuery({
    queryKey: ["subjects", page],
    queryFn: () => subjectsApi.list({ page, per_page: 15 }),
  });
  const enrollmentsQuery = useQuery({
    queryKey: ["enrollments", page],
    queryFn: () => enrollmentsApi.list({ page, per_page: 15 }),
  });

  const tabs: { id: AcademicTab; label: string }[] = [
    { id: "groups", label: "academicsPage.tabs.groups" },
    { id: "subjects", label: "academicsPage.tabs.subjects" },
    { id: "enrollments", label: "academicsPage.tabs.enrollments" },
  ];
  const activeQuery = tab === "groups" ? groupsQuery : tab === "subjects" ? subjectsQuery : enrollmentsQuery;
  const activeData = activeQuery.data;

  function changeTab(next: AcademicTab) {
    setTab(next);
    setPage(1);
  }

  return (
    <>
      <section className="mb-6">
        <p className="mb-1 text-sm font-medium text-blue-700">{t("brand.name")}</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{t("navigation.academics")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{t("pageDescriptions.academics")}</p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div aria-label={t("academicsPage.tabs.label")} className="flex flex-wrap gap-2" role="tablist">
            {tabs.map(({ id, label }) => (
              <button aria-selected={tab === id} className={`rounded-lg px-3 py-2 text-sm font-medium ${tab === id ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-50"}`} key={id} onClick={() => changeTab(id)} role="tab" type="button">
                {t(label)}
              </button>
            ))}
          </div>
        </div>
        {activeQuery.isPending ? (
          <p aria-live="polite" className="p-6 text-sm text-slate-600">{t("academicsPage.loading")}</p>
        ) : activeQuery.isError ? (
          <p className="p-6 text-sm text-red-700" role="alert">{apiErrorMessage(activeQuery.error)}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              {tab === "groups" && <GroupsTable groups={groupsQuery.data?.data ?? []} programs={programsQuery.data ?? []} t={t} />}
              {tab === "subjects" && <SubjectsTable subjects={subjectsQuery.data?.data ?? []} t={t} />}
              {tab === "enrollments" && <EnrollmentsTable enrollments={enrollmentsQuery.data?.data ?? []} groups={groupsQuery.data?.data ?? []} t={t} />}
            </div>
            {activeData && activeData.data.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-500">{t("academicsPage.empty")}</p>}
            {activeData && <PaginationControls meta={activeData.meta} onPageChange={setPage} />}
          </>
        )}
      </section>
    </>
  );
}

function GroupsTable({ groups, programs, t }: { groups: { id: number; name: string; degree_program_id: number; teacher_id: number | null; academic_year: string; semester: string }[]; programs: { id: number; name: string }[]; t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <table className="w-full min-w-[680px] text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
        <th className="px-5 py-3 font-semibold">{t("academicsPage.name")}</th><th className="px-5 py-3 font-semibold">{t("academicsPage.program")}</th><th className="px-5 py-3 font-semibold">{t("academicsPage.instructor")}</th><th className="px-5 py-3 font-semibold">{t("academicsPage.year")}</th><th className="px-5 py-3 font-semibold">{t("academicsPage.semester")}</th>
      </tr></thead>
      <tbody className="divide-y divide-slate-100">{groups.map((group) => <tr key={group.id}>
        <td className="px-5 py-4 font-semibold">{group.name}</td><td className="px-5 py-4">{programs.find((program) => program.id === group.degree_program_id)?.name ?? group.degree_program_id}</td><td className="px-5 py-4">{group.teacher_id ?? "—"}</td><td className="px-5 py-4">{group.academic_year}</td><td className="px-5 py-4">{group.semester}</td>
      </tr>)}</tbody>
    </table>
  );
}

function SubjectsTable({ subjects, t }: { subjects: { id: number; name: string; code: string; description: string | null; credits: number }[]; t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <table className="w-full min-w-[680px] text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
        <th className="px-5 py-3 font-semibold">{t("academicsPage.code")}</th><th className="px-5 py-3 font-semibold">{t("academicsPage.name")}</th><th className="px-5 py-3 font-semibold">{t("academicsPage.description")}</th><th className="px-5 py-3 font-semibold">{t("academicsPage.credits")}</th>
      </tr></thead>
      <tbody className="divide-y divide-slate-100">{subjects.map((subject) => <tr key={subject.id}>
        <td className="px-5 py-4 font-semibold">{subject.code}</td><td className="px-5 py-4">{subject.name}</td><td className="max-w-sm truncate px-5 py-4 text-slate-600">{subject.description || "—"}</td><td className="px-5 py-4">{subject.credits}</td>
      </tr>)}</tbody>
    </table>
  );
}

function EnrollmentsTable({ enrollments, groups, t }: { enrollments: { id: number; student_id: number; academic_group_id: number; status: string; enrolled_at: string | null }[]; groups: { id: number; name: string }[]; t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <table className="w-full min-w-[680px] text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
        <th className="px-5 py-3 font-semibold">{t("academicsPage.student")}</th><th className="px-5 py-3 font-semibold">{t("academicsPage.group")}</th><th className="px-5 py-3 font-semibold">{t("academicsPage.status")}</th><th className="px-5 py-3 font-semibold">{t("academicsPage.enrolledAt")}</th>
      </tr></thead>
      <tbody className="divide-y divide-slate-100">{enrollments.map((enrollment) => <tr key={enrollment.id}>
        <td className="px-5 py-4 font-semibold">{enrollment.student_id}</td><td className="px-5 py-4">{groups.find((group) => group.id === enrollment.academic_group_id)?.name ?? enrollment.academic_group_id}</td><td className="px-5 py-4">{enrollment.status}</td><td className="px-5 py-4">{enrollment.enrolled_at ?? "—"}</td>
      </tr>)}</tbody>
    </table>
  );
}