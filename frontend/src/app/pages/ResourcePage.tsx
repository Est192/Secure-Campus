import { Navigate, useParams } from "react-router-dom";
import { PeoplePage } from "./PeoplePage";
import { DocumentsPage } from "./DocumentsPage";
import { RequestsPage } from "./RequestsPage";
import { GradesPage } from "./GradesPage";
import { AcademicGroupsPage } from "./AcademicGroupsPage";
import { AcademicsPage } from "./AcademicsPage";

export function ResourcePage() {
  const { section = "" } = useParams();

  if (section === "people") return <PeoplePage />;
  if (section === "documents") return <DocumentsPage />;
  if (section === "requests") return <RequestsPage />;
  if (section === "grades") return <GradesPage />;
  if (section === "groups") return <AcademicGroupsPage />;
  if (section === "academics") return <AcademicsPage />;
  return <Navigate replace to="/" />;
}
