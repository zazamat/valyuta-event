import { AdminShell } from "../../admin-shell";
import { buyerTickets, events, pastEvents } from "../../../data/demo";
import { SalesStatisticsManager } from "../../sales/statistics/statistics-manager";

export default function AccountingIncomePage() {
  return (
    <AdminShell
      activeLabel="Gəlirlər"
      description="Bilet satışı, sponsor gəliri, korporativ paket və digər gəlir növlərini tədbirlər üzrə qeyd et və izləyin."
      title="Gəlirlər"
    >
      <SalesStatisticsManager events={[...events, ...pastEvents]} initialModule="income" tickets={buyerTickets} />
    </AdminShell>
  );
}
