import { ActionFunction } from "@remix-run/node";
import NodeGeocoder from "node-geocoder";

const options = {
	provider: "google",
	apiKey: process.env.GOOGLE_API_KEY,
};

const geocoder = NodeGeocoder(options);

export interface GecodeRequest {
	address: string;
	city: string;
}

export const action: ActionFunction = async ({ request }) => {
	const req: GecodeRequest = await request.json();
	if (req.address != null && req.city != null) {
		return new Promise((resolve, reject) => {
			geocoder.geocode(`${req.address}, ${req.city}`, async (err, res) => {
				if (err == null) {
					resolve({ ok: true, result: res });
				} else {
					reject(err);
				}
			});
		});
	}
	return { ok: false };
};
