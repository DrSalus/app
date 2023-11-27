import { UserCircleIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";

export default function BookingHeader(p: {
  type: "doctor" | "clinic";
  title: string;
  className?: string;
  subtitle: string;
}) {
  return (
    <div
      className={classNames("flex gap-x-2 items-center border-b", p.className)}
    >
      <UserCircleIcon className="h-14 text-gray-400" />
      <div className="flex flex-col">
        <div className="font-medium text-xl text-primary">{p.title}</div>
        <div className="text-gray-500 text-sm">{p.subtitle}</div>
      </div>
    </div>
  );
}
