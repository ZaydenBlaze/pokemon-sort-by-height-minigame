import { useState, useRef, useMemo } from "react";
import "./App.css";
import { Button } from "@/components/ui/button";
import { useSprings } from "@react-spring/web";
import { PokemonContainer } from "./components/ui/PokemonContainer";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
	generatePokemonQuery,
	generateDummyPokemonQuery,
} from "@/utils/pokemonQueries";

type TPokemon = {
	__typename: "pokemon_v2_pokemon";
	id: number;
	name: string;
	height: number;
	weight: number;
};

function App() {
	const [pokemonIds, setPokemonIds] = useState(generateRandomPokemonIds(10));
	const submittedIds = useRef<number[] | null>(null);
	const sortedIds = useRef<number[] | null>(null);

	const [isGuessSubmitted, setIsGuessSubmitted] = useState(false);

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

	const GET_POKEMON =
		pokemonIds.length > 0
			? gql`
					${generatePokemonQuery(pokemonIds)}
			  `
			: gql`
					${generateDummyPokemonQuery()}
			  `;

	const { loading, error, data } = useQuery(GET_POKEMON);

	const pokemonsData = data ? Object.values(data).flat() : null;
	// console.log("pokemondata", pokemonsData);

	function handleSortClick() {
		if (!containerRef.current) return;

		if (!isGuessSubmitted) {
			// If first button click
			setIsGuessSubmitted(true);
			submittedIds.current = pokemonIds;

			// Count inversions to quantify disorder
			if (!pokemonsData) return;
			const scorePercent = countInversionsPercentage(
				pokemonsData,
				(p) => p.height
			);
			console.log("Guess accuracy:", scorePercent.toFixed(1) + "%");

			sortedIds.current = [...pokemonsData]
				.sort((a, b) => a.height - b.height)
				.map((pokemon) => pokemon.id);
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
				? sortedIds.current ?? [] // if ternary chooses sortedIds.current, and sortedIds.current is null, then choose []
				: submittedIds.current ?? [];
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
			{loading ? (
				<p>Loading...</p>
			) : error ? (
				<p>Error : {error.message}</p>
			) : (
				<>
					<PokemonContainer
						containerRef={containerRef}
						boxRefs={boxRefs}
						pokemonIds={pokemonIds}
						setPokemonIds={setPokemonIds}
						springs={springs}
						isGuessSubmitted={isGuessSubmitted}
						pokemonsData={pokemonsData}
					/>
					<Button
						onClick={handleSortClick}
						className="cursor-pointer block mt-4"
					>
						{!isGuessSubmitted
							? "Submit guess"
							: animationDirection === "toSorted"
							? "Show sorted position"
							: "Show original position"}
					</Button>
				</>
			)}
		</div>
	);
}

export default App;

function generateRandomPokemonIds(numPokemon: number) {
	const ids: number[] = [];
	const maxId = 1025;
	while (ids.length < numPokemon) {
		const randomId = Math.floor(Math.random() * maxId) + 1;
		if (!ids.includes(randomId)) {
			ids.push(randomId);
		}
	}
	return ids;
}

// Kendall's tau distance
function countInversionsPercentage(arr, key = (x) => x) {
	const n = arr.length;
	if (n < 2) return 100; // perfectly sorted by default

	let inversions = 0;
	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			if (key(arr[i]) > key(arr[j])) inversions++;
		}
	}

	const maxInversions = (n * (n - 1)) / 2;
	const normalized = inversions / maxInversions;

	return (1 - normalized) * 100; // 100% = perfect, 0% = worst
}
