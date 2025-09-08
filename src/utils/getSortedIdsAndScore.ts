import { type TPokemon } from "@/types/TPokemon";

type TPokemonWithIndex = TPokemon & { originalIndex: number };

export function getSortedIdsAndScore(pokemonData: TPokemon[]) {
	if (!pokemonData) return;

	const sortedPokemons = [...pokemonData].sort((a, b) => {
		if (a.height === b.height) return a.id - b.id;
		return a.height - b.height;
	});

	const sortedHeights = sortedPokemons.map((p) => p.height);

	const heightToIndexesMap = new Map();
	sortedHeights.forEach((height, index) => {
		if (!heightToIndexesMap.has(height)) heightToIndexesMap.set(height, []);
		heightToIndexesMap.get(height).push(index);
	});

	const leftoverPokemon: TPokemonWithIndex[] = [];
	const listOfSortedIds = new Array(pokemonData.length);
	let totalDistance = 0;

	pokemonData.forEach((pokemon, i) => {
		const okIndexes = heightToIndexesMap.get(pokemon.height);
		if (okIndexes.length === 1) {
			const targetIndex = okIndexes[0];
			listOfSortedIds[targetIndex] = pokemon.id;
			totalDistance += Math.abs(i - targetIndex);
		} else {
			if (okIndexes.includes(i)) {
				listOfSortedIds[i] = pokemon.id;
				heightToIndexesMap.set(
					pokemon.height,
					okIndexes.filter((idx: number) => idx !== i)
				);
				totalDistance += 0;
			} else {
				leftoverPokemon.push({ ...pokemon, originalIndex: i });
			}
		}
	});

	leftoverPokemon.forEach((pokemon) => {
		const okIndexes = heightToIndexesMap.get(pokemon.height);
		const targetIndex = okIndexes[0];
		listOfSortedIds[targetIndex] = pokemon.id;
		heightToIndexesMap.set(pokemon.height, okIndexes.slice(1));
		totalDistance += Math.abs(pokemon.originalIndex - targetIndex);
	});

	const n = pokemonData.length;
	const maxDistance = ((n - 1) * n) / 2;
	const sortednessPercentage = Math.max(
		0,
		100 * (1 - totalDistance / maxDistance)
	);

	return { listOfSortedIds, sortednessPercentage };
}
