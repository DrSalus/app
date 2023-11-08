import { useTransition } from "@remix-run/react";

export function useTransitionData<T>() {
  const { submission } = useTransition();
  return Object.fromEntries(submission?.formData?.entries() ?? []);
}
