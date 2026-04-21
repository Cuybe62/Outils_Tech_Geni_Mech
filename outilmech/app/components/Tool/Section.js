"use client";
import { useEffect, useState } from "react";

export default function Section({ title, isOpen, children }) {
  const [open, setOpen] = useState(isOpen);

  return (
    <div className="collapse collapse-arrow border bg-base-200 shadow">
      <input
        className="bg-base-200"
        type="checkbox"
        checked={open}
        onChange={() => setOpen(!open)}
      />

      <div className="collapse-title font-semibold bg-base3-200">{title}</div>

      <div className="collapse-content bg-base-200">{children}</div>
    </div>
  );
}
