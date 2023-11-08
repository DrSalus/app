import ColorLogo from "../../public/logo.svg";
import MonoLogo from "../../public/mono.svg";

export default function Logo(p: { mono?: boolean; className?: string }) {
  const mono = p.mono ?? false;
  const src = mono ? MonoLogo : ColorLogo;
  return <img src={src} className={p.className} />;
}
