import { computeScienceScore } from "../science";

describe("computeScienceScore", () => {
	it("calcule carrés + bonus de sets sans joker", () => {
		// 2 roues, 2 tablettes, 2 compas -> 4+4+4 + 7*2 = 26
		const result = computeScienceScore({
			compass: 2,
			tablet: 2,
			gear: 2,
			wildcards: 0,
			maxSymbols: 0,
		});
		expect(result.total).toBe(26);
		expect(result.setsCount).toBe(2);
	});

	it("répartit les jokers pour compléter un set plutôt qu'empiler un type", () => {
		// 1 roue, 1 tablette, 1 compas + 1 joker -> compléter un 2e set (1,1,1)+1 partout
		// vaut mieux répartir 1 joker par type sur 3 sets déjà égaux ? ici seul 1 joker dispo,
		// donc le meilleur choix est de créer un déséquilibre : (2,1,1)=4+1+1+7=13 pour chaque
		// répartition possible, le score est donc identique quel que soit le type choisi.
		const result = computeScienceScore({
			compass: 1,
			tablet: 1,
			gear: 1,
			wildcards: 1,
			maxSymbols: 0,
		});
		expect(result.total).toBe(13);
	});

	it("empile le joker sur le type déjà dominant quand un seul set n'est pas atteignable", () => {
		// 3 compas + 1 joker (un seul dispo) : l'empiler (4 compas) rapporte 16 = 4²,
		// mieux que de démarrer un set isolé (3,1,0)=9+1+0+7*0=10.
		const result = computeScienceScore({
			compass: 3,
			tablet: 0,
			gear: 0,
			wildcards: 1,
			maxSymbols: 0,
		});
		expect(result.total).toBe(16);
		expect(result.symbols).toEqual({ compass: 4, tablet: 0, gear: 0 });
	});

	it("complète le symbole manquant pour boucler un set plutôt que d'empiler", () => {
		// 2 roues, 2 tablettes, 1 compas + 1 joker : compléter le compas -> (2,2,2)=4+4+4+14=26
		// vs empiler une roue -> (3,2,1)=9+4+1+7=21. Le set l'emporte.
		const result = computeScienceScore({
			compass: 1,
			tablet: 2,
			gear: 2,
			wildcards: 1,
			maxSymbols: 0,
		});
		expect(result.total).toBe(26);
		expect(result.symbols).toEqual({ compass: 2, tablet: 2, gear: 2 });
	});

	it("répartit plusieurs jokers à 0 symbole pour former des sets complets", () => {
		// 0 partout + 3 jokers -> (1,1,1) = 1+1+1+7 = 10, meilleur que (3,0,0)=9
		const result = computeScienceScore({
			compass: 0,
			tablet: 0,
			gear: 0,
			wildcards: 3,
			maxSymbols: 0,
		});
		expect(result.total).toBe(10);
		expect(result.setsCount).toBe(1);
	});

	it("le symbole max duplique automatiquement le type déjà dominant", () => {
		// 3 compas, 1 tablette, 0 roue + 1 symbole max -> se colle sur le compas (déjà le plus
		// haut) -> (4,1,0) = 16+1+0+7*0 = 17. Pas un choix libre comme un joker.
		const result = computeScienceScore({
			compass: 3,
			tablet: 1,
			gear: 0,
			wildcards: 0,
			maxSymbols: 1,
		});
		expect(result.total).toBe(17);
		expect(result.symbols).toEqual({ compass: 4, tablet: 1, gear: 0 });
	});

	it("le symbole max s'ajoute sur la même égalité au fil des applications successives", () => {
		// (1,1,1) à égalité + 2 symboles max -> les deux vont sur le même type (compas par
		// convention de résolution des égalités) -> (3,1,1) = 9+1+1+7 = 18.
		const result = computeScienceScore({
			compass: 1,
			tablet: 1,
			gear: 1,
			wildcards: 0,
			maxSymbols: 2,
		});
		expect(result.total).toBe(18);
	});

	it("applique le symbole max avant d'optimiser les jokers restants", () => {
		// 2 compas + 1 symbole max -> (3,0,0), puis 1 joker s'empile dessus -> (4,0,0) = 16,
		// meilleur que de démarrer un set (3,1,0)=10.
		const result = computeScienceScore({
			compass: 2,
			tablet: 0,
			gear: 0,
			wildcards: 1,
			maxSymbols: 1,
		});
		expect(result.total).toBe(16);
		expect(result.symbols).toEqual({ compass: 4, tablet: 0, gear: 0 });
	});
});
