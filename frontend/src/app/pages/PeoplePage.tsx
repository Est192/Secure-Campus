import { useDeferredValue, useState, type FormEvent } from "react";
import { Plus, Search, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PaginationControls } from "../../components/data-display/PaginationControls";
import { Button } from "../../components/ui/button";
import { studentsApi } from "../../api/studentsApi";
import { teachersApi } from "../../api/teachersApi";
import { rolesApi } from "../../api/rolesApi";
import { usersApi } from "../../api/usersApi";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage } from "../../lib/apiErrorMessage";
import type { CreateStudentRequest, CreateTeacherRequest, CreateUserRequest, User } from "../../types/User";

type PeopleTab = "all" | "students" | "teachers";
type CreatePersonInput =
  | { type: "user"; person: CreateUserRequest }
  | { type: "student"; person: CreateStudentRequest }
  | { type: "teacher"; person: CreateTeacherRequest };

const tabs: { id: PeopleTab; label: string }[] = [
  { id: "all", label: "peoplePage.tabs.all" },
  { id: "students", label: "peoplePage.tabs.students" },
  { id: "teachers", label: "peoplePage.tabs.teachers" },
];

export function PeoplePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canManagePeople = user?.role?.name === "Administrator"
    || user?.role?.name === "Department Head";
  const isAdministrator = user?.role?.name === "Administrator";
  const [tab, setTab] = useState<PeopleTab>("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [roleSelectionError, setRoleSelectionError] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: rolesApi.list,
    enabled: canManagePeople && tab === "all",
  });
  const selectedRole = rolesQuery.data?.find((role) => String(role.id) === selectedRoleId);

  const peopleQuery = useQuery({
    queryKey: ["people", tab, page, deferredSearch, tab === "all" ? status : ""],
    queryFn: () => {
      const params = { page, per_page: 15, search: deferredSearch };
      if (tab === "students") return studentsApi.list(params);
      if (tab === "teachers") return teachersApi.list(params);
      return usersApi.list({ ...params, status: status || undefined });
    },
    enabled: canManagePeople || tab === "all",
  });

  const createPerson = useMutation({
    mutationFn: (input: CreatePersonInput) =>
      input.type === "user"
        ? usersApi.create(input.person)
        : input.type === "student"
        ? studentsApi.create(input.person)
        : teachersApi.create(input.person),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["people"] });
      setShowCreate(false);
      setSelectedRoleId("");
      setPage(1);
    },
  });

  function changeTab(nextTab: PeopleTab) {
    setTab(nextTab);
    setSelectedRoleId("");
    setStatus("");
    setPage(1);
  }

  function submitPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const base = {
      first_name: String(formData.get("first_name")).trim(),
      last_name: String(formData.get("last_name")).trim(),
      email: String(formData.get("email")).trim(),
      password: String(formData.get("password")),
      phone: String(formData.get("phone")).trim() || null,
    };
    if (tab === "all" && isAdministrator) {
      const roleId = Number(formData.get("role_id"));
      const role = rolesQuery.data?.find((candidate) => candidate.id === roleId);
      if (!Number.isInteger(roleId) || !role) {
        setRoleSelectionError(t("peoplePage.selectRoleError"));
        return;
      }
      setRoleSelectionError("");
      createPerson.mutate({
        type: "user",
        person: {
          ...base,
          role_id: roleId,
          ...(role.name === "Student"
            ? { student_number: String(formData.get("student_number")).trim() || null }
            : {}),
          ...(role.name === "Teacher"
            ? { employee_number: String(formData.get("employee_number")).trim() || null }
            : {}),
        },
      });
      return;
    }
    const type = tab === "students" ? "student" : "teacher";
    if (type === "student") {
      createPerson.mutate({
        type,
        person: { ...base, student_number: String(formData.get("student_number")).trim() || null },
      });
    } else {
      createPerson.mutate({
        type,
        person: { ...base, employee_number: String(formData.get("employee_number")).trim() || null },
      });
    }
  }

  const people = peopleQuery.data?.data ?? [];

  return (
    <>
      <section className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-700">{t("brand.name")}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{t("navigation.people")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t("pageDescriptions.people")}</p>
        </div>
        {canManagePeople && (tab !== "all" || isAdministrator) && (
          <Button className="w-fit" onClick={() => {
            createPerson.reset();
            setSelectedRoleId("");
            setRoleSelectionError("");
            setShowCreate(true);
          }}>
            <Plus aria-hidden="true" size={16} />
            {t("peoplePage.addPerson")}
          </Button>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5">
          <div aria-label={t("peoplePage.tabs.label")} className="flex flex-wrap gap-2" role="tablist">
            {tabs.map(({ id, label }) => (
              <button
                aria-selected={tab === id}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${tab === id ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-50"}`}
                key={id}
                onClick={() => changeTab(id)}
                role="tab"
                type="button"
              >
                {t(label)}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                aria-label={t("peoplePage.search")}
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={t("peoplePage.search")}
                value={search}
              />
            </label>
            {tab === "all" && (
              <select
                aria-label={t("peoplePage.status")}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                value={status}
              >
                <option value="">{t("peoplePage.allStatuses")}</option>
                <option value="active">{t("peoplePage.active")}</option>
                <option value="inactive">{t("peoplePage.inactive")}</option>
                <option value="suspended">{t("peoplePage.suspended")}</option>
              </select>
            )}
          </div>
        </div>

        {!canManagePeople && tab !== "all" ? (
          <p className="p-6 text-sm text-slate-600">{t("peoplePage.managerOnly")}</p>
        ) : rolesQuery.isError && tab === "all" ? (
          <p className="border-b border-slate-100 px-5 py-3 text-sm text-red-700" role="alert">{apiErrorMessage(rolesQuery.error)}</p>
        ) : peopleQuery.isPending ? (
          <p aria-live="polite" className="p-6 text-sm text-slate-600">{t("peoplePage.loading")}</p>
        ) : peopleQuery.isError ? (
          <p className="p-6 text-sm text-red-700" role="alert">{apiErrorMessage(peopleQuery.error)}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">{t("peoplePage.name")}</th>
                    <th className="px-5 py-3 font-semibold">{t("peoplePage.email")}</th>
                    <th className="px-5 py-3 font-semibold">{t("peoplePage.role")}</th>
                    <th className="px-5 py-3 font-semibold">{t("peoplePage.identifier")}</th>
                    <th className="px-5 py-3 font-semibold">{t("peoplePage.status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {people.map((person) => (
                    <PersonRow
                      key={person.id}
                      person={person}
                      roleName={rolesQuery.data?.find((role) => role.id === person.role_id)?.name}
                      tab={tab}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {people.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-500">{t("peoplePage.empty")}</p>
            )}
            {peopleQuery.data && (
              <PaginationControls meta={peopleQuery.data.meta} onPageChange={setPage} />
            )}
          </>
        )}
      </section>

      {showCreate && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false);
          }}
        >
          <section
            aria-labelledby="create-person-title"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-blue-700">{t("brand.name")}</p>
                <h2 className="mt-1 text-xl font-bold" id="create-person-title">{t("peoplePage.addPerson")}</h2>
              </div>
              <button aria-label={t("common.close")} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setShowCreate(false)} type="button">
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <form className="mt-6 flex flex-col gap-4" onSubmit={submitPerson}>
              {tab === "all" && isAdministrator && (
                <label className="flex flex-col gap-2 text-sm font-medium">
                  {t("peoplePage.role")}
                  <select className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" name="role_id" onChange={(event) => {
                    setSelectedRoleId(event.target.value);
                    setRoleSelectionError("");
                  }} required value={selectedRoleId}>
                    <option value="">{t("peoplePage.selectRole")}</option>
                    {rolesQuery.data?.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </label>
              )}
              <FormField label={t("peoplePage.firstName")} name="first_name" required />
              <FormField label={t("peoplePage.lastName")} name="last_name" required />
              <FormField label={t("peoplePage.email")} name="email" required type="email" />
              <FormField label={t("peoplePage.password")} name="password" required type="password" minLength={12} />
              <FormField label={t("peoplePage.phone")} name="phone" type="tel" />
              {(tab === "students" || (tab === "all" && selectedRole?.name === "Student")) && (
                <FormField label={t("peoplePage.studentNumber")} name="student_number" />
              )}
              {(tab === "teachers" || (tab === "all" && selectedRole?.name === "Teacher")) && (
                <FormField label={t("peoplePage.employeeNumber")} name="employee_number" />
              )}
              {rolesQuery.isPending && tab === "all" && isAdministrator && (
                <p aria-live="polite" className="text-sm text-slate-600">{t("peoplePage.loadingRoles")}</p>
              )}
              {rolesQuery.isError && tab === "all" && isAdministrator && (
                <p className="text-sm text-red-700" role="alert">{apiErrorMessage(rolesQuery.error)}</p>
              )}
              {roleSelectionError && <p className="text-sm text-red-700" role="alert">{roleSelectionError}</p>}
              {createPerson.isError && (
                <p className="text-sm text-red-700" role="alert">{apiErrorMessage(createPerson.error)}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowCreate(false)} type="button" variant="outline">{t("common.cancel")}</Button>
                <Button disabled={createPerson.isPending || (tab === "all" && isAdministrator && (!selectedRole || rolesQuery.isPending || rolesQuery.isError))} type="submit">
                  {createPerson.isPending ? t("peoplePage.saving") : t("peoplePage.save")}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function PersonRow({ person, roleName, tab }: { person: User; roleName?: string; tab: PeopleTab }) {
  const { t } = useTranslation();
  const name = person.name || [person.first_name, person.last_name].filter(Boolean).join(" ");
  const identifier = tab === "students"
    ? person.student_number
    : tab === "teachers"
      ? person.employee_number
      : person.student_number || person.employee_number || "—";

  return (
    <tr>
      <td className="px-5 py-4 font-medium text-slate-900">{name}</td>
      <td className="px-5 py-4 text-slate-600">{person.email}</td>
      <td className="px-5 py-4 text-slate-600">{translatedRole(roleName, t)}</td>
      <td className="px-5 py-4 text-slate-600">{identifier || "—"}</td>
      <td className="px-5 py-4">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {t(`peoplePage.${person.status}`, { defaultValue: person.status })}
        </span>
      </td>
    </tr>
  );
}

function translatedRole(roleName: string | undefined, t: ReturnType<typeof useTranslation>["t"]): string {
  if (roleName === "Administrator") return t("roles.admin");
  if (roleName === "Department Head") return t("roles.head");
  if (roleName === "Teacher") return t("roles.teacher");
  if (roleName === "Student") return t("roles.student");
  return roleName || "—";
}

function FormField({
  label,
  name,
  required = false,
  type = "text",
  minLength,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {label}
      <input
        className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        minLength={minLength}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}
