import { defaults, times } from "lodash-es";
import { DateTime } from "luxon";
import SmallDay from "./smallDay";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";

export interface SimpleCalendarOptions {
  numberOfDays: number;
  numberOfSlots: number;
}

export interface CalendarSlot {
  date: string;
  slots: DailyCalendarSlot[];
}

export interface DailyCalendarSlot {
  time: string;
  available: boolean;
}

export default function SimpleCalendar(p: {
  options?: SimpleCalendarOptions;
  onSelectSlot: (slot: DailyCalendarSlot) => void;
  selectedSlot: DailyCalendarSlot | null;
  slots: CalendarSlot[];
}) {
  const [page, setPage] = useState(0);
  const options: SimpleCalendarOptions = defaults(
    {
      numberOfDays: 4,
      numberOfSlots: 4,
    },
    p.options ?? {}
  );

  return (
    <div className="flex gap-x-2">
      <PageButton
        disabled={page === 0}
        direction="previous"
        onClick={() => setPage((p) => p - 1)}
      />
      <div className="flex gap-x-6">
        {times(options.numberOfDays).map((index) => {
          const day = p.slots[index + page * options.numberOfDays];
          const date = DateTime.fromISO(day.date)!;
          return (
            <div key={index} className="flex flex-col items-center">
              <SmallDay day={date} />
              <div className="text-gray-500 text-xs mb-4">
                {date.toLocaleString(
                  {
                    day: "2-digit",
                    month: "short",
                  },
                  {
                    locale: "it",
                  }
                )}
              </div>
              <div className="flex flex-col gap-y-3 items-center">
                {times(Math.min(day.slots.length, options.numberOfSlots)).map(
                  (index) => {
                    const slot = day.slots[index];
                    const time = DateTime.fromISO(slot.time);
                    return (
                      <div
                        key={index}
                        onClick={() => p.onSelectSlot(slot)}
                        className={classNames(
                          "bg-primary bg-opacity-10 text-primary font-medium px-2 py-1 rounded hover:bg-primary hover:text-white cursor-pointer",
                          {
                            "bg-opacity-100 text-white":
                              p.selectedSlot?.time === slot.time,
                          }
                        )}
                      >
                        {time.toLocaleString(DateTime.TIME_SIMPLE, {
                          locale: "it",
                        })}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          );
        })}
      </div>
      <PageButton direction="next" onClick={() => setPage((p) => p + 1)} />
    </div>
  );
}

function PageButton(p: {
  disabled?: boolean;
  onClick: () => void;
  direction: "next" | "previous";
}) {
  return (
    <div
      onClick={p.disabled !== true ? p.onClick : undefined}
      onKeyDown={p.disabled !== true ? p.onClick : undefined}
      className={classNames(
        "flex flex-col justify-center px-2 text-gray-600 hover:text-primary rounded hover:bg-primary hover:bg-opacity-10 cursor-pointer",
        {
          "opacity-0": p.disabled,
        }
      )}
    >
      {p.direction === "next" ? (
        <ChevronRightIcon className="h-6" />
      ) : (
        <ChevronLeftIcon className="h-6" />
      )}
    </div>
  );
}
