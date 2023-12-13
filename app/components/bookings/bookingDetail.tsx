import {
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/solid";
import type { Clinic } from "@prisma/client/edge.js";
import classNames from "classnames";
import type { WithSerializedTypes } from "~/utils/client";
import Map from "~/components/map.client";
import useDimensions from "react-cool-dimensions";
import Show from "../show";

const MAP_HEIGHT = 280;

export default function BookingDetail(p: {
  clinic: WithSerializedTypes<Clinic>;
  className?: string;
}) {
  const { observe, width } = useDimensions();
  const iconClassName = "h-4 text-gray-400";
  const rowClassName = "flex items-center gap-x-3 h-6";
  return (
    <div
      ref={observe}
      className={classNames(
        "flex flex-grow items-stretch flex-col overflow-hidden bg-white",
        p.className
      )}
    >
      <div className="hidden md:block">
        <Show if={p.clinic.latitude != null && p.clinic.longitude != null}>
          <Map
            height={MAP_HEIGHT}
            width={width}
            name="Test"
            locations={[{ lat: p.clinic.latitude!, lng: p.clinic.longitude! }]}
          />
        </Show>
      </div>
      <div className="py-4 px-4 flex flex-col flex-grow gap-y-1 bg-white border-t-2">
        <div className={rowClassName}>
          <BuildingOfficeIcon className={iconClassName} />
          <div>{p.clinic.name}</div>
        </div>
        <div className={rowClassName}>
          <MapPinIcon className={iconClassName} />
          <div>
            {p.clinic.address} - {p.clinic.city}
          </div>
        </div>
        <div className={rowClassName}>
          <PhoneIcon className={iconClassName} />
          <div>{p.clinic.phoneNumber}</div>
        </div>
      </div>
    </div>
  );
}
