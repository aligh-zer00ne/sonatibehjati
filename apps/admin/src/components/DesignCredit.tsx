import { DESIGNER_DOMAIN, DESIGNER_URL } from '@behjati/shared';
export default function DesignCredit({ className = '' }: { className?: string }) {
  return (
    <p className={className}>
      طراحی توسط{' '}
      <a
        href={DESIGNER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold [color:inherit]"
      >
        <bdi dir="ltr">{DESIGNER_DOMAIN}</bdi>
      </a>
    </p>
  );
}
