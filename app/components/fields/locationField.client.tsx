import { isEmpty, throttle } from "lodash";
import React, { useEffect, useRef } from "react";
import { useControlField, useFormContext } from "remix-validated-form";
import InputField from "./inputField";
import LeafletMap from "~/components/map.client";
import { ClientOnly } from "remix-utils/client-only";
import useDimensions from "react-cool-dimensions";
import Callout from "../callout";

export function LocationField() {
	const [address] = useControlField<string | undefined>("address");
	const [city] = useControlField<string | undefined>("city");
	const [name] = useControlField<string | undefined>("name");
	const [lat, setLatitude] = useControlField<string | undefined>("latitude");
	const [lng, letLongitude] = useControlField<string | undefined>("longitude");
	const { observe, width } = useDimensions();
	const throttled = useRef(
		throttle(async (address: string, city: string) => {
			const res = await fetch("/geocode", {
				method: "POST",
				body: JSON.stringify({ address, city }),
			}).then((r) => r.json());
			console.log("Got res", res);
			if (res.ok && res.result.length > 0) {
				console.log("Set lat lng", res.result[0]);
				setLatitude(res.result[0].latitude);
				letLongitude(res.result[0].longitude);
				return { lat: res.result[0].latitude, lng: res.result[0].longitude };
			}
			return null;
		}, 1000),
	);

	useEffect(() => {
		console.log("changed", address, city);
		if (!isEmpty(address) && !isEmpty(city)) {
			const promise = throttled.current(address!, city!);
			if (promise != null) {
				promise.then((result) => {
					console.log("Gor result", result);
					if (result != null) {
						setLatitude(result.lat);
						letLongitude(result.lng);
					}
				});
			}
		}
	}, [address, city]);

	return (
		<>
			{/* <input name="latitude" value={lat ?? 0} />
			<input name="longitude" value={lng ?? 0} /> */}
			<div
				className="col-span-8 h-[240px] rounded overflow-hidden block"
				ref={observe}
			>
				{lat != null && lng != null ? (
					<LeafletMap
						name={name ?? ""}
						height={240}
						width={width}
						locations={[{ lat, lng }]}
					/>
				) : (
					<Callout intent="warning" text="Nessuna posizione trovata" />
				)}
			</div>
		</>
	);
}
