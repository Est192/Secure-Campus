import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { degreeProgramsApi } from "../../api/degreeProgramsApi";
import { usersApi } from "../../api/usersApi";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import type { UpdateUserProfileRequest } from "../../types/User";

type LayoutContext = { notify: (message: string) => void };

export function SettingsPage() {
  const { t } = useTranslation();
  const { notify } = useOutletContext<LayoutContext>();
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["users", user?.id],
    queryFn: () => usersApi.getById(user!.id),
    enabled: user !== null,
    initialData: user ?? undefined,
  });
  const degreeProgramsQuery = useQuery({
    queryKey: ["degree-programs"],
    queryFn: degreeProgramsApi.list,
  });
  const [profile, setProfile] = useState<UpdateUserProfileRequest>({});

  useEffect(() => {
    const currentUser = profileQuery.data;
    if (!currentUser) return;
    setProfile({
      first_name: currentUser.first_name ?? "",
      last_name: currentUser.last_name ?? "",
      email: currentUser.email,
      phone: currentUser.phone,
      degree_program_id: currentUser.degree_program_id,
    });
  }, [profileQuery.data]);

  const updateProfile = useMutation({
    mutationFn: (changes: UpdateUserProfileRequest) => usersApi.update(user!.id, changes),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["users", updatedUser.id], updatedUser);
      updateUser(updatedUser);
      notify(t("settings.saved"));
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateProfile.mutate(profile);
  }

  return (
    <>
      <header className="mb-6">
        <p className="mb-1 text-sm font-medium text-blue-700">{t("settings.eyebrow")}</p>
        <h1 className="text-2xl font-bold tracking-tight">{t("navigation.settings")}</h1>
      </header>
      <form
        className="flex max-w-3xl flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <h2 className="text-sm font-bold">{t("settings.profileTitle")}</h2>
        {profileQuery.isError && (
          <p className="text-sm text-red-700" role="alert">{t("settings.loadError")}</p>
        )}
        {updateProfile.isError && (
          <p className="text-sm text-red-700" role="alert">{t("settings.updateError")}</p>
        )}
        {degreeProgramsQuery.isError && (
          <p className="text-sm text-red-700" role="alert">{t("settings.programsError")}</p>
        )}
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor="first-name">
          {t("settings.firstName")}
          <input
            autoComplete="given-name"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            id="first-name"
            name="first_name"
            onChange={(event) => setProfile((current) => ({ ...current, first_name: event.target.value }))}
            required
            value={profile.first_name ?? ""}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor="last-name">
          {t("settings.lastName")}
          <input
            autoComplete="family-name"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            id="last-name"
            name="last_name"
            onChange={(event) => setProfile((current) => ({ ...current, last_name: event.target.value }))}
            required
            value={profile.last_name ?? ""}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor="email">
          {t("settings.email")}
          <input
            autoComplete="email"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            id="email"
            name="email"
            onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
            required
            type="email"
            value={profile.email ?? ""}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor="phone">
          {t("settings.phone")}
          <input
            autoComplete="tel"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            id="phone"
            name="phone"
            onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value || null }))}
            type="tel"
            value={profile.phone ?? ""}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor="degree-program">
          {t("settings.program")}
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            id="degree-program"
            name="degree_program_id"
            onChange={(event) => setProfile((current) => ({
              ...current,
              degree_program_id: event.target.value ? Number(event.target.value) : null,
            }))}
            value={profile.degree_program_id ?? ""}
          >
            <option value="">{t("settings.noProgram")}</option>
            {degreeProgramsQuery.data?.map((program) => (
              <option key={program.id} value={program.id}>{program.name}</option>
            ))}
          </select>
        </label>
        <Button className="mt-2 w-fit" disabled={updateProfile.isPending || profileQuery.isLoading} type="submit">
          {updateProfile.isPending ? t("settings.saving") : t("settings.save")}
        </Button>
      </form>
    </>
  );
}
