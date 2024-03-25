import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { db } from "~/utils/db.server";
import { geocode } from "~/utils/geocode";

const RANGE = 1;

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("query") ?? "";

	const results = await geocode(query);
	const bestGuess = results[0];
	console.log(bestGuess.latitude, bestGuess.longitude);

	await authenticator.isAuthenticated(request, {
		failureRedirect: "/login",
	});

	const offers = await db.clinic.findMany({
		where: {
			// clinic: {
			latitude: {
				gte: bestGuess.latitude - RANGE,
				lte: bestGuess.latitude + RANGE,
			},
			longitude: {
				gte: bestGuess.longitude - RANGE,
				lte: bestGuess.longitude + RANGE,
			},
		},
	});

	return { offers, bestGuess };
}
export default function Test() {
	const { offers } = useLoaderData<typeof loader>();
	const [search] = useSearchParams();

	return (
		<div className="page mt-4">
			<div className="search-bar-container">
				<Form className="search-bar">
					<input
						type="text"
						name="query"
						defaultValue={search.get("query") ?? ""}
						placeholder="Cerca Utenti..."
					/>
					<button type="submit">
						<MagnifyingGlassIcon className="h-6 px-2 text-sky-800" />
					</button>
				</Form>
			</div>
			<div className="flex flex-col">
				<div className="table mx-6">
					<table>
						<thead>
							<tr>
								<th className="">Tipo</th>
								<th className="">Lat</th>
								<th className="">Lng</th>
							</tr>
						</thead>
						<tbody>
							{offers?.map((u) => (
								<tr className="cursor-pointer hover:bg-gray-100">
									<td>{u.name}</td>
									<td>{u.latitude}</td>
									<td>{u.longitude}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
