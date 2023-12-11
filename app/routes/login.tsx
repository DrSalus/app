import { Link, Form, useActionData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import Button from "~/components/button";
import Callout from "~/components/callout";
import Logo from "~/components/logo";
import { authenticator } from "~/services/auth.server";

type LoaderData = { error: boolean };

export const action: ActionFunction = async ({ request, context }) => {
  try {
    await authenticator.authenticate("user-pass", request, {
      successRedirect: "/dashboard",
      context, // optional
    });
  } catch (err: any) {
    if ("status" in err && err.status === 302) {
      throw err;
    }

    console.log("===");
    console.log(err);
    return { error: true };
  }

  return { error: false };
};

// dashboard if it is or return null if it's not
export let loader: LoaderFunction = async ({ request }) => {
  // If the user is already authenticated redirect to /dashboard directly
  await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard",
  });

  return true;
};

export default function Screen() {
  const data = useActionData<LoaderData>();

  return (
    <div className="page place-content-center bg-gradient-to-b from-sky-800 to-sky-700">
      <img
        src="/hero.jpg"
        alt="A doctor in background"
        className="absolute opacity-10 w-full h-full object-cover overflow-hidden"
      />
      <div className="card self-center">
        <Logo className="self-center my-4 h-24" />
        <Form method="post" className="form-grid">
          <label htmlFor="email">Indirizzo Email</label>
          <input
            type="email"
            className="input lowercase"
            name="email"
            required
          />
          <label htmlFor="email">Password</label>

          <input
            type="password"
            className="input"
            name="password"
            autoComplete="current-password"
            required
          />
          <Button
            type="submit"
            className="w-full"
            intent="primary"
            text="Accedi"
          />
        </Form>
        {data?.error && (
          <Callout text="Email o Password non trovati" intent="danger" />
        )}
        <Link to={"/forgotPassword"} className="mt-4 text-gray-700">
          <p className="text-center">Non ricordi più la password?</p>
        </Link>
      </div>
    </div>
  );
}
