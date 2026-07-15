import { AdminShell } from "../../admin-shell";
import { CrmManager } from "../crm-manager";

export default function ParticipantsPage() {
  return (
    <AdminShell
      activeLabel="İştirakçılar"
      description="Tədbirlər üzrə iştirakçı, bilet, check-in, mənbə və maraq datasının CRM görünüşü."
      title="İştirakçılar"
    >
      <CrmManager module="participants" />
    </AdminShell>
  );
}
