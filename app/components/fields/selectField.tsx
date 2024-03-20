import { useControlField, useField } from "remix-validated-form";
import Field, { FieldProps } from "../field";
import { Select, SelectOption } from "../select";
import classNames from "classnames";
import { keyBy } from "lodash-es";

interface SelectFieldProps extends Omit<FieldProps, "children"> {
	options: (string | SelectOption)[];
	defaultValue?: string;
	minimal?: boolean;
	placeholder?: string;
	renderDisplayName?: (val: string) => string;
}

export type Option = SelectOption;

export default function SelectField({
	name,
	label,
	helperText,
	defaultValue,
	options: _options,
	...p
}: SelectFieldProps) {
	const { error } = useField(name);
	const [value, setValue] = useControlField<string>(name);
	const convert = (d: string | SelectOption) =>
		typeof d === "string" ? { value: d, label: d } : d;
	const options = _options.map(convert);
	const optionsByValue = keyBy(options, "value");

	// console.log(optionsByValue);

	return (
		<Field name={name} label={label} helperText={helperText}>
			<Select
				options={options}
				name={name}
				defaultValue={convert(defaultValue ?? value)}
				renderDisplayName={(v) => optionsByValue[convert(v).value].label}
				className={classNames({ error })}
				onChangeValue={(v) => setValue(v?.value ?? "")}
			/>
			{/* <select
        defaultValue={defaultValue}
        className={classNames("input", {
          error: error,
        })}
        {...getInputProps({
          id: name,
          value,
          onChange: (e) => setValue((e.target as any).value),
        })}
      >
        {options.map((d) =>
          isObject(d) ? (
            <option key={d.value} value={d.value}>
              {d.label ?? d.value}
            </option>
          ) : (
            <option key={d} value={d}>
              {p.renderDisplayName?.(d) ?? d}
            </option>
          )
        )}
      </select> */}
		</Field>
	);
}
