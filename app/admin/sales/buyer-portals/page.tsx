import { AdminShell } from "../../admin-shell";
import { buyerTickets } from "../../../data/demo";
import { BuyerPortalsManager } from "./buyer-portals-manager";

export default function BuyerPortalsPage() {
  return (
    <AdminShell
      activeLabel="Alıcı kabinetləri"
      description="Alıcıların öz biletlərinə çıxışını, magic link/OTP statuslarını, transfer imkanlarını və kabinet əməliyyatlarını idarə et."
      title="Alıcı kabinetləri"
    >
      <BuyerPortalsManager tickets={buyerTickets} />
    </AdminShell>
  );
}
