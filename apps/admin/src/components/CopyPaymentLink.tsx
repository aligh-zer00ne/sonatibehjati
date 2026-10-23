import { useRef, useState } from 'react';
import { Button } from 'antd';
import AdminIcon from './AdminIcon';
export default function CopyPaymentLink({ url }: { url: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  return (
    <div className="space-y-2">
      <div className="flex min-w-0 flex-wrap gap-2">
        <input
          aria-label="آدرس لینک پرداخت"
          ref={input}
          value={url}
          readOnly
          dir="ltr"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#e8ded1] bg-[#faf6ee] px-3 text-sm"
        />
        <Button
          className="!h-12 !rounded-xl !font-bold"
          icon={<AdminIcon name="copy" width={19} />}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setMessage('لینک کپی شد.');
            } catch {
              input.current?.focus();
              input.current?.select();
              setMessage('لینک انتخاب شد؛ آن را کپی کنید.');
            }
          }}
        >
          کپی لینک
        </Button>
        {typeof navigator.share === 'function' && (
          <Button
            className="!h-12 !rounded-xl"
            icon={<AdminIcon name="share" width={19} />}
            onClick={() => {
              void navigator.share({ title: 'پرداخت به سنتی بهجتی', url }).catch((e) => {
                if (e instanceof Error && e.name !== 'AbortError')
                  setMessage('اشتراک‌گذاری انجام نشد؛ لینک را کپی کنید.');
              });
            }}
          >
            اشتراک‌گذاری
          </Button>
        )}
      </div>
      <p role="status" className="text-xs text-[#796653]">
        {message}
      </p>
    </div>
  );
}
