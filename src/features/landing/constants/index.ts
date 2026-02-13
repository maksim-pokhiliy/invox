import DashboardIcon from "@mui/icons-material/Dashboard";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RepeatIcon from "@mui/icons-material/Repeat";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const SITE_URL = "https://getpaid.dev";
export const GITHUB_URL = "https://github.com/maksim-pokhiliy/getpaid";

export const FEATURES = [
  {
    title: "Invoices",
    icon: ReceiptLongIcon,
    description:
      "Create, edit, and send professional invoices with line items, taxes, and discounts",
  },
  {
    title: "View Tracking",
    icon: VisibilityIcon,
    description: "Know exactly when your client opens an invoice — no more guessing",
  },
  {
    title: "Recurring",
    icon: RepeatIcon,
    description: "Set up recurring invoices that generate and send automatically",
  },
  {
    title: "Follow-ups",
    icon: NotificationsActiveIcon,
    description: "Automated payment reminders so you never have to chase clients manually",
  },
  {
    title: "PDF Export",
    icon: PictureAsPdfIcon,
    description: "Generate clean PDF invoices your clients can download and print",
  },
  {
    title: "Dashboard",
    icon: DashboardIcon,
    description: "See your revenue, outstanding amounts, and payment trends at a glance",
  },
] as const;

export const TECH_STACK = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "MUI 7",
  "Prisma",
  "PostgreSQL",
  "Zod",
  "React Query",
] as const;
