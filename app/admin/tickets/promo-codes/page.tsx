import { AdminShell } from "../../admin-shell";
import { promoCodes } from "../../../data/demo";
import { PromoCodesManager } from "./promo-codes-manager";

export default function PromoCodesPage() {
  return (
    <AdminShell
      activeLabel="Promo kodlar"
      description="Promo kodların yaradılması, tədbir/bilet/maraq qrupu üzrə tətbiqi, limitləri, istifadəsi və export əməliyyatları."
      title="Promo kodlar"
    >
      <PromoCodesManager initialPromos={promoCodes} />
    </AdminShell>
  );
}
