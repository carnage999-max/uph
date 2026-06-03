import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';

type LuxuryCTASize = 'default' | 'sm';

type LuxuryCTAProps = {
  label: string;
  href?: string;
  as?: 'link' | 'button' | 'span';
  size?: LuxuryCTASize;
  showOrnaments?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'button'>, 'children'>;

function OrnamentRow({ position }: { position: 'top' | 'bottom' }) {
  return (
    <span
      className={`luxury-cta__ornament luxury-cta__ornament--${position}`}
      aria-hidden="true"
    >
      <span className="luxury-cta__line" />
      <span className="luxury-cta__diamond" />
      <span className="luxury-cta__line" />
    </span>
  );
}

function ColumnAccent({ side }: { side: 'left' | 'right' }) {
  return (
    <span
      className={`luxury-cta__column luxury-cta__column--${side}`}
      aria-hidden="true"
    >
      <span className="luxury-cta__column-cap" />
      <span className="luxury-cta__column-shaft" />
      <span className="luxury-cta__column-base" />
    </span>
  );
}

function LuxuryCTAContent({
  label,
  size,
  showOrnaments,
}: {
  label: string;
  size: LuxuryCTASize;
  showOrnaments: boolean;
}) {
  const ornaments = showOrnaments && size === 'default';

  return (
    <span className="luxury-cta__surface">
      {ornaments && <ColumnAccent side="left" />}
      <span className="luxury-cta__body">
        {ornaments && <OrnamentRow position="top" />}
        <span className="luxury-cta__label">{label}</span>
        {ornaments && <OrnamentRow position="bottom" />}
      </span>
      {ornaments && <ColumnAccent side="right" />}
    </span>
  );
}

export default function LuxuryCTA({
  label,
  href,
  as,
  size = 'default',
  showOrnaments = true,
  className = '',
  disabled,
  type = 'button',
  ...buttonProps
}: LuxuryCTAProps) {
  const rootClass = [
    'luxury-cta',
    size === 'sm' ? 'luxury-cta--sm' : '',
    disabled ? 'luxury-cta--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <LuxuryCTAContent
      label={label}
      size={size}
      showOrnaments={showOrnaments && !disabled}
    />
  );

  const mode = as ?? (href ? 'link' : 'button');

  if (mode === 'span') {
    return <span className={rootClass}>{content}</span>;
  }

  if (mode === 'link' && href && !disabled) {
    return (
      <Link href={href} className={rootClass}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={rootClass}
      disabled={disabled}
      {...buttonProps}
    >
      {content}
    </button>
  );
}
