// app/services/auth.server.ts
import { User } from "@prisma/client";
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { FormStrategy } from "remix-auth-form";
import invariant from "invariant";
import { db } from "~/utils/db.server";
import { comparePassword } from "~/utils/utils.server";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage);

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form, context }) => {
    // Here you can use `form` to access and input values from the form.
    // and also use `context` to access more things from the server
    let email = form.get("email"); // or email... etc
    let password = form.get("password");

    // You can validate the inputs however you want
    invariant(typeof email === "string", "email must be a string");
    invariant(email.length > 0, "email must not be empty");

    invariant(typeof password === "string", "password must be a string");
    invariant(password.length > 0, "password must not be empty");

    // And finally, you can find, or create, the user
    let user = await db.user.findFirst({
      where: {
        email,
      },
    });
    invariant(user != null, "password must not be empty");

    if (await comparePassword(password, user.password)) {
      // And return the user as the Authenticator expects it
      return user;
    } else {
      throw new Error("Password does not match");
    }
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "user-pass"
);
