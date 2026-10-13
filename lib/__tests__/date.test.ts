import { formatDate } from "../date";

describe("formatDate", () => {
	it("formate un timestamp en date longue française", () => {
		const timestamp = new Date(2026, 6, 14).getTime(); // 14 juillet 2026

		expect(formatDate(timestamp)).toBe("14 juillet 2026");
	});
});
