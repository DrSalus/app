import { cssBundleHref } from "@remix-run/css-bundle";
import { LoaderFunction, json, type LinksFunction } from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import styles from "./tailwind.css?inline";
import AppToasts from "./components/appToasts";
import NavigationBar from "./components/navigationBar";
import { authenticator } from "./services/auth.server";

export const links: LinksFunction = () => [
	...(cssBundleHref
		? [
				{ rel: "stylesheet", href: cssBundleHref },
				{ rel: "stylesheet", href: styles },
		  ]
		: [{ rel: "stylesheet", href: styles }]),
];

// dashboard if it is or return null if it's not
export let loader: LoaderFunction = async ({ request }) => {
	// If the user is already authenticated redirect to /dashboard directly
	const user = await authenticator.isAuthenticated(request, {});

	return json({ user });
};

export default function App() {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<NavigationBar />
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<AppToasts />
				<LiveReload />
			</body>
		</html>
	);
}
