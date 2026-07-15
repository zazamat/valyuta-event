import { AdminShell } from "../../admin-shell";
import { CrmManager } from "../crm-manager";

export default function SmartTablesPage() {
  return (
    <AdminShell
      activeLabel="Smart cədvəllər"
      description="CRM cədvəlləri üçün saxlanmış görünüşlər, sütun qaydaları və export standartları."
      title="Smart cədvəllər"
    >
      <CrmManager module="smart" />
    </AdminShell>
  );
}
