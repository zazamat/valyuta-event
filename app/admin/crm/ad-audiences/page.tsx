import { AdminShell } from "../../admin-shell";
import { CrmManager } from "../crm-manager";

export default function AdAudiencesPage() {
  return (
    <AdminShell
      activeLabel="Reklam auditoriyaları"
      description="Meta, LinkedIn, Google və digər kanallar üçün retargeting, custom və lookalike auditoriyalarını idarə et."
      title="Reklam auditoriyaları"
    >
      <CrmManager module="audiences" />
    </AdminShell>
  );
}
