"use client";

import type { ReactNode } from "react";

export function OpenChatButton({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("open-ai-chat"))}
    >
      {children}
    </button>
  );
}