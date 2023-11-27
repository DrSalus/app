export default function useStopPropagation() {
	return {
		onClick: (e: React.MouseEvent) => {
			e.stopPropagation();
		},
		onKeyDown: (e: React.KeyboardEvent) => {
			e.stopPropagation();
		},
	};
}
