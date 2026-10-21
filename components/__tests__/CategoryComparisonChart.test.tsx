import { render, screen } from "@testing-library/react-native";
import { CategoryComparisonChart } from "@/components/game/CategoryComparisonChart";
import type { RankedPlayerScore } from "@/lib/scoring/total";
import type { Player } from "@/types/game";

function makePlayer(id: string, name: string): Player {
	return { id, name, isFavorite: false, isArchived: false, createdAt: 0 };
}

function makeScore(playerId: string, military: number): RankedPlayerScore {
	return {
		playerId,
		military,
		treasury: 0,
		wonders: 0,
		civilians: 0,
		commercials: 0,
		scientifics: 0,
		guilds: 0,
		leaders: 0,
		cities: 0,
		babel: 0,
		naval: 0,
		armada: 0,
		total: military,
		rank: 1,
	};
}

describe("CategoryComparisonChart", () => {
	it("trie les joueurs du meilleur au moins bon score, à égalité dans l'ordre de saisie", async () => {
		const players = [
			makePlayer("p1", "Marc"),
			makePlayer("p2", "Martine"),
			makePlayer("p3", "Marc"),
			makePlayer("p4", "Julie"),
		];
		const scores = [
			makeScore("p1", -2),
			makeScore("p2", 6),
			makeScore("p3", 3),
			makeScore("p4", 3),
		];
		await render(<CategoryComparisonChart category="military" players={players} scores={scores} />);

		const values = screen.getAllByText(/^-?\d+$/).map((node) => node.props.children);
		expect(values).toEqual([6, 3, 3, -2]);
		const names = screen
			.getAllByLabelText(/^(Marc|Martine|Julie)$/)
			.map((node) => node.props.accessibilityLabel);
		expect(names).toEqual(["Martine", "Marc", "Julie", "Marc"]);
	});
});
