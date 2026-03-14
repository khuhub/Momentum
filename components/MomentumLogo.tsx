interface MomentumLogoProps {
  withWordmark?: boolean;
  iconClassName?: string;
  textClassName?: string;
  className?: string;
}

export default function MomentumLogo({
  withWordmark = true,
  iconClassName = "h-9 w-12",
  textClassName = "text-2xl font-semibold text-slate-900",
  className = "flex items-center gap-2",
}: MomentumLogoProps) {
  return (
    <div className={className}>
      <svg
        viewBox="0 0 120 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconClassName}
        aria-label="Momentum logo"
      >
        <path
          d="M28 70V18L52 50L75 18V70"
          stroke="#12363B"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 80L34 74L28 66L18 80Z"
          fill="#57A696"
        />
        <path
          d="M66 22L76 14L82 22L66 22Z"
          fill="#57A696"
        />
      </svg>
      {withWordmark ? <span className={textClassName}>Momentum</span> : null}
    </div>
  );
}
