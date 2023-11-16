import {
  useMatch,
  useMatches,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import Header, { HeaderProps } from "./header";
import { last } from "lodash-es";

interface NavigationHeaderProps
  extends Omit<HeaderProps, "selectedTab" | "onSelectTab"> {
  baseLocation: string;
}

export default function NavigationHeader(p: NavigationHeaderProps) {
  const matches = useMatches();
  const navigate = useNavigate();

  const selectedTab =
    last(matches)?.pathname.replace(p.baseLocation, "") ??
    p.tabs?.[0]?.id ??
    "";
  return (
    <Header
      {...p}
      selectedTab={selectedTab}
      onSelectTab={(t) => navigate(`${p.baseLocation}${t}`)}
    />
  );
}
