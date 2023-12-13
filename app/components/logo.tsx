import ColorLogo from "../../public/salus_shit.svg";
import MonoLogo from "../../public/mono.svg";
import ColorNotShitLogo from "../../public/salus_less_not_shit.svg";
import MonoNotShitLogo from "../../public/salus_mono_less_not_shit.svg";

export default function Logo(p: {
	mono?: boolean;
	shit?: boolean;
	className?: string;
}) {
	const mono = p.mono ?? false;
	let src;
	if (p.shit) {
		src = mono ? MonoLogo : ColorLogo;
	} else {
		src = mono ? MonoNotShitLogo : ColorNotShitLogo;
	}
	return <img src={src} className={p.className} />;
}
