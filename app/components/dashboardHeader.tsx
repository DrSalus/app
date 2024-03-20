import {
	ArrowRightOnRectangleIcon,
	UserCircleIcon,
} from "@heroicons/react/24/solid";
import { User } from "@prisma/client";
import { DateTime } from "luxon";
import { LinkButton } from "./button";
import { WithSerializedTypes } from "~/utils/client";

export default function DashboardHeader(p: {
	user: WithSerializedTypes<User>;
}) {
	return (
		<div className="-mt-3 header flex px-4">
			<div className="flex flex-col items-center gap-x-2">
				<UserCircleIcon className="h-20 text-gray-400" />
				<h4 className="text-sky-700 text-2xl">
					{p.user.firstName} {p.user.lastName}
				</h4>
				<div className="text-gray-800">{p.user.email}</div>
			</div>
		</div>
	);
}
