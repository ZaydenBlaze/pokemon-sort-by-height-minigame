import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MockedProvider } from "@apollo/client/testing/react";
import { gql } from "@apollo/client";
import { GraphQLError } from "graphql";
import { generatePokemonQuery } from "@/utils/pokemonQueries";
import * as utils from "@/utils/generateRandomPokemonIds"; // import full module
import App from "@/App";

// Ensure spy is cleaned up between each "it" test
afterEach(() => {
	vi.restoreAllMocks();
});

const ids = [196, 71, 441, 1022, 569, 310, 811, 874, 430, 1];

// Helper to render App with mocks
const renderAppWithMocks = (mock: any) =>
	render(
		<MockedProvider mocks={[mock]}>
			<App />
		</MockedProvider>
	);

describe("App", () => {
	beforeEach(() => {
		// Stabilize randomness by mocking generateRandomPokemonIds() for all tests
		vi.spyOn(utils, "generateRandomPokemonIds").mockReturnValue(ids);
	});

	it("should render pokemon", async () => {
		const mock = {
			delay: 30, // to prevent React from batching the loading state away
			request: {
				query: gql(generatePokemonQuery(ids)),
			},
			result: {
				data: Object.fromEntries(
					ids.map((id, index) => [
						`pokemon${index}`,
						{
							__typename: "pokemon_v2_pokemon",
							id,
							name: `Pokemon ${id}`,
							height: 1,
							weight: 1,
						},
					])
				),
			},
		};

		renderAppWithMocks(mock);

		expect(await screen.findByText("Loading...")).toBeInTheDocument();
		expect(await screen.findByText("Pokemon 196")).toBeInTheDocument();
		expect(await screen.findByText("Pokemon 1")).toBeInTheDocument();
	});

	it("should show error UI for network errors", async () => {
		const mock = {
			request: {
				query: gql(generatePokemonQuery(ids)),
			},
			error: new Error("An error occurred"),
		};

		renderAppWithMocks(mock);

		expect(
			await screen.findByText(/An error occurred/i)
		).toBeInTheDocument();
	});

	it("should show error UI for GraphQL errors", async () => {
		const mock = {
			request: {
				query: gql(generatePokemonQuery(ids)),
			},
			result: {
				errors: [new GraphQLError("GraphQL Error!")],
			},
		};

		renderAppWithMocks(mock);

		expect(await screen.findByText(/GraphQL Error!/i)).toBeInTheDocument();
	});
});
