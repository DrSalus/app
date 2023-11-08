import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { Form, useActionData } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { v4 } from "uuid";
import Button from "~/components/button";
import Callout from "~/components/callout";
import Logo from "~/components/logo";
import { sendMail } from "~/services/mail.server";
import { getSession } from "~/services/session.server";
import { db } from "~/utils/db.server";

type LoaderData = { error: boolean };

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request);

  const form = await request.formData();
  const email = form.get("email");

  if (typeof email !== "string") {
    return { error: "Inserisci tutti i campi richiesti." };
  }

  const mailLowerCase = email.toLowerCase();

  let user = await db.user.findFirst({
    where: {
      email: mailLowerCase,
    },
  });

  if (!user) {
    session.set("toastStatus", "passwordUnchanged");
    return redirect("/login");
  }

  const token = v4();

  await db.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: token,
      resetPasswordExpires: new Date(
        new Date().getTime() + 86400000
      ).toISOString(),
    },
  });

  session.set("toastStatus", "emailSent");

  const url = new URL(request.url);

  sendMail({
    subject: "Recupero password account",
    htmlBody: `<p>Hai avviato il processo di recupero della password del tuo account Archimede. Vai a <a href='${url.origin}/resetPassword/${token}'>questo link</a> per resettarla.</p>`,
    to: email,
  });

  return redirect("/login");
};

export default function Screen() {
  const data = useActionData<LoaderData>();
  return (
    <div className="page place-content-center">
      <div className="card self-center">
        <Logo className="self-center my-4 h-24" />
        <h2 className="text-center">Recupera Password</h2>
        <h4 className="text-gray-500 font-normal text-center text-base mb-6">
          Inserisci la tua mail per procedere con il processo di recupero
          password
        </h4>
        <Form method="post" className="form-grid">
          <label htmlFor="email">Indirizzo Email</label>
          <input
            type="email"
            className="input lowercase"
            name="email"
            required
          />

          <Button
            type="submit"
            className="w-full"
            intent="primary"
            icon={<ArrowRightOnRectangleIcon />}
            text="Recupera Password"
          />
        </Form>
        {data?.error && (
          <Callout text="Email o Password non trovati" intent="danger" />
        )}
      </div>
    </div>
  );
}
