import React from "react";
import type { User } from "@prisma/client/edge.js";
import { useLoaderData } from "@remix-run/react";

export default function IfAdmin(p: { children: JSX.Element }) {
  const data = useLoaderData<{ user?: User }>();
  return data?.user?.isAdmin ? p.children : <React.Fragment />;
}
