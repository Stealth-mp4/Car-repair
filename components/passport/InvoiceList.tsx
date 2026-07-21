import type { Invoice } from "@/lib/builds";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/**
 * InvoiceList — simple mono list, each row a link-underline link to the
 * invoice file, date + amount in mono. No table-with-borders UI.
 */
export default function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return <p className="mono-label text-muted">No invoices on file yet.</p>;
  }

  return (
    <ul className="mono-label flex flex-col gap-3 text-ink">
      {invoices.map((inv) => (
        <li key={inv.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <a
            href={inv.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline"
          >
            {inv.description}
          </a>
          <span className="text-muted">
            {formatDate(inv.date)} · {formatAmount(inv.amount)}
          </span>
        </li>
      ))}
    </ul>
  );
}
