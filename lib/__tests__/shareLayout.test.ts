import { getShareColumns, getShareWidth, SHARE_COLUMN_WIDTH } from "../shareLayout";

describe("getShareColumns", () => {
	it("garde une seule colonne pour un petit classement", () => {
		expect(getShareColumns({ playerCount: 3, categoryCount: 7, withCharts: false })).toBe(1);
	});

	it("répartit le classement et ses graphiques sur plusieurs colonnes", () => {
		expect(getShareColumns({ playerCount: 5, categoryCount: 8, withCharts: true })).toBe(3);
	});

	it("ne dépasse jamais quatre colonnes", () => {
		expect(getShareColumns({ playerCount: 8, categoryCount: 12, withCharts: true })).toBe(4);
	});
});

describe("getShareWidth", () => {
	it("additionne les colonnes et les espaces entre elles", () => {
		expect(getShareWidth(1)).toBe(SHARE_COLUMN_WIDTH);
		expect(getShareWidth(3)).toBe(3 * SHARE_COLUMN_WIDTH + 2 * 8);
	});
});
