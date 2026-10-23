import { useState } from 'react';
import { BRAND_NAME, formatNumber } from '@behjati/shared';
import { shippingMethodLabels } from '@behjati/shared/sales';
import type { ShippingLabelValues } from '@behjati/shared/admin';
import type { AdminOrderFieldsFragment } from '../generated/graphql';
import { customerName } from '../lib/format';
import PrintWorkspace from '../components/PrintWorkspace';
import ShippingLabelSheet from '../components/ShippingLabelSheet';

export default function ShippingLabel({
  order,
  onClose,
}: {
  order: AdminOrderFieldsFragment;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<'THERMAL' | 'A5'>(
    order.shippingLabel?.paperSize === 'A5' ? 'A5' : 'THERMAL',
  );
  const saved = order.shippingLabel;
  const store = order.storeInformation;
  // Recipient, contents, carrier and money always come from the actual order snapshot.
  // Retain previously recorded sender/tracking metadata without requiring another form.
  const values: ShippingLabelValues = {
    senderName: store.isConfigured ? store.name : saved?.senderName || store.name || BRAND_NAME,
    senderPhone: store.isConfigured ? store.phone : saved?.senderPhone || store.phone,
    senderAddress: store.isConfigured ? store.address : saved?.senderAddress || store.address,
    senderPostalCode: store.isConfigured
      ? store.postalCode
      : saved?.senderPostalCode || store.postalCode,
    recipientName: order.address.recipientName || customerName(order.user),
    recipientPhone: order.address.recipientPhone || order.user.phone,
    recipientAddress: [order.address.province, order.address.city, order.address.postalAddress]
      .filter(Boolean)
      .join('، '),
    recipientPostalCode: order.address.postalCode || '',
    carrier: order.shippingMethod ? shippingMethodLabels[order.shippingMethod] : 'تحویل حضوری',
    packageWeight:
      order.shippingWeightGrams != null
        ? `${formatNumber(order.shippingWeightGrams)} گرم`
        : saved?.packageWeight || '',
    trackingNumber: saved?.trackingNumber || '',
    packageContent: '',
    note: saved?.note || '',
    paperSize: format,
  };
  return (
    <PrintWorkspace
      kind="label"
      allowPages
      title={`لیبل پستی سفارش ${formatNumber(order.number)}`}
      subtitle={`لیبل پستی · سفارش ${formatNumber(order.number)}`}
      fileName={`لیبل-${order.number}-سنتی-بهجتی`}
      formats={{
        THERMAL: {
          label: 'لیبل ۱۵ × ۱۰',
          shortLabel: '۱۵ × ۱۰',
          description: '۱۵۰ × ۱۰۰ میلی‌متر · افقی',
          width: 150,
          height: 100,
          margin: 4,
        },
        A5: {
          label: 'لیبل A5',
          shortLabel: 'A5',
          description: '۲۱۰ × ۱۴۸ میلی‌متر · افقی',
          width: 210,
          height: 148,
          margin: 4,
        },
      }}
      format={format}
      onFormatChange={(next) => setFormat(next as 'THERMAL' | 'A5')}
      onClose={onClose}
    >
      <ShippingLabelSheet order={order} values={values} />
    </PrintWorkspace>
  );
}
