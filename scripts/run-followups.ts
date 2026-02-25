import { prisma } from "../src/server/db";
import { getPendingFollowUpJobs, markFollowUpJobSent } from "../src/server/followups";
import { sendReminderEmail, type EmailBranding } from "../src/server/email";
import { logInvoiceEvent } from "../src/server/invoices";
import { BRANDING } from "../src/shared/config/config";

async function main() {
  console.log("Starting follow-up job runner...");
  console.log(`Current time: ${new Date().toISOString()}`);

  const pendingJobs = await getPendingFollowUpJobs();
  console.log(`Found ${pendingJobs.length} pending follow-up job(s)`);

  for (const job of pendingJobs) {
    const { invoice } = job;

    if (invoice.status === "PAID" || invoice.paidAt) {
      console.log(`Skipping job ${job.id}: Invoice ${invoice.id} is already paid`);
      await prisma.followUpJob.update({
        where: { id: job.id },
        data: { status: "CANCELED" },
      });
      continue;
    }

    const senderProfile = invoice.user.senderProfile;

    const senderName =
      senderProfile?.companyName || senderProfile?.displayName || invoice.user.email;

    const senderEmail = senderProfile?.emailFrom || invoice.user.email;

    const isOverdue = invoice.dueDate < new Date();

    const branding: EmailBranding = {
      primaryColor: senderProfile?.primaryColor || BRANDING.DEFAULT_PRIMARY_COLOR,
      logoUrl: senderProfile?.logoUrl || null,
      fontFamily: senderProfile?.fontFamily || null,
      footerText: senderProfile?.footerText || null,
      companyAddress: senderProfile?.address || null,
    };

    console.log(`Processing job ${job.id} for invoice ${invoice.publicId}...`);

    try {
      await sendReminderEmail({
        clientName: invoice.client.name,
        clientEmail: invoice.client.email,
        senderName,
        senderEmail,
        publicId: invoice.publicId,
        total: invoice.total,
        currency: invoice.currency,
        dueDate: invoice.dueDate,
        periodStart: invoice.periodStart,
        periodEnd: invoice.periodEnd,
        message: invoice.message,
        isOverdue,
        branding,
        paymentReference: invoice.paymentReference || null,
        items: invoice.items.map((item) => ({
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
        itemGroups: invoice.itemGroups.map((group) => ({
          title: group.title,
          items: group.items.map((item) => ({
            title: item.title,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        })),
      });

      await markFollowUpJobSent(job.id);
      await logInvoiceEvent(invoice.id, "REMINDER_SENT", {
        jobId: job.id,
        isOverdue,
      });

      console.log(`Successfully sent reminder for invoice ${invoice.publicId}`);
    } catch (error) {
      console.error(`Failed to send reminder for job ${job.id}:`, error);
    }
  }

  console.log("Follow-up job runner completed.");
}

main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
