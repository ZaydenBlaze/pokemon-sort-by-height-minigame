import { useState, useRef, useMemo } from "react";
import "./App.css";
import { Button } from "@/components/ui/button";
import { useSprings } from "@react-spring/web";
import { PokemonContainer } from "./components/ui/PokemonContainer";

function App() {
	const [pokemonIds, setPokemonIds] = useState([6, 8, 2, 3, 4, 1, 7, 5]);
	const submittedIds = useRef<number[] | null>(null);
	const sortedIds = useMemo(() => {
		return [...pokemonIds].sort((a, b) => a - b);
	}, [pokemonIds]);

	const [dragDisabled, setDragDisabled] = useState(false);

	const containerRef = useRef<HTMLUListElement | null>(null);
	const boxRefs = useRef<Record<number, HTMLLIElement | null>>({});
	const [animationDirection, setAnimationDirection] = useState<
		"toSorted" | "toUnsorted"
	>("toSorted");

	// React Spring springs for FLIP animation technique
	const [springs, api] = useSprings(pokemonIds.length, () => ({
		x: 0,
		y: 0,
		config: { mass: 1, tension: 150, friction: 25 },
	}));

	function handleSortClick() {
		if (!containerRef.current) return;

		if (!dragDisabled) {
			// If submitting guess (first button click)
			setDragDisabled(true);
			submittedIds.current = pokemonIds;
		}

		// FLIP animation technique: First-Last-Invert-Play
		// First: capture previous positions
		const prevRects: Record<number, DOMRect> = {};
		pokemonIds.forEach((id) => {
			const elem = boxRefs.current[id];
			if (elem) prevRects[id] = elem.getBoundingClientRect();
		});

		// Last: update order
		const newOrder =
			animationDirection === "toSorted"
				? sortedIds
				: submittedIds.current ?? []; // if ternary chooses submittedIds.current, and submittedIds.current is null, then choose []
		setPokemonIds(newOrder);

		setAnimationDirection((prevAnimationDirection) =>
			prevAnimationDirection === "toSorted" ? "toUnsorted" : "toSorted"
		);

		// Invert + Play
		requestAnimationFrame(() => {
			newOrder.forEach((id, index) => {
				const el = boxRefs.current[id];

				if (!el) return;
				const prev = prevRects[id];
				const newRect = el.getBoundingClientRect();

				const currentX = springs[index].x.get();
				const currentY = springs[index].y.get();

				const dx = prev.left - newRect.left + currentX;
				const dy = prev.top - newRect.top + currentY;

				// Invert: Immediately undo the difference in layout so cards seem like they didn't move
				api.start((i) =>
					i === index ? { x: dx, y: dy, immediate: true } : {}
				);

				// Play the animation
				requestAnimationFrame(() => {
					api.start((i) =>
						i === index ? { x: 0, y: 0, immediate: false } : {}
					);
				});
			});
		});
	}

	return (
		<div className="w-screen h-screen bg-gray-200 p-4">
			<PokemonContainer
				containerRef={containerRef}
				boxRefs={boxRefs}
				pokemonIds={pokemonIds}
				setPokemonIds={setPokemonIds}
				springs={springs}
				dragDisabled={dragDisabled}
			/>

			<Button
				onClick={handleSortClick}
				className="cursor-pointer block mt-4"
			>
				{!dragDisabled
					? "Submit guess"
					: animationDirection === "toSorted"
					? "Show sorted position"
					: "Show original position"}
			</Button>
		</div>
	);
}

export default App;
