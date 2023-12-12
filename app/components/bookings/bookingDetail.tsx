import {
	BuildingOfficeIcon,
	MapPinIcon,
	PhoneIcon,
} from "@heroicons/react/24/solid";
import type { Clinic } from "@prisma/client";
import classNames from "classnames";
import type { WithSerializedTypes } from "~/utils/client";
import Map from "~/components/map.client";
import useDimensions from "react-cool-dimensions";

const MAP_HEIGHT = 280;

export default function BookingDetail(p: {
	clinic: WithSerializedTypes<Clinic>;
	className?: string;
}) {
	const { observe, width, height } = useDimensions();
	const iconClassName = "h-4 text-gray-400";
	const rowClassName = "flex items-center gap-x-1 h-6";
	return (
		<div
			ref={observe}
			className={classNames(
				"flex flex-grow items-stretch flex-col overflow-hidden bg-white",
				p.className,
			)}
		>
			<div className="hidden md:block">
				<Map
					height={MAP_HEIGHT}
					width={width}
					name="Test"
					locations={[{ lat: 37, lng: 38 }]}
				/>
			</div>
			<div className="py-6 px-4 flex flex-col flex-grow gap-y-1 bg-white border-t-2">
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
