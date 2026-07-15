import { AdminShell } from "../../admin-shell";
import { buyerTickets, events, pastEvents } from "../../../data/demo";
import { ReportsManager } from "./reports-manager";

export default function AccountingReportsPage() {
  return (
    <AdminShell
      activeLabel="Hesabatlar"
      description="Tədbir üzrə P&L, gəlir, xərc, invoice arxivi və dövr hesabatlarını export üçün hazırla."
      title="Hesabatlar"
    >
      <ReportsManager events={[...events, ...pastEvents]} tickets={buyerTickets} />
    </AdminShell>
  );
}
