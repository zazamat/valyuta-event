import { AdminShell } from "../../admin-shell";
import { CrmManager } from "../crm-manager";

export default function DataQualityPage() {
  return (
    <AdminShell
      activeLabel="Data keyfiyyəti"
      description="Dublikat, səhv telefon, çatışmayan consent və attribution boşluqlarını sistemli şəkildə təmizlə."
      title="Data keyfiyyəti"
    >
      <CrmManager module="quality" />
    </AdminShell>
  );
}
