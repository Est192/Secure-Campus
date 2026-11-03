import { useState, type FormEvent } from "react";
import { Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";

type ActionDialogProps = {
  action: string;
  onClose: () => void;
  onComplete: (message: string) => void;
};

export function ActionDialog({ action, onClose, onComplete }: ActionDialogProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const isUpload = action === "documents";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onComplete(t(isUpload ? "dialogs.uploadStarted" : "dialogs.saved"));
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="action-dialog-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-blue-700">{t("brand.name")}</p>
            <h2 className="mt-1 text-xl font-bold" id="action-dialog-title">
              {t(`dialogs.actions.${action}`)}
            </h2>
          </div>
          <button
            aria-label={t("common.close")}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>

        {isUpload ? (
          <form className="mt-6" onSubmit={handleSubmit}>
            <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-200 p-8 text-center hover:border-blue-300">
              <Upload aria-hidden="true" className="text-blue-700" size={30} />
              <span className="mt-3 text-sm font-semibold">{t("dialogs.dropFile")}</span>
              <span className="mt-1 text-xs text-slate-500">{t("dialogs.fileTypes")}</span>
              <input
                accept=".pdf,.doc,.docx,.png"
                className="sr-only"
                onChange={(event) => setTitle(event.target.files?.[0]?.name ?? "")}
                type="file"
              />
            </label>
            {title && <p className="mt-3 text-sm text-slate-600">{title}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={onClose} variant="outline">
                {t("common.cancel")}
              </Button>
              <Button disabled={!title} type="submit">
                {t("dialogs.upload")}
              </Button>
            </div>
          </form>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium">
              {t("dialogs.titleField")}
              <input
                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                onChange={(event) => setTitle(event.target.value)}
                required
                value={title}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              {t("dialogs.descriptionField")}
              <textarea
                className="resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                value={description}
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button onClick={onClose} variant="outline">
                {t("common.cancel")}
              </Button>
              <Button disabled={!title.trim()} type="submit">
                {t("dialogs.save")}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
