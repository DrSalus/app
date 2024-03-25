import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { useControlField, useField } from "remix-validated-form";

export interface FieldProps {
  name: string;
  label: string | JSX.Element;
  showLabel?: boolean;
  showError?: boolean;
  helperText?: string;
  errorText?: string;
  children: JSX.Element;
}

export default function Field({
  name,
  label,
  helperText,
  showLabel,
  showError,
  errorText,
  children,
}: FieldProps) {
  const { error: fieldError } = useField(name);
  const error = errorText || fieldError;
  
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
