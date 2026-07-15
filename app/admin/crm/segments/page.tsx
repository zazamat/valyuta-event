import { AdminShell } from "../../admin-shell";
import { CrmManager } from "../crm-manager";

export default function SegmentsPage() {
  return (
    <AdminShell
      activeLabel="Seqmentlər"
      description="Maraq, davranış, tədbir, ödəniş və reklam mənbələrinə görə dinamik auditoriyalar yarat."
      title="Seqmentlər"
    >
      <CrmManager module="segments" />
    </AdminShell>
  );
}
