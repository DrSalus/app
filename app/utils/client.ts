import agent from "@egjs/agent";
import { getClientIPAddress } from "remix-utils";

export function getClientInfo(request: Request) {
  const ipAddress = getClientIPAddress(request);
  const rawUserAgent = request.headers.get("user-agent") as string;
  const userAgent = agent(rawUserAgent);
  return {
    ipAddress,
    userAgent: rawUserAgent,
    osInfo: [userAgent.browser.name, userAgent.browser.version].join(" "),
    platform: [userAgent.os.name, userAgent.os.version].join(" "),
  };
}

export type WithSerializedTypes<Type> = {
  [Key in keyof Type]: Type[Key] extends Date
    ? string
    : Type[Key] extends Date | null
    ? string | null
    : Type[Key] extends Date | undefined
    ? string | undefined
    : Type[Key] extends Date | null | undefined
    ? string | null | undefined
    : Type[Key] extends BigInt
    ? number
    : Type[Key] extends BigInt | null
    ? number | null
    : Type[Key] extends BigInt | undefined
    ? number | undefined
    : Type[Key] extends BigInt | null | undefined
    ? number | null | undefined
    : Type[Key];
};
