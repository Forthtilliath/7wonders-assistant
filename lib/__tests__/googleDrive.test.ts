import {
	DRIVE_BACKUP_FILE_NAME,
	DriveError,
	downloadBackupFile,
	findBackupFile,
	uploadBackupFile,
} from "../googleDrive";

const mockFetch = jest.fn();

function respond(body: unknown, status = 200) {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => body,
		text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
	};
}

beforeEach(() => {
	mockFetch.mockReset();
	globalThis.fetch = mockFetch as unknown as typeof fetch;
});

describe("findBackupFile", () => {
	it("cherche le fichier dans le dossier caché de l'app, avec le jeton", async () => {
		mockFetch.mockResolvedValue(respond({ files: [{ id: "f1", modifiedTime: "t" }] }));

		await expect(findBackupFile("jeton")).resolves.toEqual({ id: "f1", modifiedTime: "t" });

		const [url, init] = mockFetch.mock.calls[0];
		const params = new URL(url).searchParams;
		expect(params.get("spaces")).toBe("appDataFolder");
		expect(params.get("q")).toContain(DRIVE_BACKUP_FILE_NAME);
		expect(init.headers.Authorization).toBe("Bearer jeton");
	});

	it("renvoie null quand aucune sauvegarde n'existe", async () => {
		mockFetch.mockResolvedValue(respond({ files: [] }));
		await expect(findBackupFile("jeton")).resolves.toBeNull();
	});

	it("lève une DriveError portant le statut HTTP", async () => {
		mockFetch.mockResolvedValue(respond({}, 401));
		await expect(findBackupFile("jeton")).rejects.toMatchObject({ status: 401 });
		await expect(findBackupFile("jeton")).rejects.toBeInstanceOf(DriveError);
	});

	it("garde la raison détaillée d'un refus donnée par Google", async () => {
		mockFetch.mockResolvedValue(
			respond({ error: { code: 403, errors: [{ reason: "accessNotConfigured" }] } }, 403),
		);
		await expect(findBackupFile("jeton")).rejects.toMatchObject({
			status: 403,
			reason: "accessNotConfigured",
		});
	});

	it("tolère un corps d'erreur illisible", async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			status: 500,
			json: async () => {
				throw new SyntaxError("pas du JSON");
			},
		});
		await expect(findBackupFile("jeton")).rejects.toMatchObject({ status: 500, reason: null });
	});
});

describe("downloadBackupFile", () => {
	it("télécharge le contenu brut du fichier", async () => {
		mockFetch.mockResolvedValue(respond('{"app":"x"}'));
		await expect(downloadBackupFile("jeton", "f1")).resolves.toBe('{"app":"x"}');
		expect(mockFetch.mock.calls[0][0]).toContain("/files/f1?alt=media");
	});
});

describe("uploadBackupFile", () => {
	it("met à jour le fichier existant", async () => {
		mockFetch.mockResolvedValue(respond({ id: "f1", modifiedTime: "t2" }));

		await uploadBackupFile("jeton", "{}", "f1");

		const [url, init] = mockFetch.mock.calls[0];
		expect(url).toContain("/upload/drive/v3/files/f1?uploadType=media");
		expect(init.method).toBe("PATCH");
		expect(init.body).toBe("{}");
	});

	it("crée le fichier dans le dossier de l'app s'il n'existe pas", async () => {
		mockFetch.mockResolvedValue(respond({ id: "f2", modifiedTime: "t" }));

		await expect(uploadBackupFile("jeton", '{"a":1}', null)).resolves.toEqual({
			id: "f2",
			modifiedTime: "t",
		});

		const [url, init] = mockFetch.mock.calls[0];
		expect(url).toContain("uploadType=multipart");
		expect(init.method).toBe("POST");
		expect(init.body).toContain('"parents":["appDataFolder"]');
		expect(init.body).toContain('{"a":1}');
	});
});
