import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { PaginationControls } from "../../components/data-display/PaginationControls";
import { apiErrorMessage } from "../../lib/apiErrorMessage";
import { reportsApi } from "../../api/reportsApi";
import type { AcademicGroupReport, GradeReport, StudentReport } from "../../types/Report";
import type { User } from "../../types/User";

type ReportTab = "students" | "teachers" | "grades" | "academicGroups";

const tabs: { id: ReportTab; label: string }[] = [
  { id: "students", label: "reports.tabs.students" },
  { id: "teachers", label: "reports.tabs.teachers" },
  { id: "grades", label: "reports.tabs.grades" },
  { id: "academicGroups", label: "reports.tabs.academicGroups" },
];

export function ReportsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canViewReports = user?.role?.name === "Administrator"
    || user?.role?.name === "Department Head";
  const [tab, setTab] = useState<ReportTab>("students");
  const [page, setPage] = useState(1);
  const studentsQuery = useQuery({
    queryKey: ["reports", "students", page],
    queryFn: () => reportsApi.students({ page, per_page: 15 }),
    enabled: canViewReports && tab === "students",
  });
  const teachersQuery = useQuery({
    queryKey: ["reports", "teachers", page],
    queryFn: () => reportsApi.teachers({ page, per_page: 15 }),
    enabled: canViewReports && tab === "teachers",
  });
  const gradesQuery = useQuery({
    queryKey: ["reports", "grades", page],
    queryFn: () => reportsApi.grades({ page, per_page: 15 }),
    enabled: canViewReports && tab === "grades",
  });
  const academicGroupsQuery = useQuery({
    queryKey: ["reports", "academic-groups", page],
    queryFn: () => reportsApi.academicGroups({ page, per_page: 15 }),
    enabled: canViewReports && tab === "academicGroups",
  });
  const activeQuery = tab === "students"
    ? studentsQuery
    : tab === "teachers"
    ? teachersQuery
    : tab === "grades"
    ? gradesQuery
    : academicGroupsQuery;
  const activeData = activeQuery.data;

  return (
    <>
      <header className="mb-6">
        <p className="mb-1 text-sm font-medium text-blue-700">{t("reports.eyebrow")}</p>
        <h1 className="text-2xl font-bold tracking-tight">{t("navigation.reports")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("pageDescriptions.reports")}</p>
      </header>

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold">{t("reports.progressTitle")}</h2>
          {/* The API does not provide chart aggregates; keep this visual area as a placeholder. */}
          <p className="mt-4 text-sm text-slate-600">{t("reports.chartUnavailable")}</p>
        </section>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold">{t("reports.attendanceTitle")}</h2>
          {/* Attendance data is not exposed by the current API. */}
          <p className="mt-4 text-sm text-slate-600">{t("reports.chartUnavailable")}</p>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div aria-label={t("reports.tabs.label")} className="flex flex-wrap gap-2" role="tablist">
            {tabs.map(({ id, label }) => (
              <button
                aria-selected={tab === id}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${tab === id ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-50"}`}
                key={id}
                onClick={() => {
                  setTab(id);
                  setPage(1);
                }}
                role="tab"
                type="button"
              >
                {t(label)}
              </button>
            ))}
          </div>
        </div>

        {!canViewReports ? (
          <p className="p-6 text-sm text-slate-600">{t("reports.managerOnly")}</p>
        ) : activeQuery.isPending ? (
          <p aria-live="polite" className="p-6 text-sm text-slate-600">{t("reports.loading")}</p>
        ) : activeQuery.isError ? (
          <p className="p-6 text-sm text-red-700" role="alert">{apiErrorMessage(activeQuery.error)}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              {tab === "students" && <StudentsTable students={studentsQuery.data?.data ?? []} t={t} />}
              {tab === "teachers" && <TeachersTable teachers={teachersQuery.data?.data ?? []} t={t} />}
              {tab === "grades" && <GradesTable grades={gradesQuery.data?.data ?? []} t={t} />}
              {tab === "academicGroups" && <AcademicGroupsTable groups={academicGroupsQuery.data?.data ?? []} t={t} />}
            </div>
            {activeData?.data.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-500">{t("reports.empty")}</p>
            )}
            {activeData && <PaginationControls meta={activeData.meta} onPageChange={setPage} />}
          </>
        )}
      </section>
    </>
  );
}

function StudentsTable({ students, t }: { students: StudentReport[]; t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <table className="w-full min-w-[680px] text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
        <th className="px-5 py-3 font-semibold">{t("reports.name")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.email")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.studentNumber")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.program")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.status")}</th>
      </tr></thead>
      <tbody className="divide-y divide-slate-100">{students.map((student) => (
        <tr key={student.id}>
          <td className="px-5 py-4 font-semibold">{student.name}</td>
          <td className="px-5 py-4">{student.email}</td>
          <td className="px-5 py-4">{student.student_number ?? "—"}</td>
          <td className="px-5 py-4">{student.degree_program?.name ?? "—"}</td>
          <td className="px-5 py-4">{student.status}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}

function TeachersTable({ teachers, t }: { teachers: User[]; t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <table className="w-full min-w-[600px] text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
        <th className="px-5 py-3 font-semibold">{t("reports.name")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.email")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.employeeNumber")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.status")}</th>
      </tr></thead>
      <tbody className="divide-y divide-slate-100">{teachers.map((teacher) => (
        <tr key={teacher.id}>
          <td className="px-5 py-4 font-semibold">{teacher.name}</td>
          <td className="px-5 py-4">{teacher.email}</td>
          <td className="px-5 py-4">{teacher.employee_number ?? "—"}</td>
          <td className="px-5 py-4">{teacher.status}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}

function GradesTable({ grades, t }: { grades: GradeReport[]; t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
        <th className="px-5 py-3 font-semibold">{t("reports.subject")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.student")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.academicGroup")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.finalGrade")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.averageGrade")}</th>
      </tr></thead>
      <tbody className="divide-y divide-slate-100">{grades.map((grade) => (
        <tr key={grade.id}>
          <td className="px-5 py-4 font-semibold">{grade.subject?.name ?? grade.subject_id}</td>
          <td className="px-5 py-4">{grade.enrollment?.student?.name ?? grade.enrollment_id}</td>
          <td className="px-5 py-4">{grade.enrollment?.academic_group?.name ?? "—"}</td>
          <td className="px-5 py-4">{grade.final_grade ?? "—"}</td>
          <td className="px-5 py-4">{grade.average_grade ?? "—"}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}

function AcademicGroupsTable({ groups, t }: { groups: AcademicGroupReport[]; t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
        <th className="px-5 py-3 font-semibold">{t("reports.name")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.program")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.teacher")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.year")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.semester")}</th>
        <th className="px-5 py-3 font-semibold">{t("reports.enrollments")}</th>
      </tr></thead>
      <tbody className="divide-y divide-slate-100">{groups.map((group) => (
        <tr key={group.id}>
          <td className="px-5 py-4 font-semibold">{group.name}</td>
          <td className="px-5 py-4">{group.degree_program?.name ?? group.degree_program_id}</td>
          <td className="px-5 py-4">{group.teacher?.name ?? "—"}</td>
          <td className="px-5 py-4">{group.academic_year}</td>
          <td className="px-5 py-4">{group.semester}</td>
          <td className="px-5 py-4">{group.enrollments_count ?? "—"}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}
