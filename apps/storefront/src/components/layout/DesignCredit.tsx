import { DESIGNER_DOMAIN, DESIGNER_URL } from '@behjati/shared';
export default function DesignCredit() {
  return (
    <div className="relative z-10 border-t border-[#d5ac55]/20 bg-[#660311] px-4 py-3 text-center text-xs font-medium text-[#f4e8d3]">
      طراحی توسط{' '}
      <a
        href={DESIGNER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-6 items-center font-bold underline-offset-4 hover:underline"
      >
        <bdi dir="ltr">{DESIGNER_DOMAIN}</bdi>
      </a>
    </div>
  );
}
