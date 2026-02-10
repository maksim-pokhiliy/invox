import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const BCRYPT_ROUNDS = 12;
const DEMO_EMAIL = "demo@invox.dev";
const DEMO_PASSWORD = "demo1234";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cents(dollars: number): number {
  return Math.round(dollars * 100);
}

const CLIENT_DATA = [
  { name: "Acme Corporation", email: "billing@acme.corp", defaultRate: cents(175) },
  { name: "Globex Industries", email: "accounts@globex.io", defaultRate: cents(120) },
  { name: "Initech Solutions", email: "finance@initech.com", defaultRate: null },
  { name: "Umbrella Labs", email: "payments@umbrella-labs.org", defaultRate: null },
  { name: "Stark Enterprises", email: "ap@stark-ent.com", defaultRate: cents(200) },
  { name: "Wayne Technologies", email: "invoices@waynetech.co", defaultRate: null },
  { name: "Pied Piper Inc", email: "billing@piedpiper.io", defaultRate: null },
  { name: "Hooli Systems", email: "finance@hooli.systems", defaultRate: cents(160) },
  { name: "Cyberdyne Analytics", email: "payments@cyberdyne.ai", defaultRate: null },
  { name: "Aperture Creative", email: "accounts@aperture.design", defaultRate: null },
];

const LINE_ITEM_CATALOG = [
  { description: "Web Development", unitPrice: cents(150) },
  { description: "UI/UX Design", unitPrice: cents(120) },
  { description: "API Integration", unitPrice: cents(175) },
  { description: "Database Architecture", unitPrice: cents(200) },
  { description: "DevOps Consulting", unitPrice: cents(180) },
  { description: "Code Review & Audit", unitPrice: cents(130) },
  { description: "Technical Writing", unitPrice: cents(90) },
  { description: "Project Management", unitPrice: cents(110) },
  { description: "QA Testing", unitPrice: cents(95) },
  { description: "Cloud Infrastructure Setup", unitPrice: cents(160) },
  { description: "Mobile App Development", unitPrice: cents(170) },
  { description: "SEO Optimization", unitPrice: cents(100) },
  { description: "Performance Tuning", unitPrice: cents(185) },
  { description: "Security Assessment", unitPrice: cents(210) },
  { description: "Data Migration", unitPrice: cents(140) },
];

const TEMPLATE_DATA = [
  {
    name: "Standard Consulting",
    description: "Hourly consulting work",
    dueDays: 30,
    taxRate: 0,
    items: [
      { description: "Consulting Hours", quantity: 10, unitPrice: cents(150) },
      { description: "Project Management", quantity: 5, unitPrice: cents(110) },
    ],
  },
  {
    name: "Web Project",
    description: "Full-stack web development project",
    dueDays: 14,
    taxRate: 20,
    items: [
      { description: "Web Development", quantity: 40, unitPrice: cents(150) },
      { description: "UI/UX Design", quantity: 20, unitPrice: cents(120) },
      { description: "QA Testing", quantity: 10, unitPrice: cents(95) },
    ],
  },
  {
    name: "Monthly Retainer",
    description: "Ongoing monthly support",
    dueDays: 15,
    taxRate: 0,
    items: [
      { description: "Monthly Retainer Fee", quantity: 1, unitPrice: cents(5000) },
      { description: "Support Hours (included)", quantity: 20, unitPrice: cents(0) },
    ],
  },
  {
    name: "Security Audit",
    description: "Comprehensive security review",
    dueDays: 30,
    taxRate: 10,
    items: [
      { description: "Security Assessment", quantity: 8, unitPrice: cents(210) },
      { description: "Code Review & Audit", quantity: 16, unitPrice: cents(130) },
      { description: "Technical Writing", quantity: 4, unitPrice: cents(90) },
      { description: "DevOps Consulting", quantity: 4, unitPrice: cents(180) },
    ],
  },
];

interface InvoiceSpec {
  clientIndex: number;
  status: "DRAFT" | "SENT" | "VIEWED" | "OVERDUE" | "PARTIALLY_PAID" | "PAID";
  createdDaysAgo: number;
  dueDaysFromCreation: number;
  taxRate: number;
  itemCount: number;
}

const INVOICE_SPECS: InvoiceSpec[] = [
  { clientIndex: 0, status: "PAID", createdDaysAgo: 150, dueDaysFromCreation: 30, taxRate: 0, itemCount: 3 },
  { clientIndex: 0, status: "PAID", createdDaysAgo: 120, dueDaysFromCreation: 30, taxRate: 10, itemCount: 2 },
  { clientIndex: 0, status: "SENT", createdDaysAgo: 5, dueDaysFromCreation: 30, taxRate: 0, itemCount: 3 },
  { clientIndex: 1, status: "PAID", createdDaysAgo: 140, dueDaysFromCreation: 14, taxRate: 20, itemCount: 4 },
  { clientIndex: 1, status: "OVERDUE", createdDaysAgo: 60, dueDaysFromCreation: 30, taxRate: 20, itemCount: 3 },
  { clientIndex: 1, status: "VIEWED", createdDaysAgo: 10, dueDaysFromCreation: 30, taxRate: 20, itemCount: 2 },
  { clientIndex: 2, status: "PAID", createdDaysAgo: 130, dueDaysFromCreation: 30, taxRate: 0, itemCount: 2 },
  { clientIndex: 2, status: "PARTIALLY_PAID", createdDaysAgo: 45, dueDaysFromCreation: 30, taxRate: 0, itemCount: 3 },
  { clientIndex: 2, status: "DRAFT", createdDaysAgo: 2, dueDaysFromCreation: 30, taxRate: 0, itemCount: 2 },
  { clientIndex: 3, status: "PAID", createdDaysAgo: 100, dueDaysFromCreation: 14, taxRate: 10, itemCount: 3 },
  { clientIndex: 3, status: "SENT", createdDaysAgo: 8, dueDaysFromCreation: 30, taxRate: 10, itemCount: 2 },
  { clientIndex: 3, status: "DRAFT", createdDaysAgo: 1, dueDaysFromCreation: 30, taxRate: 10, itemCount: 4 },
  { clientIndex: 4, status: "PAID", createdDaysAgo: 110, dueDaysFromCreation: 30, taxRate: 0, itemCount: 2 },
  { clientIndex: 4, status: "PAID", createdDaysAgo: 80, dueDaysFromCreation: 30, taxRate: 0, itemCount: 3 },
  { clientIndex: 4, status: "OVERDUE", createdDaysAgo: 50, dueDaysFromCreation: 14, taxRate: 0, itemCount: 2 },
  { clientIndex: 5, status: "PAID", createdDaysAgo: 160, dueDaysFromCreation: 30, taxRate: 15, itemCount: 3 },
  { clientIndex: 5, status: "VIEWED", createdDaysAgo: 12, dueDaysFromCreation: 30, taxRate: 15, itemCount: 2 },
  { clientIndex: 5, status: "DRAFT", createdDaysAgo: 0, dueDaysFromCreation: 30, taxRate: 15, itemCount: 3 },
  { clientIndex: 6, status: "PAID", createdDaysAgo: 90, dueDaysFromCreation: 30, taxRate: 0, itemCount: 2 },
  { clientIndex: 6, status: "PARTIALLY_PAID", createdDaysAgo: 40, dueDaysFromCreation: 30, taxRate: 0, itemCount: 3 },
  { clientIndex: 6, status: "SENT", createdDaysAgo: 3, dueDaysFromCreation: 14, taxRate: 0, itemCount: 2 },
  { clientIndex: 7, status: "PAID", createdDaysAgo: 170, dueDaysFromCreation: 30, taxRate: 20, itemCount: 4 },
  { clientIndex: 7, status: "OVERDUE", createdDaysAgo: 55, dueDaysFromCreation: 14, taxRate: 20, itemCount: 2 },
  { clientIndex: 7, status: "DRAFT", createdDaysAgo: 1, dueDaysFromCreation: 30, taxRate: 20, itemCount: 3 },
  { clientIndex: 8, status: "PAID", createdDaysAgo: 75, dueDaysFromCreation: 30, taxRate: 0, itemCount: 3 },
  { clientIndex: 8, status: "SENT", createdDaysAgo: 7, dueDaysFromCreation: 30, taxRate: 0, itemCount: 2 },
  { clientIndex: 8, status: "VIEWED", createdDaysAgo: 15, dueDaysFromCreation: 30, taxRate: 0, itemCount: 3 },
  { clientIndex: 9, status: "PAID", createdDaysAgo: 85, dueDaysFromCreation: 14, taxRate: 10, itemCount: 2 },
  { clientIndex: 9, status: "PARTIALLY_PAID", createdDaysAgo: 35, dueDaysFromCreation: 30, taxRate: 10, itemCount: 3 },
  { clientIndex: 9, status: "OVERDUE", createdDaysAgo: 65, dueDaysFromCreation: 30, taxRate: 10, itemCount: 2 },
];

function pickItems(count: number, startOffset: number) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const catalogItem = LINE_ITEM_CATALOG[(startOffset + i) % LINE_ITEM_CATALOG.length];
    const quantity = randomInt(1, 20);
    items.push({
      description: catalogItem.description,
      quantity,
      unitPrice: catalogItem.unitPrice,
      amount: quantity * catalogItem.unitPrice,
    });
  }
  return items;
}

async function main() {
  console.log("Seeding database...");

  const existingUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existingUser) {
    console.log("Deleting existing demo user data...");
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: DEMO_EMAIL,
        passwordHash,
        saltEdgeCustomerId: null,
      },
    });
    console.log(`Created user: ${user.email}`);

    const senderProfile = await tx.senderProfile.create({
      data: {
        userId: user.id,
        companyName: "Invox Demo Studio",
        displayName: "Invox Demo",
        emailFrom: "invoices@invox.dev",
        address: "123 Innovation Blvd\nSan Francisco, CA 94105\nUnited States",
        taxId: "US-12-3456789",
        defaultCurrency: "USD",
        primaryColor: "#1976d2",
        accentColor: "#9c27b0",
        footerText: "Thank you for your business!\nPayment is due within the specified period.",
        fontFamily: "system",
        invoicePrefix: "DEMO",
        defaultRate: cents(150),
      },
    });
    console.log(`Created sender profile: ${senderProfile.companyName}`);

    const clients = await Promise.all(
      CLIENT_DATA.map((c) =>
        tx.client.create({
          data: { userId: user.id, name: c.name, email: c.email, defaultRate: c.defaultRate },
        })
      )
    );
    console.log(`Created ${clients.length} clients`);

    const templates = await Promise.all(
      TEMPLATE_DATA.map((t) =>
        tx.invoiceTemplate.create({
          data: {
            userId: user.id,
            name: t.name,
            description: t.description,
            dueDays: t.dueDays,
            taxRate: t.taxRate,
            items: { create: t.items },
          },
        })
      )
    );
    console.log(`Created ${templates.length} templates`);

    let invoiceCount = 0;
    let itemCount = 0;
    let eventCount = 0;
    let paymentCount = 0;

    for (const spec of INVOICE_SPECS) {
      const client = clients[spec.clientIndex];
      const createdAt = daysAgo(spec.createdDaysAgo);
      const dueDate = new Date(createdAt);
      dueDate.setDate(dueDate.getDate() + spec.dueDaysFromCreation);

      const items = pickItems(spec.itemCount, invoiceCount * 3);
      const subtotal = items.reduce((sum, it) => sum + it.amount, 0);
      const taxAmount = Math.round(subtotal * (spec.taxRate / 100));
      const total = subtotal + taxAmount;

      let paidAmount = 0;
      let sentAt: Date | null = null;
      let viewedAt: Date | null = null;
      let paidAt: Date | null = null;
      let paymentMethod: "MANUAL" | "BANK_TRANSFER" | "CASH" | "OTHER" | null = null;

      if (spec.status !== "DRAFT") {
        sentAt = new Date(createdAt);
        sentAt.setDate(sentAt.getDate() + 1);
      }
      if (spec.status === "VIEWED" || spec.status === "PAID" || spec.status === "PARTIALLY_PAID") {
        viewedAt = new Date(sentAt!);
        viewedAt.setDate(viewedAt.getDate() + randomInt(1, 3));
      }
      if (spec.status === "PAID") {
        paidAmount = total;
        paidAt = new Date(viewedAt ?? sentAt!);
        paidAt.setDate(paidAt.getDate() + randomInt(3, 14));
        paymentMethod = "BANK_TRANSFER";
      }
      if (spec.status === "PARTIALLY_PAID") {
        paidAmount = Math.round(total * 0.4);
        paymentMethod = "MANUAL";
      }

      const invoice = await tx.invoice.create({
        data: {
          userId: user.id,
          clientId: client.id,
          publicId: nanoid(10),
          currency: "USD",
          status: spec.status,
          subtotal,
          taxRate: spec.taxRate,
          taxAmount,
          total,
          paidAmount,
          dueDate,
          sentAt,
          viewedAt,
          paidAt,
          paymentMethod,
          notes: spec.status === "DRAFT" ? "Draft — review before sending." : null,
          tags: spec.taxRate > 0 ? ["taxable"] : [],
          paymentReference: spec.status !== "DRAFT" ? `INV${nanoid(6).toUpperCase()}` : null,
          createdAt,
          updatedAt: createdAt,
          items: { create: items },
        },
      });

      invoiceCount++;
      itemCount += items.length;

      const events: Array<{
        invoiceId: string;
        type: "CREATED" | "SENT" | "VIEWED" | "PAID_MANUAL" | "PAYMENT_RECORDED" | "STATUS_CHANGED" | "REMINDER_SENT";
        payload?: object;
        createdAt: Date;
      }> = [{ invoiceId: invoice.id, type: "CREATED", createdAt }];

      if (sentAt) {
        events.push({ invoiceId: invoice.id, type: "SENT", createdAt: sentAt });
      }
      if (viewedAt) {
        events.push({ invoiceId: invoice.id, type: "VIEWED", createdAt: viewedAt });
      }
      if (spec.status === "PAID" && paidAt) {
        events.push({
          invoiceId: invoice.id,
          type: "PAID_MANUAL",
          payload: { amount: total, method: "BANK_TRANSFER" },
          createdAt: paidAt,
        });
      }
      if (spec.status === "PARTIALLY_PAID") {
        const payDate = new Date(viewedAt ?? sentAt!);
        payDate.setDate(payDate.getDate() + randomInt(5, 10));
        events.push({
          invoiceId: invoice.id,
          type: "PAYMENT_RECORDED",
          payload: { amount: paidAmount, method: "MANUAL" },
          createdAt: payDate,
        });

        await tx.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: paidAmount,
            method: "MANUAL",
            note: "Partial payment received",
            paidAt: payDate,
            createdAt: payDate,
          },
        });
        paymentCount++;
      }
      if (spec.status === "PAID" && paidAt) {
        await tx.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: total,
            method: "BANK_TRANSFER",
            note: "Full payment received",
            paidAt,
            createdAt: paidAt,
          },
        });
        paymentCount++;
      }
      if (spec.status === "OVERDUE") {
        events.push({
          invoiceId: invoice.id,
          type: "STATUS_CHANGED",
          payload: { from: "SENT", to: "OVERDUE" },
          createdAt: dueDate,
        });
      }

      await tx.invoiceEvent.createMany({ data: events });
      eventCount += events.length;
    }

    console.log(`Created ${invoiceCount} invoices with ${itemCount} items`);
    console.log(`Created ${eventCount} events`);
    console.log(`Created ${paymentCount} payments`);

    const recurringSpecs = [
      {
        clientIndex: 0,
        name: "Monthly Retainer — Acme",
        frequency: "MONTHLY" as const,
        status: "ACTIVE" as const,
        dueDays: 15,
        taxRate: 0,
        autoSend: true,
        nextRunDays: 8,
        lastRunDaysAgo: 22,
        items: [
          { description: "Monthly Retainer Fee", quantity: 1, unitPrice: cents(5000) },
          { description: "Support Hours (20h)", quantity: 20, unitPrice: cents(0) },
        ],
      },
      {
        clientIndex: 3,
        name: "Quarterly Security Review",
        frequency: "QUARTERLY" as const,
        status: "ACTIVE" as const,
        dueDays: 30,
        taxRate: 10,
        autoSend: false,
        nextRunDays: 45,
        lastRunDaysAgo: 45,
        items: [
          { description: "Security Assessment", quantity: 8, unitPrice: cents(210) },
          { description: "Code Review & Audit", quantity: 12, unitPrice: cents(130) },
        ],
      },
      {
        clientIndex: 6,
        name: "Biweekly Dev Sprint",
        frequency: "BIWEEKLY" as const,
        status: "ACTIVE" as const,
        dueDays: 14,
        taxRate: 0,
        autoSend: true,
        nextRunDays: 3,
        lastRunDaysAgo: 11,
        items: [
          { description: "Web Development", quantity: 40, unitPrice: cents(150) },
          { description: "QA Testing", quantity: 8, unitPrice: cents(95) },
          { description: "Project Management", quantity: 4, unitPrice: cents(110) },
        ],
      },
      {
        clientIndex: 9,
        name: "Annual License Renewal",
        frequency: "YEARLY" as const,
        status: "PAUSED" as const,
        dueDays: 30,
        taxRate: 10,
        autoSend: false,
        nextRunDays: 180,
        lastRunDaysAgo: 185,
        items: [
          { description: "Annual Software License", quantity: 1, unitPrice: cents(12000) },
          { description: "Priority Support Package", quantity: 1, unitPrice: cents(3600) },
        ],
      },
    ];

    let recurringCount = 0;
    let recurringItemCount = 0;

    for (const spec of recurringSpecs) {
      await tx.recurringInvoice.create({
        data: {
          userId: user.id,
          clientId: clients[spec.clientIndex].id,
          name: spec.name,
          frequency: spec.frequency,
          status: spec.status,
          currency: "USD",
          taxRate: spec.taxRate,
          dueDays: spec.dueDays,
          autoSend: spec.autoSend,
          nextRunAt: daysFromNow(spec.nextRunDays),
          lastRunAt: daysAgo(spec.lastRunDaysAgo),
          items: { create: spec.items },
        },
      });
      recurringCount++;
      recurringItemCount += spec.items.length;
    }

    console.log(`Created ${recurringCount} recurring invoices with ${recurringItemCount} items`);

    await tx.followUpRule.create({
      data: {
        userId: user.id,
        enabled: true,
        mode: "AFTER_SENT",
        delaysDays: [1, 3, 7],
      },
    });
    console.log("Created follow-up rule");

    const sentInvoices = await tx.invoice.findMany({
      where: { userId: user.id, status: { in: ["SENT", "VIEWED", "OVERDUE"] } },
      take: 6,
      orderBy: { createdAt: "desc" },
    });

    let followUpCount = 0;
    for (const inv of sentInvoices) {
      const scheduledFor = new Date(inv.sentAt ?? inv.createdAt);
      scheduledFor.setDate(scheduledFor.getDate() + 3);

      const isSent = scheduledFor < new Date();
      await tx.followUpJob.create({
        data: {
          invoiceId: inv.id,
          scheduledFor,
          status: isSent ? "SENT" : "PENDING",
          sentAt: isSent ? scheduledFor : null,
        },
      });
      followUpCount++;
    }
    console.log(`Created ${followUpCount} follow-up jobs`);

    const bankConnection = await tx.bankConnection.create({
      data: {
        userId: user.id,
        saltEdgeConnectionId: "demo_conn_001",
        provider: "demo_bank",
        providerName: "Demo National Bank",
        country: "US",
        status: "active",
        lastSyncAt: daysAgo(1),
      },
    });

    const checkingAccount = await tx.bankAccount.create({
      data: {
        connectionId: bankConnection.id,
        saltEdgeAccountId: "demo_acct_checking_001",
        name: "Business Checking",
        nature: "account",
        balance: cents(24350.75),
        currencyCode: "USD",
      },
    });

    const savingsAccount = await tx.bankAccount.create({
      data: {
        connectionId: bankConnection.id,
        saltEdgeAccountId: "demo_acct_savings_001",
        name: "Business Savings",
        nature: "savings",
        balance: cents(85000),
        currencyCode: "USD",
      },
    });

    console.log("Created bank connection with 2 accounts");

    const paidInvoices = await tx.invoice.findMany({
      where: { userId: user.id, status: "PAID" },
      orderBy: { paidAt: "desc" },
    });

    const matchableInvoices = await tx.invoice.findMany({
      where: { userId: user.id, status: { in: ["SENT", "VIEWED", "OVERDUE"] } },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });

    const transactionData: Array<{
      accountId: string;
      saltEdgeId: string;
      amount: number;
      currencyCode: string;
      description: string;
      madeOn: Date;
      status: "PENDING" | "AUTO_MATCHED" | "CONFIRMED" | "IGNORED";
      matchedInvoiceId?: string;
      matchConfidence?: number;
    }> = [];

    for (let i = 0; i < Math.min(3, paidInvoices.length); i++) {
      const inv = paidInvoices[i];
      transactionData.push({
        accountId: checkingAccount.id,
        saltEdgeId: `demo_txn_confirmed_${i}`,
        amount: inv.total,
        currencyCode: "USD",
        description: `Payment from ${CLIENT_DATA[i % CLIENT_DATA.length].name}`,
        madeOn: inv.paidAt ?? daysAgo(30),
        status: "CONFIRMED",
        matchedInvoiceId: inv.id,
        matchConfidence: 1.0,
      });
    }

    const autoMatchSpecs: Array<{
      invoiceIndex: number;
      confidence: number;
      descPrefix: string;
      daysAgo: number;
    }> = [
      { invoiceIndex: 0, confidence: 0.98, descPrefix: "Wire transfer from", daysAgo: 2 },
      { invoiceIndex: 1, confidence: 0.95, descPrefix: "ACH deposit —", daysAgo: 4 },
      { invoiceIndex: 2, confidence: 0.93, descPrefix: "Bank transfer from", daysAgo: 6 },
      { invoiceIndex: 3, confidence: 0.91, descPrefix: "Payment received from", daysAgo: 8 },
      { invoiceIndex: 4, confidence: 0.96, descPrefix: "Incoming wire —", daysAgo: 3 },
      { invoiceIndex: 5, confidence: 0.92, descPrefix: "SEPA transfer from", daysAgo: 5 },
      { invoiceIndex: 6, confidence: 0.94, descPrefix: "Direct deposit —", daysAgo: 7 },
      { invoiceIndex: 7, confidence: 0.90, descPrefix: "Online payment from", daysAgo: 10 },
    ];

    const autoMatchSources = [
      ...matchableInvoices,
      ...paidInvoices.slice(3),
    ];

    for (let i = 0; i < autoMatchSpecs.length && i < autoMatchSources.length; i++) {
      const spec = autoMatchSpecs[i];
      const inv = autoMatchSources[spec.invoiceIndex % autoMatchSources.length];
      const clientName = (inv as unknown as { client?: { name: string } }).client?.name
        ?? CLIENT_DATA[(spec.invoiceIndex + 3) % CLIENT_DATA.length].name;

      transactionData.push({
        accountId: checkingAccount.id,
        saltEdgeId: `demo_txn_auto_${i}`,
        amount: inv.total,
        currencyCode: "USD",
        description: `${spec.descPrefix} ${clientName}`,
        madeOn: daysAgo(spec.daysAgo),
        status: "AUTO_MATCHED",
        matchedInvoiceId: inv.id,
        matchConfidence: spec.confidence,
      });
    }

    const unmatchedDescs = [
      "Wire transfer — consulting",
      "Payment ref: PROJ-2024-Q3",
      "ACH deposit — client retainer",
      "Incoming transfer",
      "Invoice payment — unknown ref",
      "Bank transfer #TRF-8891",
      "Payment — project milestone",
    ];

    for (let i = 0; i < unmatchedDescs.length; i++) {
      transactionData.push({
        accountId: checkingAccount.id,
        saltEdgeId: `demo_txn_unmatched_${i}`,
        amount: cents(randomInt(500, 8000)),
        currencyCode: "USD",
        description: unmatchedDescs[i],
        madeOn: daysAgo(randomInt(3, 45)),
        status: "PENDING",
      });
    }

    for (let i = 0; i < 5; i++) {
      transactionData.push({
        accountId: savingsAccount.id,
        saltEdgeId: `demo_txn_savings_${i}`,
        amount: cents(randomInt(1000, 15000)),
        currencyCode: "USD",
        description: `Interest / transfer #${i + 1}`,
        madeOn: daysAgo(randomInt(10, 90)),
        status: i < 2 ? "IGNORED" : "PENDING",
      });
    }

    for (const txnData of transactionData) {
      await tx.bankTransaction.create({ data: txnData });
    }

    console.log(`Created ${transactionData.length} bank transactions`);
  }, { timeout: 60000 });

  console.log("\nSeed completed successfully!");
  console.log(`Login with: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
