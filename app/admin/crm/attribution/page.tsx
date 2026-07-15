import { AdminShell } from "../../admin-shell";
import { CrmManager } from "../crm-manager";

export default function AttributionPage() {
  return (
    <AdminShell
      activeLabel="UTM / Attribution"
      description="Reklam klikindən checkout və alışa qədər UTM, pixel və kampaniya performansını ölç."
      title="UTM / Attribution"
    >
      <CrmManager module="attribution" />
    </AdminShell>
  );
}
