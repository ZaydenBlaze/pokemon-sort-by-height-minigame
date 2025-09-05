import { useState, useRef, useMemo } from "react";
import "./App.css";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toaster, toast } from "sonner";
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
	const [numOfPokemon, setNumOfPokemon] = useState(10);
	const [pokemonIds, setPokemonIds] = useState(
		generateRandomPokemonIds(numOfPokemon)
	);
	const submittedIds = useRef<number[] | null>(null);
	const sortedIds = useRef<number[] | null>(null);

	const [isGuessSubmitted, setIsGuessSubmitted] = useState(false);
	const [animationDirection, setAnimationDirection] = useState<
		"toSorted" | "toUnsorted"
	>("toSorted");
	const [scoreForGuess, setScoreForGuess] = useState<number | null>(null);

	const containerRef = useRef<HTMLUListElement | null>(null);
	const boxRefs = useRef<Record<number, HTMLLIElement | null>>({});

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

	function handleSortClick() {
		if (!containerRef.current) return;

		// If first button click
		if (!isGuessSubmitted) {
			setIsGuessSubmitted(true);
			submittedIds.current = pokemonIds;

			// Count inversions to quantify disorder
			if (!pokemonsData) return;
			const scorePercent = countInversionsPercentage(
				pokemonsData,
				(p) => p.height
			);
			setScoreForGuess(scorePercent);
			sortedIds.current = [...pokemonsData]
				.sort((a, b) => a.height - b.height)
				.map((pokemon) => pokemon.id);

			if (scorePercent === 100) {
				// fully sorted; no need for animation
				return;
			}
		}

		if (isGuessSubmitted && scoreForGuess === 100) {
			toast("Already sorted!", {
				style: {
					fontSize: "1rem",
				},
			});
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

	function handleNewGameButtonClick(e) {
		e.preventDefault();
		if (!numOfPokemon || numOfPokemon < 2 || numOfPokemon > 20) {
			toast.warning("Must be a number between 2 and 20", {
				style: {
					fontSize: "1rem",
				},
			});
			return;
		}
		setPokemonIds(generateRandomPokemonIds(numOfPokemon));
		setIsGuessSubmitted(false);
		setAnimationDirection("toSorted");
	}

	return (
		<div className="w-screen min-h-screen bg-orange-200 p-4">
			{/* ^min-h-screen ensures bg color covers the entire page, even when content overflows */}
			<Toaster position="top-center" closeButton />
			<p className="text-xl font-bold mb-2">
				Try sorting the pokemon by their heights, then submit your
				guess!
			</p>
			<p className="text-xl font-bold mb-4">
				Once submitted, you can toggle between the correct answer and
				your attempt.
			</p>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="inline-block">
						{/* Without inline-block, Tooltip shows up on the left */}
						<Label
							htmlFor="numOfPokemon"
							className="mb-2 mr-3 inline-block text-xl"
						>
							Number of pokemon:
						</Label>
						<Input
							className="bg-white w-20 inline-block"
							onChange={(e) => setNumOfPokemon(e.target.value)}
							value={numOfPokemon}
							id="numOfPokemon"
							type="number"
							min={2}
							max={20}
						></Input>
					</div>
				</TooltipTrigger>
				<TooltipContent side="right">
					<p className="text-base">Number between 2 and 20</p>
				</TooltipContent>
			</Tooltip>
			<Button
				onClick={handleNewGameButtonClick}
				className="mb-2 cursor-pointer block text-lg"
				size="lg"
			>
				New game
			</Button>
			{loading ? (
				<p className="text-lg">Loading...</p>
			) : error ? (
				<p className="text-lg">Error : {error.message}</p>
			) : (
				<>
					<Button
						onClick={handleSortClick}
						className="cursor-pointer block mb-4 text-lg"
						size="lg"
					>
						{!isGuessSubmitted
							? "Submit guess"
							: animationDirection === "toSorted"
							? "Show sorted position"
							: "Show original position"}
					</Button>
					<p
						className={`text-xl mb-4 ${
							isGuessSubmitted ? "visible" : "invisible"
						}`}
						style={{
							background:
								"linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)",
							backgroundSize: "200% 200%",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							animation: "rainbow 3s linear infinite",
							WebkitTextStroke: "1px black", // adds solid black outline
						}}
					>
						{`You got a score of ${scoreForGuess?.toFixed(1)}%!`}
						<style>
							{`
                @keyframes rainbow {
                  0%, 100% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                }
              `}
						</style>
					</p>
					<PokemonContainer
						containerRef={containerRef}
						boxRefs={boxRefs}
						pokemonIds={pokemonIds}
						setPokemonIds={setPokemonIds}
						springs={springs}
						isGuessSubmitted={isGuessSubmitted}
						pokemonsData={pokemonsData}
					/>
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
