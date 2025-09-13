import { describe, it, expect } from "vitest";
import { getSortedIdsAndScore } from "@/utils/getSortedIdsAndScore";
import { type TPokemon } from "@/types/TPokemon";

// For an explanation of the factory pattern used in this file: https://dev.to/davelosert/mock-factory-pattern-in-typescript-44l9

const defaultPokemonDatum: TPokemon = {
	__typename: "pokemon_v2_pokemon",
	id: 0,
	height: 0,
	name: "A",
	weight: 1,
};

const createPokemonDatum = (overwrites: Partial<TPokemon> = {}) => ({
	...defaultPokemonDatum,
	...overwrites,
});

describe("getSortedIdsAndScore", () => {
	it("should not blindly move duplicates that are already in acceptable positions (in small array)", () => {
		const relevantInput: Partial<TPokemon>[] = [
			{ id: 1, height: 2 },
			{ id: 2, height: 1 },
			{ id: 3, height: 1 },
		];
		const pokemonData = relevantInput.map((input) =>
			createPokemonDatum(input)
		);
		const { listOfSortedIds } = getSortedIdsAndScore(pokemonData)!;
		expect(listOfSortedIds).toEqual([3, 2, 1]);
	});

	it("should not blindly move duplicates that are already in acceptable positions (in larger array)", () => {
		// Heights in sorted order: [1,1,2,2,3,3]
		const relevantInput: Partial<TPokemon>[] = [
			{ id: 1, height: 2 },
			{ id: 2, height: 1 }, // stays
			{ id: 3, height: 1 },
			{ id: 4, height: 3 },
			{ id: 5, height: 2 },
			{ id: 6, height: 3 }, // stays
		];
		const pokemonData = relevantInput.map((input) =>
			createPokemonDatum(input)
		);
		const { listOfSortedIds } = getSortedIdsAndScore(pokemonData)!;
		expect(listOfSortedIds).toEqual([3, 2, 1, 5, 4, 6]);
	});
});
