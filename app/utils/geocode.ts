interface GeocodeResult {
	latitude: number;
	longitude: number;
	label: string;
}

export async function geocode(query: string): Promise<GeocodeResult[]> {
	const response = await fetch(
		`http://api.positionstack.com/v1/forward?query=${encodeURIComponent(
			query,
		)}&access_key=${process.env.POSITION_STACK_API_KEY}`,
	);

	const data: any = await response.json();
	console.log(`[Geocode]: ${query} -> ${data?.data?.[0]?.label}`);
	return (
		data?.data?.map((item: any) => {
			return {
				latitude: item.latitude,
				longitude: item.longitude,
				label: item.label,
			};
		}) ?? []
	);
}
