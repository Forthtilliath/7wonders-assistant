import { APP_INFO } from "@/constants/app";
import { checkForUpdate } from "../updates";

function mockLatestRelease(response: { ok: boolean; body?: unknown }) {
	globalThis.fetch = jest.fn(async () => ({
		ok: response.ok,
		json: async () => response.body,
	})) as unknown as typeof fetch;
}

/** Version installée avec le dernier chiffre augmenté/diminué de `delta`. */
function bumpPatch(delta: number): string {
	const [major, minor, patch] = APP_INFO.version.split(".").map(Number);
	return `${major}.${minor}.${patch + delta}`;
}

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe("checkForUpdate", () => {
	it("signale une version plus récente avec le lien de sa page de release", async () => {
		mockLatestRelease({
			ok: true,
			body: { tag_name: `v${bumpPatch(1)}`, html_url: "https://github.com/r/releases/v9" },
		});

		await expect(checkForUpdate()).resolves.toEqual({
			status: "update-available",
			version: bumpPatch(1),
			url: "https://github.com/r/releases/v9",
		});
	});

	it("compare les versions numériquement, pas comme du texte", async () => {
		const [major] = APP_INFO.version.split(".").map(Number);
		mockLatestRelease({ ok: true, body: { tag_name: `${major + 10}.0.0` } });

		const result = await checkForUpdate();

		expect(result).toMatchObject({ status: "update-available", version: `${major + 10}.0.0` });
		// Sans html_url, repli sur la page de la dernière release du dépôt.
		expect(result).toMatchObject({ url: expect.stringContaining("/releases/latest") });
	});

	it("considère l'app à jour pour une version identique ou plus ancienne", async () => {
		mockLatestRelease({ ok: true, body: { tag_name: `v${APP_INFO.version}` } });
		await expect(checkForUpdate()).resolves.toEqual({ status: "up-to-date" });

		mockLatestRelease({ ok: true, body: { tag_name: "v0.0.1" } });
		await expect(checkForUpdate()).resolves.toEqual({ status: "up-to-date" });
	});

	it("contourne le cache HTTP à chaque vérification", async () => {
		mockLatestRelease({ ok: true, body: { tag_name: APP_INFO.version } });

		await checkForUpdate();

		expect(globalThis.fetch).toHaveBeenCalledWith(
			expect.stringMatching(/releases\/latest\?_=\d+$/),
		);
	});

	it("renvoie une erreur si GitHub répond en échec ou si le réseau est coupé", async () => {
		mockLatestRelease({ ok: false });
		await expect(checkForUpdate()).resolves.toEqual({ status: "error" });

		globalThis.fetch = jest.fn(async () => {
			throw new TypeError("Network request failed");
		}) as unknown as typeof fetch;
		await expect(checkForUpdate()).resolves.toEqual({ status: "error" });
	});
});
