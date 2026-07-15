import { AdminShell } from "../../admin-shell";
import { buyerTickets } from "../../../data/demo";
import { PaymentsManager } from "../../sales/payments/payments-manager";

export default function AccountingPaymentsPage() {
  return (
    <AdminShell
      activeLabel="Ödənişlər"
      description="Uğurlu, uğursuz, gözləmədə və ləğv/refund edilmiş ödənişləri gateway və tədbir üzrə idarə et."
      title="Ödənişlər"
    >
      <PaymentsManager tickets={buyerTickets} />
    </AdminShell>
  );
}
