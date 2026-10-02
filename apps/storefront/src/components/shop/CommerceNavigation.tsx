'use client';
import { createContext, useContext, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
const NavigationContext = createContext({ pending: false, navigate: (_href: string) => {} });
export function useCommerceNavigation() {
  return useContext(NavigationContext);
}
export default function CommerceNavigation({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <NavigationContext.Provider
      value={{
        pending,
        navigate: (href) => startTransition(() => router.push(href, { scroll: false })),
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}
