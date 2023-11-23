import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { useControlField, useField } from "remix-validated-form";

export interface FieldProps {
  name: string;
  label: string;
  showLabel?: boolean;
  showError?: boolean;
  helperText?: string;
  children: JSX.Element;
}

export default function Field({
  name,
  label,
  helperText,
  showLabel,
  showError,
  children,
}: FieldProps) {
  const { error } = useField(name);

  return (
    <>
      {showLabel !== false && <label htmlFor={name}>{label}</label>}
      {children}
      <span className="helperText">{helperText}</span>
      {showError !== false && error && (
        <span className="errorText">
          <ExclamationTriangleIcon className="h-6" /> {error}
        </span>
      )}
    </>
  );
}
