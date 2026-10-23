import { useEffect, useState, type ReactNode } from 'react';
import { Modal } from 'antd';
import AdminIcon, { type AdminIconName } from './AdminIcon';

export default function RecordDialog({
  title,
  subtitle,
  icon,
  children,
  onClose,
  busy = false,
  width = 1040,
}: {
  title: string;
  subtitle?: string;
  icon: AdminIconName;
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
  width?: number;
}) {
  const [returnFocus] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );
  useEffect(
    () => () => {
      requestAnimationFrame(() => {
        if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
      });
    },
    [returnFocus],
  );
  return (
    <Modal
      open
      title={
        <div className="flex items-center gap-3 pe-10">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#edc57d]/40 bg-[linear-gradient(135deg,#f6dfa0,#c49536)] text-[#4e141c]">
            <AdminIcon name={icon} width={26} />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-[#fff5e1]">{title}</h2>
            {subtitle && (
              <p aria-hidden="true" className="mt-1 text-sm font-medium text-[#f2d6a2]">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      }
      onCancel={onClose}
      keyboard={!busy}
      closable={busy ? false : { 'aria-label': `بستن ${title}` }}
      mask={{ closable: !busy }}
      footer={null}
      width={`min(${width}px, calc(100vw - 24px))`}
      style={{ top: 'max(12px, 5dvh)', paddingBottom: 12 }}
      classNames={{
        container: '!overflow-hidden !rounded-[24px] !p-0',
        header: '!m-0 !bg-[linear-gradient(125deg,#701e2a,#300c14)] !p-4 sm:!p-5',
        body: '!max-h-[calc(90dvh_-_100px)] !overflow-y-auto !p-3 [scrollbar-gutter:stable] sm:!p-5',
      }}
      className="[&_.ant-modal-close]:!top-6 [&_.ant-modal-close]:!text-[#fff5e1] [&_.ant-form-item-label>label]:!font-semibold"
      destroyOnHidden
    >
      {children}
    </Modal>
  );
}
