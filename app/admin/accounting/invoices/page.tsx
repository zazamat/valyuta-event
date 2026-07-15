import { AdminShell } from "../../admin-shell";
import { buyerTickets } from "../../../data/demo";
import { InvoiceManager } from "./invoice-manager";

export default function AccountingInvoicesPage() {
  return (
    <AdminShell
      activeLabel="Qəbz və invoice"
      description="Invoice, qəbz, PDF/çap, yenidən göndərmə, refund və maliyyə sənədi statuslarını bir paneldən idarə et."
      title="Qəbz və invoice"
    >
      <InvoiceManager tickets={buyerTickets} />
    </AdminShell>
  );
}
