import type { Table, UserOptions } from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: Table;
    autoTable: (options: UserOptions) => void;
  }
}
