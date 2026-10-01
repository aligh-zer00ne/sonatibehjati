'use client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { buttonVariants } from './button';
import { cn } from '@/lib/utils';
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="dialog-overlay"
          className="fixed inset-0 z-50 bg-foreground/45 backdrop-blur-[3px]"
        />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          dir="rtl"
          className="fixed top-1/2 left-1/2 z-[51] max-h-[88dvh] w-[min(94vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-3xl border border-border bg-popover px-[22px] py-7 text-popover-foreground shadow-[0_12px_32px_rgba(70,44,25,0.08)]"
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
              'absolute top-3 left-2.5 rounded-xl text-foreground',
            )}
            aria-label="بستن"
          >
            <X size={22} />
          </DialogPrimitive.Close>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
