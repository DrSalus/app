import React from "react";
import { useControlField } from "remix-validated-form";

export function ShowIfDate(p: { children: React.ReactNode }) {
  const [date] = useControlField<string | null>("date");
  if (date == null) return <React.Fragment />;
  return <React.Fragment>{p.children}</React.Fragment>;
}
