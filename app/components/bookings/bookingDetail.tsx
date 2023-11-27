import {
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/solid";
import type { Clinic } from "@prisma/client";
import classNames from "classnames";
import type { WithSerializedTypes } from "~/utils/client";
import Map from "~/components/map.client";

export default function BookingDetail(p: {
  clinic: WithSerializedTypes<Clinic>;
  className?: string;
}) {
  const width = 480;
  const height = 240;
  const iconClassName = "h-4 text-gray-400";
  const rowClassName = "flex items-center gap-x-1 h-6";
  return (
    <div className={classNames("flex flex-col gap-y-1", p.className)}>
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
      <div style={{ width, height }} className="rounded overflow-hidden shadow">
        <Map
          height={240}
          width={480}
          name="Test"
          locations={[{ lat: 37, lng: 38 }]}
        />
      </div>
    </div>
  );
}
