import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
export const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-3.5 rounded-full text-sm font-[650] whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 motion-reduce:transition-none',
  {
    variants: {
      variant: {
        default:
          'border border-[#b83523] bg-primary text-primary-foreground shadow-[inset_0_0_0_2px_rgba(255,255,255,0.09)] hover:bg-brand-red-dark',
        outline: 'border border-earth bg-transparent text-earth hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'bg-transparent text-primary hover:bg-accent',
        link: 'text-primary underline-offset-4 hover:underline',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
      },
      size: {
        default: 'min-h-12 px-[26px] py-2.5',
        sm: 'min-h-11 px-4 py-2 text-xs',
        icon: 'size-11 min-h-11 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
