"use client";

import { useState } from "react";

type AdminActionButtonProps = {
  label: string;
  message: string;
  tone?: "dark" | "light" | "danger" | "green";
};

const toneClasses = {
  danger: "border-[#ffd1cc] bg-white text-[#b42318] hover:bg-[#fff0ed]",
  dark: "border-[#101510] bg-[#101510] text-white hover:bg-[#263126]",
  green: "border-[#34a51d] bg-[#34a51d] text-white hover:bg-[#2a8917]",
  light: "border-black/15 bg-white text-[#151817] hover:border-[#34a51d]",
};

export function AdminActionButton({
  label,
  message,
  tone = "light",
}: AdminActionButtonProps) {
  const [feedback, setFeedback] = useState("");

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${toneClasses[tone]}`}
        onClick={() => setFeedback(message)}
        type="button"
      >
        {label}
      </button>
      {feedback ? (
        <span className="max-w-52 text-xs font-medium text-[#207b18]">{feedback}</span>
      ) : null}
    </span>
  );
}
