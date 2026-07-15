import { AdminShell } from "../../admin-shell";
import { CrmManager } from "../crm-manager";

export default function ContactsPage() {
  return (
    <AdminShell
      activeLabel="Kontaktlar"
      description="Alıcı, lead, sponsor və iştirakçı kontaktlarını razılıq, maraq, mənbə və satış tarixçəsi ilə idarə et."
      title="Kontaktlar"
    >
      <CrmManager module="contacts" />
    </AdminShell>
  );
}
