import { type TPokemon } from "@/types/TPokemon";

// This fn uses Kendall's tau distance to measure dissimilarity between 2 rankings.
export function countInversionsPercentage(
	arr: TPokemon[],
	key: (x: TPokemon) => number
) {
	const n = arr.length;

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
