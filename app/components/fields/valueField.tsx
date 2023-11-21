import { useControlField } from "remix-validated-form";

export function ValueField(p: { name: string }) {
  const [value] = useControlField<string>(p.name);
  return <>{value}</>
}