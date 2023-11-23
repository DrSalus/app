import { useControlField } from "remix-validated-form";
import SimpleCalendar, {
  CalendarSlot,
  SimpleCalendarOptions,
} from "../simpleCalendar";
import Field from "../field";

export default function CalendarField(p: {
  slots: CalendarSlot[];
  name: string;
  options?: SimpleCalendarOptions;
}) {
  const [time, setValue] = useControlField<string | null>(p.name);

  return (
    <SimpleCalendar
      selectedSlot={time != null ? { time, available: true } : null}
      onSelectSlot={(slot) => setValue(slot?.time ?? null)}
      slots={p.slots}
      options={p.options}
    />
  );
}
