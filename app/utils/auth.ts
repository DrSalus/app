import type { User } from "@prisma/client";
import { authenticator } from "~/services/auth.server";

export function checkIfAdmin(
  request: Request,
  failureRedirect: string = "/"
): Promise<User> {
  return authenticator.isAuthenticated(request, {
    failureRedirect,
  });
}

export const KEIX_WORKSPACE_ID = "9a879e6d-92bc-4a18-8294-e204d100fc76";
