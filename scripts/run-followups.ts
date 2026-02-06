import { prisma } from "../src/server/db";
import { getPendingFollowUpJobs, markFollowUpJobSent } from "../src/server/followups";
import { sendReminderEmail } from "../src/server/email";
import { logInvoiceEvent } from "../src/server/invoices";

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

    const senderName =
      invoice.user.senderProfile?.companyName ||
      invoice.user.senderProfile?.displayName ||
      invoice.user.email;

    const senderEmail = invoice.user.senderProfile?.emailFrom || invoice.user.email;

    const isOverdue = invoice.dueDate < new Date();

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
        isOverdue,
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
