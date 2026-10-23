import { useState } from 'react';
import { formatNumber } from '@behjati/shared';
import type { AdminOrderFieldsFragment } from '../generated/graphql';
import InvoiceSheet, { invoiceFormats, type InvoiceFormat } from '../components/InvoiceSheet';
import PrintWorkspace from '../components/PrintWorkspace';
function preferredFormat(): InvoiceFormat {
  try {
    const saved = localStorage.getItem('behjati-invoice-format');
    if (saved === 'A4' || saved === 'A5' || saved === 'THERMAL') return saved;
  } catch {
    /* Optional preference. */
  }
  return 'A5';
}
export default function Invoice({
  order,
  onClose,
}: {
  order: AdminOrderFieldsFragment;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<InvoiceFormat>(preferredFormat);
  const formats = Object.fromEntries(
    Object.entries(invoiceFormats).map(([key, value]) => [
      key,
      {
        ...value,
        shortLabel: key === 'THERMAL' ? '۸ سانتی' : key,
        margin: key === 'THERMAL' ? 4 : key === 'A4' ? 12 : 8,
        ...(key !== 'THERMAL' ? { pageSize: `${key} portrait` } : {}),
      },
    ]),
  );
  return (
    <PrintWorkspace
      title={`فاکتور سفارش ${formatNumber(order.number)}`}
      subtitle={`فاکتور ${formatNumber(order.number)} · ریال`}
      fileName={`فاکتور-${order.number}-سنتی-بهجتی`}
      formats={formats}
      format={format}
      onFormatChange={(next) => {
        setFormat(next as InvoiceFormat);
        try {
          localStorage.setItem('behjati-invoice-format', next);
        } catch {
          /* Optional preference. */
        }
      }}
      onClose={onClose}
    >
      <InvoiceSheet order={order} format={format} />
    </PrintWorkspace>
  );
}
