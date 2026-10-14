import { useState, type FormEvent, type ReactNode } from "react";
import { ClipboardList, Eye, Plus, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PaginationControls } from "../../components/data-display/PaginationControls";
import { Button } from "../../components/ui/button";
import { requestsApi } from "../../api/requestsApi";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage } from "../../lib/apiErrorMessage";
import type { CampusRequest, CreateRequest, RequestStatus, TransitionRequestStatus } from "../../types/Request";

const requestStatuses: RequestStatus[] = ["Pending", "Under Review", "Approved", "Rejected"];

function isRequestStatus(value: string): value is RequestStatus {
  return requestStatuses.some((status) => status === value);
}

function statusTranslationKey(status: RequestStatus): string {
  return `requestPage.statuses.${status.replace(" ", "")}`;
}

export function RequestsPage() {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canManageRequests = user?.role?.name === "Administrator"
    || user?.role?.name === "Department Head";
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "">("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const requestsQuery = useQuery({
    queryKey: ["requests", page, canManageRequests ? statusFilter : ""],
    queryFn: () => requestsApi.list({
      page,
      per_page: 15,
      status: canManageRequests ? statusFilter || undefined : undefined,
    }),
  });
  const detailQuery = useQuery({
    queryKey: ["request", selectedId],
    queryFn: () => {
      if (selectedId === null) throw new Error("A request ID is required.");
      return requestsApi.getById(selectedId);
    },
    enabled: selectedId !== null,
  });
  const createRequest = useMutation({
    mutationFn: requestsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      setShowCreate(false);
      setPage(1);
    },
  });
  const updateRequest = useMutation({
    mutationFn: (input: { id: number; request: CreateRequest }) =>
      requestsApi.update(input.id, input.request),
    onSuccess: async (_request, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["requests"] }),
        queryClient.invalidateQueries({ queryKey: ["request", input.id] }),
      ]);
      setEditing(false);
    },
  });
  const transitionRequest = useMutation({
    mutationFn: (input: { id: number; transition: TransitionRequestStatus }) =>
      requestsApi.transition(input.id, input.transition),
    onSuccess: async (_request, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["requests"] }),
        queryClient.invalidateQueries({ queryKey: ["request", input.id] }),
      ]);
      setReviewNotes("");
    },
  });
  const deleteRequest = useMutation({
    mutationFn: requestsApi.remove,
    onSuccess: async (_result, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["requests"] }),
        queryClient.removeQueries({ queryKey: ["request", id] }),
      ]);
      setSelectedId(null);
      setPage(1);
    },
  });

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createRequest.mutate({
      type: String(form.get("type")).trim(),
      title: String(form.get("title")).trim(),
      description: String(form.get("description")).trim() || null,
    });
  }

  function submitUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedId === null) return;
    const form = new FormData(event.currentTarget);
    updateRequest.mutate({
      id: selectedId,
      request: {
        type: String(form.get("type")).trim(),
        title: String(form.get("title")).trim(),
        description: String(form.get("description")).trim() || null,
      },
    });
  }

  function transitionTo(status: Exclude<RequestStatus, "Pending">) {
    if (selectedId === null) return;
    transitionRequest.mutate({
      id: selectedId,
      transition: { status, review_notes: reviewNotes.trim() || null },
    });
  }

  const allRequests = requestsQuery.data?.data ?? [];
  const visibleRequests = statusFilter && !canManageRequests
    ? allRequests.filter((request) => request.status === statusFilter)
    : allRequests;
  const currentRequest = detailQuery.data;
  const isOwnedPending = currentRequest?.user_id === user?.id && currentRequest?.status === "Pending";
  const allowedTransitions: Exclude<RequestStatus, "Pending">[] = currentRequest?.status === "Pending"
    ? ["Under Review", "Rejected"]
    : currentRequest?.status === "Under Review"
      ? ["Approved", "Rejected"]
      : [];

  return (
    <>
      <section className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-700">{t("brand.name")}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{t("navigation.requests")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t("pageDescriptions.requests")}</p>
        </div>
        <Button className="w-fit" onClick={() => {
          createRequest.reset();
          setShowCreate(true);
        }}>
          <Plus aria-hidden="true" size={16} />
          {t("requestPage.newRequest")}
        </Button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold">{t("requests.title")}</h2>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">{t("requestPage.filterStatus")}</span>
            <select
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
              onChange={(event) => {
                const value = event.target.value;
                setStatusFilter(isRequestStatus(value) ? value : "");
                setPage(1);
              }}
              value={statusFilter}
            >
              <option value="">{t("requestPage.allStatuses")}</option>
              {requestStatuses.map((status) => (
                <option key={status} value={status}>{t(statusTranslationKey(status))}</option>
              ))}
            </select>
          </label>
        </div>
        {requestsQuery.isPending ? (
          <p aria-live="polite" className="p-6 text-sm text-slate-600">{t("requestPage.loading")}</p>
        ) : requestsQuery.isError ? (
          <p className="p-6 text-sm text-red-700" role="alert">{apiErrorMessage(requestsQuery.error)}</p>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {visibleRequests.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  language={i18n.resolvedLanguage}
                  onOpen={() => {
                    setEditing(false);
                    setSelectedId(request.id);
                  }}
                  t={t}
                />
              ))}
              {visibleRequests.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-slate-500">{t("requestPage.empty")}</p>
              )}
            </div>
            {requestsQuery.data && (
              <PaginationControls meta={requestsQuery.data.meta} onPageChange={setPage} />
            )}
          </>
        )}
      </section>

      {showCreate && (
        <Modal title={t("requestPage.newRequest")} onClose={() => setShowCreate(false)}>
          <form className="mt-6 flex flex-col gap-4" onSubmit={submitCreate}>
            <FormField label={t("requestPage.type")} name="type" required />
            <FormField label={t("requestPage.title")} name="title" required />
            <TextAreaField label={t("requestPage.description")} name="description" />
            {createRequest.isError && (
              <p className="text-sm text-red-700" role="alert">{apiErrorMessage(createRequest.error)}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowCreate(false)} type="button" variant="outline">{t("common.cancel")}</Button>
              <Button disabled={createRequest.isPending} type="submit">
                {createRequest.isPending ? t("requestPage.saving") : t("requestPage.submit")}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {selectedId !== null && (
        <Modal title={t("requestPage.details")} onClose={() => {
          setSelectedId(null);
          setEditing(false);
        }}>
          {detailQuery.isPending ? (
            <p aria-live="polite" className="mt-5 text-sm text-slate-600">{t("requestPage.loading")}</p>
          ) : detailQuery.isError ? (
            <p className="mt-5 text-sm text-red-700" role="alert">{apiErrorMessage(detailQuery.error)}</p>
          ) : currentRequest && (
            editing && isOwnedPending ? (
              <form className="mt-6 flex flex-col gap-4" onSubmit={submitUpdate}>
                <FormField defaultValue={currentRequest.type} label={t("requestPage.type")} name="type" required />
                <FormField defaultValue={currentRequest.title} label={t("requestPage.title")} name="title" required />
                <TextAreaField defaultValue={currentRequest.description ?? ""} label={t("requestPage.description")} name="description" />
                {updateRequest.isError && (
                  <p className="text-sm text-red-700" role="alert">{apiErrorMessage(updateRequest.error)}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setEditing(false)} type="button" variant="outline">{t("common.cancel")}</Button>
                  <Button disabled={updateRequest.isPending} type="submit">
                    {updateRequest.isPending ? t("requestPage.saving") : t("requestPage.save")}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-5">
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <DetailField label={t("requestPage.title")} value={currentRequest.title} />
                  <DetailField label={t("requestPage.type")} value={currentRequest.type} />
                  <DetailField label={t("requestPage.status")} value={t(statusTranslationKey(currentRequest.status))} />
                  <DetailField label={t("requestPage.submitted")} value={formatDate(currentRequest.created_at, i18n.resolvedLanguage)} />
                  <div className="sm:col-span-2">
                    <DetailField label={t("requestPage.description")} value={currentRequest.description || "—"} />
                  </div>
                  <div className="sm:col-span-2">
                    <DetailField label={t("requestPage.reviewNotes")} value={currentRequest.review_notes || "—"} />
                  </div>
                </dl>
                {transitionRequest.isError && (
                  <p className="mt-4 text-sm text-red-700" role="alert">{apiErrorMessage(transitionRequest.error)}</p>
                )}
                {updateRequest.isError && (
                  <p className="mt-4 text-sm text-red-700" role="alert">{apiErrorMessage(updateRequest.error)}</p>
                )}
                {deleteRequest.isError && (
                  <p className="mt-4 text-sm text-red-700" role="alert">{apiErrorMessage(deleteRequest.error)}</p>
                )}
                {canManageRequests && allowedTransitions.length > 0 && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      {t("requestPage.reviewNotes")}
                      <textarea className="resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" onChange={(event) => setReviewNotes(event.target.value)} rows={3} value={reviewNotes} />
                    </label>
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      {allowedTransitions.map((status) => (
                        <Button
                          disabled={transitionRequest.isPending}
                          key={status}
                          onClick={() => transitionTo(status)}
                          variant={status === "Rejected" ? "outline" : "primary"}
                        >
                          {t(statusTranslationKey(status))}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                  {isOwnedPending && (
                    <Button onClick={() => {
                      updateRequest.reset();
                      setEditing(true);
                    }} variant="outline">{t("requestPage.edit")}</Button>
                  )}
                  {canManageRequests && (
                    <Button
                      disabled={deleteRequest.isPending}
                      onClick={() => {
                        if (window.confirm(t("requestPage.confirmDelete", { title: currentRequest.title }))) {
                          deleteRequest.mutate(currentRequest.id);
                        }
                      }}
                      variant="outline"
                    >
                      <Trash2 aria-hidden="true" size={16} />
                      {t("requestPage.delete")}
                    </Button>
                  )}
                </div>
              </div>
            )
          )}
        </Modal>
      )}
    </>
  );
}

function RequestRow({
  request,
  language,
  onOpen,
  t,
}: {
  request: CampusRequest;
  language?: string;
  onOpen: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <article className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <ClipboardList aria-hidden="true" size={18} />
      </span>
      <button className="min-w-0 flex-1 text-left" onClick={onOpen} type="button">
        <span className="block truncate text-sm font-semibold">{request.title}</span>
        <span className="mt-1 block truncate text-xs text-slate-500">
          {request.type} · {formatDate(request.created_at, language)}
        </span>
      </button>
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(request.status)}`}>
        {t(statusTranslationKey(request.status))}
      </span>
      <button aria-label={t("requestPage.view")} className="self-start rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 sm:self-auto" onClick={onOpen} type="button">
        <Eye aria-hidden="true" size={16} />
      </button>
    </article>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section aria-labelledby="request-modal-title" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" role="dialog">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-blue-700">{t("brand.name")}</p>
            <h2 className="mt-1 text-xl font-bold" id="request-modal-title">{title}</h2>
          </div>
          <button aria-label={t("common.close")} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} type="button">
            <X aria-hidden="true" size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function FormField({
  label,
  name,
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {label}
      <input className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" defaultValue={defaultValue} name={name} required={required} />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {label}
      <textarea className="resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" defaultValue={defaultValue} name={name} rows={4} />
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

function statusClass(status: RequestStatus): string {
  if (status === "Approved") return "bg-emerald-50 text-emerald-700";
  if (status === "Rejected") return "bg-red-50 text-red-700";
  if (status === "Under Review") return "bg-blue-50 text-blue-700";
  return "bg-amber-50 text-amber-800";
}

function formatDate(value: string, language?: string): string {
  return new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(new Date(value));
}
