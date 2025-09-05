import { PokemonCard } from "@/components/ui/PokemonCard";
import { type SpringValues } from "@react-spring/web";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
type TPokemon = {
	__typename: "pokemon_v2_pokemon";
	id: number;
	name: string;
	height: number;
	weight: number;
};

type PokemonContainerProps = {
	containerRef: React.RefObject<HTMLUListElement | null>;
	boxRefs: React.RefObject<Record<number, HTMLLIElement | null>>;
	pokemonIds: number[];
	setPokemonIds: React.Dispatch<React.SetStateAction<number[]>>;
	springs: SpringValues<{ x: number; y: number }>[];
	dragDisabled: boolean;
	pokemonData: TPokemon[];
};

export const PokemonContainer = ({
	containerRef,
	boxRefs,
	pokemonIds,
	setPokemonIds,
	springs,
	dragDisabled,
	pokemonData,
}: PokemonContainerProps) => {
	return (
		<ul ref={containerRef} className="flex flex-wrap gap-3">
			<DragDropProvider
				onDragEnd={({ operation }) => {
					// https://github.com/clauderic/dnd-kit/issues/1664
					const { source } = operation;
					if (!isSortable(source)) return; // Type guard: ensures `source` is a sortable item so `source.sortable` can be accessed without TypeScript errors

					const { index: newIndex, initialIndex: oldIndex } =
						source.sortable;
					setPokemonIds((prevIds) => {
						const updatedIds = [...prevIds];
						const [movedItem] = updatedIds.splice(oldIndex, 1); // remove the dragged item
						updatedIds.splice(newIndex, 0, movedItem); // insert it at the new index
						return updatedIds;
					});
				}}
			>
				{pokemonIds.map((id, index) => (
					<PokemonCard
						key={id}
						id={id}
						index={index}
						refProp={(el) => {
							boxRefs.current[id] = el;
						}}
						spring={springs[index]}
						dragDisabled={dragDisabled}
					/>
				))}
			</DragDropProvider>
		</ul>
	);
};
