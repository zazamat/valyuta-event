import { AdminShell } from "../../admin-shell";
import { CrmManager } from "../crm-manager";

export default function AbandonedCheckoutsPage() {
  return (
    <AdminShell
      activeLabel="Tamamlanmamış sifarişlər"
      description="Checkout-a başlayıb ödənişi tamamlamayan istifadəçiləri recovery kampaniyalarına çevir."
      title="Tamamlanmamış sifarişlər"
    >
      <CrmManager module="abandoned" />
    </AdminShell>
  );
}
