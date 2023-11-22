import { useControlField } from "remix-validated-form";

export function ValueField(p: { name: string; defaultValue?: string | JSX.Element; showValue?: boolean }) {
  const [value] = useControlField<string>(p.name);
  return (
    <>
      {p.showValue !== false ? value ?? p.defaultValue : ''}
      <input type="hidden" name={`${p.name}`} value={value} />
    </>
  );
}
