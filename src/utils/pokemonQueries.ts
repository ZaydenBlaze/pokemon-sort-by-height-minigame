import { gql } from "@apollo/client";

export const GET_POKEMON = gql`
	query GetPokemon($ids: [Int!]) {
		pokemon: pokemon_v2_pokemon(where: { id: { _in: $ids } }) {
			id
			name
			height
			weight
		}
	}
`;
export function generatePokemonQuery(ids: number[]) {
	const fields = ids
		.map(
			(id, index) =>
				`
			pokemon${index}: pokemon_v2_pokemon(where: {id: {_eq: ${id}}}) {
				name
				id
				height
				weight
			}`
		)
		.join("\n");

	const query = `
    query GetPokemon {
        ${fields}
    }
  `;
	return query;
}

export function generateDummyPokemonQuery() {
	return `
					query GetPokemon {
						pokemon0: pokemon_v2_pokemon(
							where: { id: { _eq: 1 } }
						) {
							name
							id
							height
							weight
						}
					}
				`;
}
