import { Agenda, BookingState, Doctor } from "@prisma/client/edge";
import classNames from "classnames";
import { WithSerializedTypes } from "~/utils/client";
import { getDisplayName } from "~/utils/patient";
import { CalendarSlot, DailyCalendarSlot } from "./simpleCalendar";
import { DateTime } from "luxon";
import React from "react";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  StopCircleIcon,
} from "@heroicons/react/24/solid";
import Show from "./show";

export function DailyAgendaView(p: {
  className?: string;
  selectedSlot?: DailyCalendarSlot | null;
  agenda: WithSerializedTypes<
    Agenda & { doctor?: WithSerializedTypes<Doctor> }
  >;
  onSelectSlot?: (slot: DailyCalendarSlot | null) => void;
  calendar: CalendarSlot;
}) {
  return (
    <div
      className={classNames(
        "rounded-lg  border shadow bg-white flex flex-col items-center relative",
        p.className
      )}
    >
      <div className="flex items-center self-stretch px-4 sticky bg-gray-50 z-10 py-2 border-b top-0">
        <div className="text-lg flex-grow font-semibold text-primary ">
          {p.agenda.name}
        </div>
        <div className="text-base text-gray-600">
          {p.agenda.doctor != null ? getDisplayName(p.agenda.doctor) : ""}
        </div>
      </div>

      <div className="py-4 flex-grow flex flex-col gap-y-2 items-stretch w-full relative">
        {p.calendar.slots.map((slot, i) => {
          const isSelected = slot.time === p.selectedSlot?.time;
          const isCompleted = slot.booking?.status === BookingState.COMPLETED;
          const isCancelled = slot.booking?.status === BookingState.CANCELLED;
          const isGray = slot.available;
          const isBlue = !slot.available && !isCompleted;
          const isGreen = isCompleted;
          const isRed = isCancelled;
          return (
            <>
              <div
                onKeyDown={() => p.onSelectSlot?.(slot)}
                onClick={() => p.onSelectSlot?.(slot)}
                className={classNames(
                  "h-16 relative  border cursor-pointer flex items-center mx-4 px-4 rounded",
                  {
                    "bg-gray-50 hover:bg-gray-100": isGray,
                    "bg-blue-100   border-primary border-2 border-opacity-30":
                      isBlue,
                    "bg-green-100   border-green-600 border-2 border-opacity-30":
                      isGreen,
                    "bg-red-100   border-red-600 border-2 border-opacity-30":
                      isRed,
                    "bg-opacity-20": !isSelected,
                    "bg-opacity-80": isSelected,
                  }
                )}
              >
                <div className="flex-grow flex items-center">
                  {isSelected && (
                    <div
                      className={classNames(
                        "absolute -top-0.5 -left-0.5 -bottom-0.5 w-3 rounded-l",
                        {
                          "bg-primary": isBlue || isGray,
                          "bg-green-600": isGreen,
                          "bg-red-600": isRed,
                        }
                      )}
                    />
                  )}
                  {slot.booking != null ? (
                    <>
                      <div className="pr-4 pl-2">
                        <BookingStatusIcon
                          status={slot.booking.status}
                          className={classNames({
                            "text-black text-opacity-30": !isSelected,
                            "text-green-600 ": isGreen && isSelected,
                            "text-red-600 ": isRed && isSelected,
                            "text-primary ": isBlue && isSelected,
                          })}
                        />
                      </div>
                      <div className="flex flex-col">
                        <div
                          className={classNames({
                            "text-gray-700 font-medium": !isSelected,
                            "text-green-600 font-medium": isGreen && isSelected,
                            "text-red-600 font-medium": isRed && isSelected,
                            "text-primary font-medium": isBlue && isSelected,
                          })}
                        >
                          {slot.booking.patient}
                        </div>
                        <div
                          className={classNames("text-sm", {
                            "text-gray-600": !slot.available,
                          })}
                        >
                          {slot.booking.service}
                        </div>
                      </div>
                    </>
                  ) : (
                    <React.Fragment />
                  )}
                </div>
                <div className={classNames("text-lg text-gray-800", {})}>
                  {DateTime.fromISO(slot.time).toLocaleString(
                    DateTime.TIME_SIMPLE
                  )}
                </div>
              </div>
              <div className="mx-4">
                <Show if={slot.hasPauseNext ?? false}>
                  <div className="bg-gray-100 rounded w-full mt-1 mb-1  text-center py-2 text-gray-400">
                    PAUSA
                  </div>
                </Show>
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
}

function BookingStatusIcon(p: { status: BookingState; className?: string }) {
  if (p.status === BookingState.CANCELLED) {
    return <StopCircleIcon className={classNames("h-8 ", p.className)} />;
  }
  if (p.status === BookingState.COMPLETED) {
    return <CheckCircleIcon className={classNames("h-8 ", p.className)} />;
  }

  return <CalendarDaysIcon className={classNames("h-8 ", p.className)} />;
}
