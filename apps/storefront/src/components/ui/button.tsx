import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
export const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-3.5 rounded-full text-sm font-[650] whitespace-nowrap transition-[color,background-color,border-color,box-shadow,translate,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.95] [&_svg]:pointer-events-none [&_svg]:shrink-0 motion-safe:[&_svg]:transition-transform motion-safe:[&_svg]:duration-300 motion-safe:hover:[&_svg]:scale-110 motion-reduce:transition-none',
  {
    variants: {
      variant: {
        default:
          "relative overflow-hidden border border-[#b83523] bg-primary text-primary-foreground shadow-[inset_0_0_0_2px_rgba(255,255,255,0.09)] hover:bg-brand-red-dark hover:shadow-[0_8px_20px_rgba(150,20,13,0.24)] after:pointer-events-none after:absolute after:inset-y-0 after:-left-1/2 after:w-1/3 after:-translate-x-full after:skew-x-[-20deg] after:bg-white/15 after:transition-transform after:duration-700 after:content-[''] hover:after:translate-x-[600%] motion-reduce:after:hidden",
        outline:
          'border border-earth bg-transparent text-earth hover:bg-accent hover:shadow-[0_6px_16px_rgba(98,69,47,0.12)]',
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
