import { useState, type FormEvent } from "react";
import { Download, Eye, FileText, Plus, Trash2, Upload, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PaginationControls } from "../../components/data-display/PaginationControls";
import { Button } from "../../components/ui/button";
import { documentsApi } from "../../api/documentsApi";
import { apiErrorMessage } from "../../lib/apiErrorMessage";
import type { CampusDocument } from "../../types/Document";

export function DocumentsPage() {
  const { i18n, t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const documentsQuery = useQuery({
    queryKey: ["documents", page],
    queryFn: () => documentsApi.list({ page, per_page: 15 }),
  });
  const detailQuery = useQuery({
    queryKey: ["document", selectedId],
    queryFn: () => documentsApi.getById(selectedId!),
    enabled: selectedId !== null,
  });
  const uploadDocument = useMutation({
    mutationFn: (input: { title: string; category: string; file: File }) =>
      documentsApi.upload(input, setUploadProgress),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      setShowUpload(false);
      setUploadProgress(null);
    },
  });
  const deleteDocument = useMutation({
    mutationFn: documentsApi.remove,
    onSuccess: async (_result, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["documents"] }),
        queryClient.removeQueries({ queryKey: ["document", id] }),
      ]);
      if (selectedId === id) setSelectedId(null);
    },
  });
  const downloadDocument = useMutation({
    mutationFn: async (document: CampusDocument) => ({
      blob: await documentsApi.download(document.id),
      filename: document.metadata?.original_name || document.title,
    }),
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    },
  });

  function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return;
    setUploadProgress(0);
    uploadDocument.mutate({
      title: String(form.get("title")).trim(),
      category: String(form.get("category")).trim(),
      file,
    });
  }

  const documents = documentsQuery.data?.data ?? [];

  return (
    <>
      <section className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-700">{t("brand.name")}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{t("navigation.documents")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t("pageDescriptions.documents")}</p>
        </div>
        <Button className="w-fit" onClick={() => {
          uploadDocument.reset();
          setUploadProgress(null);
          setShowUpload(true);
        }}>
          <Plus aria-hidden="true" size={16} />
          {t("documentPage.upload")}
        </Button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold">{t("documents.title")}</h2>
        </div>
        {documentsQuery.isPending ? (
          <p aria-live="polite" className="p-6 text-sm text-slate-600">{t("documentPage.loading")}</p>
        ) : documentsQuery.isError ? (
          <p className="p-6 text-sm text-red-700" role="alert">{apiErrorMessage(documentsQuery.error)}</p>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {documents.map((document) => (
                <article className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center" key={document.id}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <FileText aria-hidden="true" size={18} />
                  </span>
                  <button className="min-w-0 flex-1 text-left" onClick={() => setSelectedId(document.id)} type="button">
                    <span className="block truncate text-sm font-semibold">{document.title}</span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      {[document.category, document.metadata?.original_name, formatBytes(document.size)].filter(Boolean).join(" · ") || t("documentPage.noDetails")}
                    </span>
                  </button>
                  <span className="text-xs text-slate-500">{formatDate(document.created_at, i18n.resolvedLanguage)}</span>
                  <div className="flex gap-2">
                    <IconButton
                      label={t("documentPage.view")}
                      onClick={() => setSelectedId(document.id)}
                      icon={<Eye aria-hidden="true" size={16} />}
                    />
                    <IconButton
                      disabled={downloadDocument.isPending}
                      label={t("documentPage.download")}
                      onClick={() => downloadDocument.mutate(document)}
                      icon={<Download aria-hidden="true" size={16} />}
                    />
                    <IconButton
                      disabled={deleteDocument.isPending}
                      label={t("documentPage.delete")}
                      onClick={() => {
                        if (window.confirm(t("documentPage.confirmDelete", { title: document.title }))) {
                          deleteDocument.mutate(document.id);
                        }
                      }}
                      icon={<Trash2 aria-hidden="true" size={16} />}
                    />
                  </div>
                </article>
              ))}
              {documents.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-slate-500">{t("documentPage.empty")}</p>
              )}
            </div>
            {documentsQuery.data && (
              <PaginationControls meta={documentsQuery.data.meta} onPageChange={setPage} />
            )}
          </>
        )}
        {(downloadDocument.isError || deleteDocument.isError) && (
          <p className="border-t border-slate-100 px-5 py-3 text-sm text-red-700" role="alert">
            {apiErrorMessage(downloadDocument.error ?? deleteDocument.error)}
          </p>
        )}
      </section>

      {selectedId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedId(null);
        }}>
          <section aria-labelledby="document-detail-title" aria-modal="true" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" role="dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-blue-700">{t("brand.name")}</p>
                <h2 className="mt-1 text-xl font-bold" id="document-detail-title">{t("documentPage.details")}</h2>
              </div>
              <button aria-label={t("common.close")} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setSelectedId(null)} type="button">
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            {detailQuery.isPending ? (
              <p aria-live="polite" className="mt-5 text-sm text-slate-600">{t("documentPage.loading")}</p>
            ) : detailQuery.isError ? (
              <p className="mt-5 text-sm text-red-700" role="alert">{apiErrorMessage(detailQuery.error)}</p>
            ) : (
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <DetailField label={t("documentPage.title")} value={detailQuery.data.title} />
                <DetailField label={t("documentPage.category")} value={detailQuery.data.category || "—"} />
                <DetailField label={t("documentPage.filename")} value={detailQuery.data.metadata?.original_name || "—"} />
                <DetailField label={t("documentPage.type")} value={detailQuery.data.mime_type || "—"} />
                <DetailField label={t("documentPage.size")} value={formatBytes(detailQuery.data.size) || "—"} />
                <DetailField label={t("documentPage.uploaded")} value={formatDate(detailQuery.data.created_at, i18n.resolvedLanguage)} />
              </dl>
            )}
          </section>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !uploadDocument.isPending) {
            setShowUpload(false);
            setUploadProgress(null);
          }
        }}>
          <section aria-labelledby="upload-document-title" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" role="dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-blue-700">{t("brand.name")}</p>
                <h2 className="mt-1 text-xl font-bold" id="upload-document-title">{t("documentPage.upload")}</h2>
              </div>
              <button aria-label={t("common.close")} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" disabled={uploadDocument.isPending} onClick={() => {
                setShowUpload(false);
                setUploadProgress(null);
              }} type="button">
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <form className="mt-6 flex flex-col gap-4" onSubmit={submitUpload}>
              <FormField label={t("documentPage.title")} name="title" required />
              <FormField label={t("documentPage.category")} name="category" />
              <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-blue-300">
                <Upload aria-hidden="true" className="text-blue-700" size={28} />
                <span className="mt-3 text-sm font-semibold">{t("documentPage.chooseFile")}</span>
                <span className="mt-1 text-xs text-slate-500">{t("documentPage.fileRules")}</span>
                <input accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="sr-only" name="file" required type="file" />
              </label>
              {uploadProgress !== null && (
                <div aria-live="polite" className="text-sm text-slate-600">
                  <div className="mb-1 flex justify-between"><span>{t("documentPage.uploading")}</span><span>{uploadProgress}%</span></div>
                  <progress aria-label={t("documentPage.uploadProgress")} className="w-full accent-blue-700" max="100" value={uploadProgress} />
                </div>
              )}
              {uploadDocument.isError && (
                <p className="text-sm text-red-700" role="alert">{apiErrorMessage(uploadDocument.error)}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button disabled={uploadDocument.isPending} onClick={() => {
                  setShowUpload(false);
                  setUploadProgress(null);
                }} type="button" variant="outline">{t("common.cancel")}</Button>
                <Button disabled={uploadDocument.isPending} type="submit">
                  {uploadDocument.isPending ? t("documentPage.uploading") : t("documentPage.upload")}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function IconButton({
  label,
  onClick,
  icon,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {icon}
    </button>
  );
}

function FormField({ label, name, required = false }: { label: string; name: string; required?: boolean }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {label}
      <input className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" name={name} required={required} />
    </label>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function formatBytes(value: number | null): string | null {
  if (value === null) return null;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string, language?: string): string {
  return new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(new Date(value));
}
