// This component is used to display a time range field in the form, using tailwindcss. It should

import Field from "../field";
import { ArrowRightIcon, TrashIcon } from "@heroicons/react/24/solid";
import Button from "../button";
import { useCallback } from "react";
import { useControlField, useFormContext } from "remix-validated-form";
import { cloneDeep, isEmpty } from "lodash-es";
import useStopPropagation from "~/utils/events";

interface TimeRange {
  from: string;
  to: string;
}

// show a time range picker, with a start and end time.
export default function TimeRange(p: {
  label: string;
  name: string;
  className?: string;
  fromHour?: string;
  toHour?: string;
}) {
  const [value, setValue] = useControlField<TimeRange[]>(p.name);
  const { fieldErrors } = useFormContext();
  const stopPropagation = useStopPropagation();

  const handleToggleCheck = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isEmpty(value)) {
        setValue([
          {
            from: p.fromHour ?? "09:00",
            to: p.toHour ?? "20:00",
          },
        ]);
      } else {
        setValue([]);
      }
    },
    [value, p.fromHour, p.toHour, setValue]
  );

  return (
    <Field
      label={
        <div
          className="flex items-center gap-x-2 cursor-pointer text-gray-600 hover:text-gray-900"
          onClick={handleToggleCheck}
        >
          <input
            type="checkbox"
            checked={!isEmpty(value)}
            onChange={handleToggleCheck}
          />
          <div>{p.label}</div>
        </div>
      }
      name={p.name}
    >
      <div className="input-row-container flex items-center gap-x-2">
        {value?.map((val, index) => (
          <div
            key={index}
            className="flex items-center border rounded gap-x-2 pl-2"
            {...stopPropagation}
          >
            <input
              type="time"
              defaultValue={val.from}
              name={`${p.name}.${index}.from`}
              onChange={(e) => {
                setValue(cloneDeep(value), `${index}.from`, e.target.value);
              }}
              className="w-20"
            />
            <ArrowRightIcon className="h-4 text-gray-500" />
            <input
              type="time"
              defaultValue={val.to}
              name={`${p.name}.${index}.to`}
              onChange={(e) => {
                setValue(cloneDeep(value), `${index}.to`, e.target.value);
              }}
              className="w-20"
            />
            <Button
              icon={<TrashIcon />}
              intent="danger"
              minimal
              small
              onClick={() => setValue(value.filter((_, j) => index !== j))}
            />
          </div>
        ))}
      </div>
    </Field>
  );
}
