export function generateRandomPokemonIds(numPokemon: number) {
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
