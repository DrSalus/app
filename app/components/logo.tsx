import ColorLogo from "../../public/salus_shit.svg";
import MonoLogo from "../../public/salus_mono_shit.svg";
import ColorNotShitLogo from "../../public/salus_less_not_shit.svg";
import MonoNotShitLogo from "../../public/salus_mono_less_not_shit.svg";
import MonoShitSmallLogo from "../../public/salus_mono_shit_small.svg";

export default function Logo(p: {
	mono?: boolean;
	shit?: boolean;
	small?: boolean;
	className?: string;
}) {
	const mono = p.mono ?? false;
	let src;
	if (p.shit !== false) {
		if (p.small === true) {
			src = MonoShitSmallLogo;
		} else {
			src = mono ? MonoLogo : ColorLogo;
		}
	} else {
		src = mono ? MonoNotShitLogo : ColorNotShitLogo;
	}
	return <img src={src} className={p.className} />;
}
