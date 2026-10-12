import { useState, type FormEvent } from "react";
import { ArrowLeft, LogIn, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/button";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showReset, setShowReset] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <Link aria-label={t("brand.name")} className="flex items-center gap-3" to="/">
          <span className="flex size-11 items-center justify-center rounded-xl bg-blue-700 text-white">
            <ShieldCheck aria-hidden="true" size={23} />
          </span>
          <span>
            <span className="block font-bold">{t("brand.name")}</span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-500">
              {t("brand.tagline")}
            </span>
          </span>
        </Link>

        <div className="mt-9">
          {showReset ? (
            <>
              <button
                className="mb-5 flex items-center gap-2 text-xs font-semibold text-blue-700"
                onClick={() => setShowReset(false)}
              >
                <ArrowLeft aria-hidden="true" size={15} />
                {t("login.back")}
              </button>
              <h1 className="text-2xl font-bold">{t("login.resetTitle")}</h1>
              <p className="mt-2 text-sm text-slate-600">{t("login.resetDescription")}</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{t("login.title")}</h1>
              <p className="mt-2 text-sm text-slate-600">{t("login.description")}</p>
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                {t("login.mockNotice")}
              </p>
            </>
          )}

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-xs font-semibold">
              {t("login.email")}
              <input
                autoComplete="email"
                className="rounded-lg border border-slate-200 p-3 text-sm font-normal outline-none focus:border-blue-500"
                required
                type="email"
              />
            </label>
            {!showReset && (
              <label className="flex flex-col gap-2 text-xs font-semibold">
                {t("login.password")}
                <input
                  autoComplete="current-password"
                  className="rounded-lg border border-slate-200 p-3 text-sm font-normal outline-none focus:border-blue-500"
                  required
                  type="password"
                />
              </label>
            )}
            <Button className="mt-1 w-full" type="submit">
              {showReset ? (
                t("login.sendReset")
              ) : (
                <>
                  <LogIn aria-hidden="true" size={16} />
                  {t("login.signIn")}
                </>
              )}
            </Button>
          </form>
          {!showReset && (
            <button
              className="mt-5 w-full text-center text-xs font-semibold text-blue-700"
              onClick={() => setShowReset(true)}
            >
              {t("login.forgotPassword")}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
