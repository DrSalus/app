import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { useControlField, useField } from "remix-validated-form";

export interface FieldProps {
  name: string;
  label: string;
  helperText?: string;
  children: JSX.Element;
}

export default function Field({
  name,
  label,
  helperText,
  children,
}: FieldProps) {
  const { error } = useField(name);

  return (
    <>
      <label htmlFor={name}>{label}</label>
      {children}
      <span className="helperText">{helperText}</span>
      {error && (
        <span className="errorText">
          <ExclamationTriangleIcon className="h-6" /> {error}
        </span>
      )}
    </>
  );
}
