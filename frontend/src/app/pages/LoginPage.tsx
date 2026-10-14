import { useState, type FormEvent } from "react";
import axios from "axios";
import { ArrowLeft, LogIn, ShieldCheck } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isRestoring, login } = useAuth();
  const [showReset, setShowReset] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (showReset) {
      setError(t("login.resetUnavailable"));
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password, device_name: "SecureCampus web" });
      const state = location.state as { from?: { pathname?: string } } | null;
      navigate(state?.from?.pathname ?? "/", { replace: true });
    } catch (requestError: unknown) {
      setError(
        axios.isAxiosError(requestError) && requestError.response?.status === 422
          ? t("login.invalidCredentials")
          : t("login.authError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isRestoring) {
    return <div aria-live="polite" className="sr-only" role="status">{t("login.restoringSession")}</div>;
  }
  if (user) return <Navigate replace to="/" />;

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
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            {!showReset && (
              <label className="flex flex-col gap-2 text-xs font-semibold">
                {t("login.password")}
                <input
                  autoComplete="current-password"
                  className="rounded-lg border border-slate-200 p-3 text-sm font-normal outline-none focus:border-blue-500"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>
            )}
            {error && (
              <p aria-live="assertive" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800" role="alert">
                {error}
              </p>
            )}
            <Button className="mt-1 w-full" disabled={isSubmitting} type="submit">
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
