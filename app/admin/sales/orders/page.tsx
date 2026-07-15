import { AdminShell } from "../../admin-shell";
import { buyerTickets } from "../../../data/demo";
import { OrdersManager } from "./orders-manager";

export default function SalesOrdersPage() {
  return (
    <AdminShell
      activeLabel="Sifarişlər"
      description="Bütün tədbirlər üzrə sifarişləri, ödəniş statuslarını, alıcı məlumatlarını və sifariş daxilindəki biletləri bir yerdən idarə et."
      title="Sifarişlər"
    >
      <OrdersManager tickets={buyerTickets} />
    </AdminShell>
  );
}
