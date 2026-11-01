import { isPrereleaseVersion } from "@/lib/version";

describe("isPrereleaseVersion", () => {
	it("reconnaît les alpha et bêta", () => {
		expect(isPrereleaseVersion("1.6.0-alpha.2")).toBe(true);
		expect(isPrereleaseVersion("v2.0.0-beta")).toBe(true);
		expect(isPrereleaseVersion("1.0.0-rc.1+build.5")).toBe(true);
	});

	it("écarte les versions stables, métadonnées de build comprises", () => {
		expect(isPrereleaseVersion("1.5.0")).toBe(false);
		expect(isPrereleaseVersion("v1.5.0")).toBe(false);
		expect(isPrereleaseVersion("1.5.0+build-7")).toBe(false);
	});
});
