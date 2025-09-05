// Code based on https://next.dndkit.com/react/hooks/use-sortable
import { useSortable } from "@dnd-kit/react/sortable";
import { animated, SpringValue, to } from "@react-spring/web";

type TPokemon = {
	__typename: "pokemon_v2_pokemon";
	id: number;
	name: string;
	height: number;
	weight: number;
};

type SortablePokemonProps = {
	id: number;
	index: number;
	refProp: (el: HTMLLIElement | null) => void;
	spring: { x: SpringValue<number>; y: SpringValue<number> };
	dragDisabled: boolean;
};

export function PokemonCard({
	id,
	index,
	refProp,
	spring,
	dragDisabled,
}: SortablePokemonProps) {
	const { ref, isDragging } = useSortable({
		id,
		index,
		disabled: dragDisabled,
	});

	return (
		<animated.li
			ref={(el) => {
				ref(el);
				refProp(el);
			}}
			className="w-40 h-40 bg-red-200 rounded-xl shadow-md cursor-pointer flex items-center justify-center"
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
			Item {id}
		</animated.li>
	);
}
