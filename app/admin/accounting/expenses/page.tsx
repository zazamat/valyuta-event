import { AdminShell } from "../../admin-shell";
import { buyerTickets, events, pastEvents } from "../../../data/demo";
import { SalesStatisticsManager } from "../../sales/statistics/statistics-manager";

export default function AccountingExpensesPage() {
  return (
    <AdminShell
      activeLabel="Xərclər"
      description="Məkan, texnika, reklam, catering, çap və digər xərcləri tədbir, növ, vendor və status üzrə idarə et."
      title="Xərclər"
    >
      <SalesStatisticsManager events={[...events, ...pastEvents]} initialModule="expenses" tickets={buyerTickets} />
    </AdminShell>
  );
}
