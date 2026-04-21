"use client";

import { useState } from "react";

type CopyButtonProps = {
  value: string;
};

export default function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available, ignore
    }
  }

  return (
    <button
      type="button"
      className={`copy-btn${copied ? " copy-btn-done" : ""}`}
      onClick={handleCopy}
      aria-label={`Sao chép ${value}`}
    >
      {copied ? "Đã chép ✓" : "Sao chép"}
    </button>
  );
}
