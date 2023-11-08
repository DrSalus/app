import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { useField } from "remix-validated-form";

interface FieldProps {
  name: string;
  label: string;
  helperText?: string;
  inputClassName?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export default function Field({
  name,
  label,
  helperText,
  inputClassName,
  inputProps,
}: FieldProps) {
  const { error, getInputProps } = useField(name);

  return (
    <>
      <label htmlFor={name}>{label}</label>
      <input
        className={classNames(
          "input",
          {
            error: error,
          },
          inputClassName
        )}
        {...getInputProps({ id: name })}
        {...(inputProps ?? {})}
      />
      <span className="helperText">{helperText}</span>
      {error && (
        <span className="errorText">
          <ExclamationTriangleIcon className="h-6" /> {error}
        </span>
      )}
    </>
  );
}
