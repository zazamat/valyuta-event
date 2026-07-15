import { AdminShell } from "../../admin-shell";
import { tickets } from "../../../data/demo";
import { TicketTypesManager } from "./ticket-types-manager";

export default function TicketTypesPage() {
  return (
    <AdminShell
      activeLabel="Bilet növləri"
      description="Ümumi bilet növü şablonları burada idarə olunur. Tədbir daxilində bu şablonlardan ayrıca qiymət, limit və statusla istifadə edilə bilər."
      title="Bilet növləri"
    >
      <TicketTypesManager initialTickets={tickets} />
    </AdminShell>
  );
}
