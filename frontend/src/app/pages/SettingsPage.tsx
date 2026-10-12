import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/button";

type LayoutContext = { notify: (message: string) => void };

export function SettingsPage() {
  const { t } = useTranslation();
  const { notify } = useOutletContext<LayoutContext>();

  return (
    <>
      <header className="mb-6">
        <p className="mb-1 text-sm font-medium text-blue-700">{t("settings.eyebrow")}</p>
        <h1 className="text-2xl font-bold tracking-tight">{t("navigation.settings")}</h1>
      </header>
      <form
        className="flex max-w-3xl flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          notify(t("settings.saved"));
        }}
      >
        <h2 className="text-sm font-bold">{t("settings.profileTitle")}</h2>
        {[
          { id: "name", labelKey: "settings.fullName", value: "Olivia Martin" },
          { id: "email", labelKey: "settings.email", value: "olivia.martin@securecampus.edu" },
          { id: "program", labelKey: "settings.program", value: "" },
        ].map((field) => (
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" key={field.id}>
            {t(field.labelKey)}
            <input
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              defaultValue={field.value || t("settings.programValue")}
              id={field.id}
              name={field.id}
            />
          </label>
        ))}
        <Button className="mt-2 w-fit" type="submit">
          {t("settings.save")}
        </Button>
      </form>
    </>
  );
}
