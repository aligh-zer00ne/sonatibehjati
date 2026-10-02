import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BRAND_NAME } from '@behjati/shared';
import { Card } from '@/components/ui/card';
import { SesamePattern } from '@/components/decoration/sesame-pattern';
export default function AuthFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="relative isolate mx-auto my-5 w-full max-w-[460px] overflow-hidden rounded-3xl bg-card/90 p-5 shadow-sm md:my-10 md:p-8">
      <SesamePattern className="-z-10 text-clay opacity-15" />
      <Link href="/" aria-label={BRAND_NAME} className="mx-auto mb-5 block w-fit">
        <Image
          src="/images/logo-brand.png"
          alt={BRAND_NAME}
          width={74}
          height={100}
          className="object-contain mix-blend-multiply"
          priority
        />
      </Link>
      <h1 className="text-center text-2xl font-extrabold">{title}</h1>
      <p className="mt-3 mb-7 text-center text-sm leading-7 text-muted-foreground">{description}</p>
      {children}
    </Card>
  );
}
