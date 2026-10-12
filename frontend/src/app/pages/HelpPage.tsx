import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LifeBuoy, ShieldCheck } from "lucide-react";

type LayoutContext = { notify: (message: string) => void };

const topics = ["transcript", "grades", "support", "privacy"];

export function HelpPage() {
  const { t } = useTranslation();
  const { notify } = useOutletContext<LayoutContext>();

  return (
    <>
      <header className="mb-6">
        <p className="mb-1 text-sm font-medium text-blue-700">{t("help.eyebrow")}</p>
        <h1 className="text-2xl font-bold tracking-tight">{t("navigation.help")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("pageDescriptions.help")}</p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        {topics.map((topic) => (
          <button
            className="rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition-colors hover:border-blue-300"
            key={topic}
            onClick={() => notify(t("help.topicSelected"))}
          >
            {topic === "privacy" ? (
              <ShieldCheck aria-hidden="true" className="text-blue-700" size={21} />
            ) : (
              <LifeBuoy aria-hidden="true" className="text-blue-700" size={21} />
            )}
            <h2 className="mt-4 text-sm font-bold">{t(`help.topics.${topic}.title`)}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {t(`help.topics.${topic}.description`)}
            </p>
          </button>
        ))}
      </section>
    </>
  );
}
