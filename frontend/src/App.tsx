import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Activity, Languages, ShieldCheck } from "lucide-react";
import {
  languageNames,
  supportedLanguages,
} from "./i18n";

type ApiStatus = "loading" | "available" | "unavailable";

export default function App() {
  const { i18n, t } = useTranslation();
  const [apiStatus, setApiStatus] = useState<ApiStatus>("loading");
  const currentLanguage =
    supportedLanguages.find((language) => language === i18n.resolvedLanguage) ??
    "en-US";

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    document.title = t("app.title");
  }, [currentLanguage, t]);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/health", {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Health check returned HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(() => setApiStatus("available"))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setApiStatus("unavailable");
      });

    return () => controller.abort();
  }, []);

  const statusLabel = t(`health.${apiStatus}`);

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <header className="flex items-center justify-between gap-5">
          <a
            className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
            href="/"
            aria-label={t("app.homeLabel")}
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-900/15">
              <ShieldCheck aria-hidden="true" size={24} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-950">
              {t("app.title")}
            </span>
          </a>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
            <Languages aria-hidden="true" size={17} />
            <span className="sr-only">{t("language.label")}</span>
            <select
              aria-label={t("language.label")}
              className="max-w-36 cursor-pointer bg-transparent font-medium text-slate-800 outline-none"
              onChange={(event) => {
                void i18n.changeLanguage(event.target.value);
              }}
              value={currentLanguage}
            >
              {supportedLanguages.map((language) => (
                <option key={language} value={language}>
                  {t(languageNames[language])}
                </option>
              ))}
            </select>
          </label>
        </header>

        <section className="grid flex-1 items-center gap-12 pb-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-800">
              <span className="size-2 rounded-full bg-blue-600" />
              {t("dashboard.eyebrow")}
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {t("dashboard.heading")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              {t("dashboard.description")}
            </p>
          </div>

          <aside className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/[0.04] sm:p-8">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Activity aria-hidden="true" size={22} />
            </div>
            <h2 className="mt-6 text-xl font-semibold tracking-tight text-slate-950">
              {t("health.title")}
            </h2>
            <p className="mt-2 leading-7 text-slate-600">
              {t("health.description")}
            </p>
            <div
              aria-live="polite"
              className={`mt-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                apiStatus === "available"
                  ? "bg-emerald-50 text-emerald-800"
                  : apiStatus === "unavailable"
                    ? "bg-rose-50 text-rose-800"
                    : "bg-slate-100 text-slate-700"
              }`}
              role="status"
            >
              <span className="size-2 rounded-full bg-current" />
              {statusLabel}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
