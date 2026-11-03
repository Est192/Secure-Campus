import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";

export default function App() {
  const { i18n, t } = useTranslation();
  const [apiStatus, setApiStatus] = useState<"loading" | "available" | "unavailable">(
    "loading",
  );
  const currentLanguage = i18n.resolvedLanguage ?? "en-US";

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

  return (
    <>
      <RouterProvider router={router} />
      <div className="sr-only" aria-live="polite" role="status">
        {t(`health.${apiStatus}`)}
      </div>
      <span className="sr-only" data-language={currentLanguage} />
    </>
  );
}
