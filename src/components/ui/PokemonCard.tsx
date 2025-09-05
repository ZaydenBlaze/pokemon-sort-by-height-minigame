// Code based on https://next.dndkit.com/react/hooks/use-sortable
import { useSortable } from "@dnd-kit/react/sortable";
import { animated, SpringValue, to } from "@react-spring/web";
import { type TPokemon } from "@/types/TPokemon";

type SortablePokemonProps = {
	id: number;
	index: number;
	refProp: (el: HTMLLIElement | null) => void;
	spring: { x: SpringValue<number>; y: SpringValue<number> };
	isGuessSubmitted: boolean;
	pokemonData: TPokemon | null;
};

export function PokemonCard({
	id,
	index,
	refProp,
	spring,
	isGuessSubmitted,
	pokemonData,
}: SortablePokemonProps) {
	const { ref, isDragging } = useSortable({
		id,
		index,
		disabled: isGuessSubmitted,
	});

	const paddedId = String(id).padStart(3, "0");

	function capFirstLetter(name: string) {
		return name.charAt(0).toUpperCase() + name.slice(1);
	}

	return (
		<animated.li
			ref={(el) => {
				ref(el);
				refProp(el);
			}}
			className="w-40 bg-white p-4 rounded-3xl shadow-md cursor-pointer flex flex-col"
			style={{
				transform: to(
					[spring.x, spring.y],
					(x, y) => `translateX(${x}px) translateY(${y}px)`
				),
				boxShadow: isDragging
					? "0 25px 50px -12px rgb(0 0 0 / 0.25)"
					: "",
			}}
		>
			{pokemonData ? (
				<>
					<p className="font-bold text-lg">
						{capFirstLetter(pokemonData.name)}
					</p>
					<p>Id: {id}</p>

					<div className="flex grow items-center justify-center">
						{/* "grow" class means element grows to take up any remaining space in the flex container. */}
						{/* That remaining space will exist if a pokemon on that row has a name long enough to wrap to the 2nd line. */}
						<img
							src={`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${paddedId}.png`}
							width={148}
						/>
					</div>
					<div className="mt-auto">
						<p>
							{isGuessSubmitted
								? `Height: ${pokemonData.height / 10} m`
								: `Height: `}
						</p>
						<p>{`Weight: ${pokemonData.weight / 10} kg`}</p>
					</div>
				</>
			) : (
				<p>Loading</p>
			)}
		</animated.li>
	);
}
