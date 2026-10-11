import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export default function PrintSheet({
  children,
  size = 'A5 portrait',
  margin = '10mm',
}: {
  children: ReactNode;
  size?: string;
  margin?: string;
}) {
  return createPortal(
    <div id="behjati-admin-print" className="hidden print:!block" dir="rtl">
      <style media="print">{`
      @page { size: ${size}; margin: ${margin}; }
      body > *:not(#behjati-admin-print) { display: none !important; }
      #behjati-admin-print { display: block !important; font-family: 'Vazirmatn Variable', sans-serif; }
    `}</style>
      {children}
    </div>,
    document.body,
  );
}
