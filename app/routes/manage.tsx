import { LoaderFunctionArgs } from "@remix-run/node";
import Clinic, { loader as clinicLoader } from "~/routes/clinic.$id";

export async function loader(params: LoaderFunctionArgs) {
	return clinicLoader(params);
}

export default function ClinicManager() {
	return <Clinic />;
}
