"use client";

/**
 * Custom robot face logo for the MeraGhar AI Agent. Pure SVG, scales to any
 * size and inherits `currentColor` for the glow accents.
 */
export function RobotLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* antenna */}
      <path
        d="M12 2.6v2.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="12" cy="2.1" r="1.25" fill="currentColor" />
      {/* head */}
      <rect
        x="3.5"
        y="5"
        width="17"
        height="13"
        rx="3.5"
        fill="currentColor"
        opacity="0.15"
      />
      <rect
        x="4.5"
        y="6"
        width="15"
        height="11"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* ear nodes */}
      <circle cx="3.5" cy="9" r="1.1" fill="currentColor" />
      <circle cx="20.5" cy="9" r="1.1" fill="currentColor" />
      {/* eyes */}
      <circle cx="9" cy="10" r="1.6" fill="currentColor" />
      <circle cx="15" cy="10" r="1.6" fill="currentColor" />
      <circle cx="9.55" cy="9.45" r="0.5" fill="#fff" opacity="0.9" />
      <circle cx="15.55" cy="9.45" r="0.5" fill="#fff" opacity="0.9" />
      {/* mouth */}
      <path
        d="M9 14.5h6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}