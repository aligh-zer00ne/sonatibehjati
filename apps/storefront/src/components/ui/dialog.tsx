'use client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useRef, type ReactNode } from 'react';
import { buttonVariants } from './button';
import { cn } from '@/lib/utils';
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  placement = 'center',
  closeLabel = 'بستن',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  placement?: 'center' | 'right';
  closeLabel?: string;
}) {
  const opener = useRef<HTMLElement | null>(null);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="dialog-overlay"
          className="fixed inset-0 z-50 bg-foreground/45 backdrop-blur-[3px] duration-250 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none!"
        />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          onOpenAutoFocus={() => {
            opener.current = document.activeElement as HTMLElement | null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (opener.current?.isConnected) opener.current.focus({ preventScroll: true });
          }}
          dir="rtl"
          className={cn(
            'fixed z-[51] overflow-auto border-border bg-popover text-popover-foreground shadow-[0_12px_32px_rgba(70,44,25,0.08)] outline-none ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none!',
            placement === 'right'
              ? 'inset-y-0 right-0 flex h-dvh w-[min(86vw,340px)] flex-col rounded-l-3xl border-l px-5 pt-7 pb-[calc(20px+env(safe-area-inset-bottom))] data-[state=open]:slide-in-from-right data-[state=open]:duration-300 data-[state=closed]:slide-out-to-right data-[state=closed]:duration-200'
              : 'top-1/2 left-1/2 max-h-[88dvh] w-[min(94vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border px-[22px] py-7 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:duration-400 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-2 data-[state=closed]:duration-200',
          )}
        >
          <DialogPrimitive.Title className="pl-10 text-[21px] font-[750]">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 mb-5 text-xs text-muted-foreground">
            {description}
          </DialogPrimitive.Description>
          <DialogPrimitive.Close
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'absolute top-3 left-2.5 rounded-xl text-foreground motion-safe:hover:[&_svg]:rotate-90',
            )}
            aria-label={closeLabel}
          >
            <X size={22} />
          </DialogPrimitive.Close>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
