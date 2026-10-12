import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useOutletContext, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PeoplePage } from "./PeoplePage";
import { DocumentsPage } from "./DocumentsPage";
import { RequestsPage } from "./RequestsPage";
import { RecordList } from "../../components/data-display/RecordList";
import { ActionDialog } from "../../components/dialogs/ActionDialog";
import { Button } from "../../components/ui/button";
import { campusService } from "../../services/mock/campusService";
import type { MockRecord } from "../../types/campus";

type LayoutContext = { notify: (message: string) => void };

const sections: Record<
  string,
  { titleKey: string; descriptionKey: string; action?: string; listTitleKey: string; dataKey?: string }
> = {
  academics: {
    titleKey: "navigation.academics",
    descriptionKey: "pageDescriptions.academics",
    action: "browseCourses",
    listTitleKey: "courses.title",
    dataKey: "grades",
  },
  grades: {
    titleKey: "navigation.grades",
    descriptionKey: "pageDescriptions.grades",
    listTitleKey: "grades.title",
    dataKey: "grades",
  },
  documents: {
    titleKey: "navigation.documents",
    descriptionKey: "pageDescriptions.documents",
    action: "uploadDocument",
    listTitleKey: "documents.title",
    dataKey: "documents",
  },
  requests: {
    titleKey: "navigation.requests",
    descriptionKey: "pageDescriptions.requests",
    action: "newRequest",
    listTitleKey: "requests.title",
    dataKey: "requests",
  },
  groups: {
    titleKey: "navigation.groups",
    descriptionKey: "pageDescriptions.groups",
    action: "createGroup",
    listTitleKey: "groups.title",
    dataKey: "groups",
  },
  people: {
    titleKey: "navigation.people",
    descriptionKey: "pageDescriptions.people",
    action: "createUser",
    listTitleKey: "people.title",
    dataKey: "people",
  },
};

export function ResourcePage() {
  const { section = "" } = useParams();
  const { notify } = useOutletContext<LayoutContext>();
  const config = sections[section];

  if (section === "people") return <PeoplePage />;
  if (section === "documents") return <DocumentsPage />;
  if (section === "requests") return <RequestsPage />;
  if (!config) return null;

  return <MockResourcePage config={config} notify={notify} />;
}

function MockResourcePage({
  config,
  notify,
}: {
  config: (typeof sections)[string];
  notify: LayoutContext["notify"];
}) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<MockRecord[]>([]);
  const [action, setAction] = useState("");

  useEffect(() => {
    void campusService.getRecords(config.dataKey ?? "").then(setRows);
  }, [config.dataKey]);

  return (
    <>
      <section className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-700">{t("brand.name")}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">
            {t(config.titleKey)}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {t(config.descriptionKey)}
          </p>
        </div>
        {config.action && (
          <Button className="w-fit" onClick={() => setAction(config.action!)}>
            <Plus aria-hidden="true" size={16} />
            {t(`dialogs.actions.${config.action}`)}
          </Button>
        )}
      </section>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["stats.activeCourses", "06"],
          ["stats.completion", "72%"],
          ["stats.needsAttention", "03"],
        ].map(([labelKey, value]) => (
          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm" key={labelKey}>
            <p className="text-xs font-medium text-slate-600">{t(labelKey)}</p>
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{t("common.sampleDataNotice")}</p>
          </article>
        ))}
      </div>
      <RecordList
        onOpen={(row) => notify(t("common.recordSelected", { name: t(row.titleKey) }))}
        rows={rows}
        title={t(config.listTitleKey)}
      />
      {action && (
        <ActionDialog
          action={action}
          onClose={() => setAction("")}
          onComplete={(message) => {
            setAction("");
            notify(message);
          }}
        />
      )}
    </>
  );
}
