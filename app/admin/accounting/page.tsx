import { AdminShell } from "../admin-shell";
import { buyerTickets, events, pastEvents } from "../../data/demo";
import { SalesStatisticsManager } from "../sales/statistics/statistics-manager";

export default function AccountingOverviewPage() {
  return (
    <AdminShell
      activeLabel="İcmal"
      description="Tədbirlər üzrə gəlir, xərc, mənfəət, marja və ən çox qazandıran tədbirlərin maliyyə icmalı."
      title="Mühasibatlıq"
    >
      <SalesStatisticsManager events={[...events, ...pastEvents]} initialModule="overview" tickets={buyerTickets} />
    </AdminShell>
  );
}
