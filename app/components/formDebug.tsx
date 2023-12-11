import { useFormContext } from "remix-validated-form";

export default function FormDebug() {
	const { fieldErrors } = useFormContext();
	return <div>{JSON.stringify(fieldErrors)}</div>;
}
