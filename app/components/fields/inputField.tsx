import { useControlField, useField } from "remix-validated-form";
import Field, { FieldProps } from "../field";
import classNames from "classnames";

interface InputFieldProps extends Omit<FieldProps, "children"> {
	inputClassName?: string;
	onChange?: (val: string) => void;
	format?: (val: string) => any;
	inputProps?: React.DetailedHTMLProps<
		React.InputHTMLAttributes<HTMLInputElement>,
		HTMLInputElement
	>;
}

export default function InputField({
	inputClassName,
	name,
	label,
	showLabel,
	showError,
	helperText,
	inputProps,
	...p
}: InputFieldProps) {
	const { error, getInputProps } = useField(name);
	const [value, setValue] = useControlField<string>(name);

	return (
		<Field
			name={name}
			label={label}
			helperText={helperText}
			showLabel={showLabel}
			showError={showError}
		>
			<input
				className={classNames(
					"input",
					{
						error: error,
					},
					inputClassName,
				)}
				{...getInputProps({
					id: name,
					value,
					onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
						const value = (e.target as any).value;
						// console.log("Value", p.format?.(value) ?? value);
						setValue(value);
						inputProps?.onChange?.(value);
					},
				})}
				{...(inputProps ?? {})}
			/>
		</Field>
	);
}
