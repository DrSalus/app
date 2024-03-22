import { useLoaderData } from "@remix-run/react";
import type { ToastProps } from "./toast";
import Toast from "./toast";
import { get } from "lodash-es";

const toastsByKey: { [key: string]: ToastProps } = {
	invitationAccepted: {
		type: "success",
		title: "Benvenuto",
		description: "Esegui il login con le tue credenziali",
	},
	correctAnswerToQuestion: {
		type: "success",
		title: "Risposta corretta!",
		description: "Puoi proseguire con il video e rispondere alle domande",
	},
	incorrectAnswerToQuestion: {
		type: "danger",
		title: "Risposta errata!",
		description:
			"Verrai reinderizzato alla parte del video dove hai commesso l'errore per poter riprovare a rispondere alle domande",
	},
	passwordChanged: {
		type: "success",
		title: "Accedi alla Mail",
		description:
			"Se hai inserito una mail esistente, riceverai presto le istruzioni per il recupero",
	},
	passwordUnchanged: {
		type: "warning",
		title: "Password non cambiata",
		description:
			"Se hai inserito una mail esistente, riceverai presto le istruzioni per il recupero",
	},
	remindSent: {
		type: "success",
		title: "Remind Inviato",
		description:
			"E' stato inviato un remind al paziente per ricordargli l'appuntamento",
	},
};

export default function AppToasts() {
	const data = useLoaderData();
	const toast = get(data ?? {}, "toast");
	if (toast != null) {
		const toastProps = toastsByKey[toast];
		if (toastProps != null) {
			return <Toast {...toastProps} />;
		}
	}

	return <></>;
}
