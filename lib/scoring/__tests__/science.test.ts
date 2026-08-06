import { computeScienceScore } from "../science";

describe("computeScienceScore", () => {
	it("calcule carrés + bonus de sets sans joker", () => {
		// 2 roues, 2 tablettes, 2 compas -> 4+4+4 + 7*2 = 26
		const result = computeScienceScore({ compass: 2, tablet: 2, gear: 2, wildcards: 0 });
		expect(result.total).toBe(26);
		expect(result.setsCount).toBe(2);
	});

	it("répartit les jokers pour compléter un set plutôt qu'empiler un type", () => {
		// 1 roue, 1 tablette, 1 compas + 1 joker -> compléter un 2e set (1,1,1)+1 partout
		// vaut mieux répartir 1 joker par type sur 3 sets déjà égaux ? ici seul 1 joker dispo,
		// donc le meilleur choix est de créer un déséquilibre : (2,1,1)=4+1+1+7=13 pour chaque
		// répartition possible, le score est donc identique quel que soit le type choisi.
		const result = computeScienceScore({ compass: 1, tablet: 1, gear: 1, wildcards: 1 });
		expect(result.total).toBe(13);
	});

	it("empile le joker sur le type déjà dominant quand un seul set n'est pas atteignable", () => {
		// 3 compas + 1 joker (un seul dispo) : l'empiler (4 compas) rapporte 16 = 4²,
		// mieux que de démarrer un set isolé (3,1,0)=9+1+0+7*0=10.
		const result = computeScienceScore({ compass: 3, tablet: 0, gear: 0, wildcards: 1 });
		expect(result.total).toBe(16);
		expect(result.symbols).toEqual({ compass: 4, tablet: 0, gear: 0 });
	});

	it("complète le symbole manquant pour boucler un set plutôt que d'empiler", () => {
		// 2 roues, 2 tablettes, 1 compas + 1 joker : compléter le compas -> (2,2,2)=4+4+4+14=26
		// vs empiler une roue -> (3,2,1)=9+4+1+7=21. Le set l'emporte.
		const result = computeScienceScore({ compass: 1, tablet: 2, gear: 2, wildcards: 1 });
		expect(result.total).toBe(26);
		expect(result.symbols).toEqual({ compass: 2, tablet: 2, gear: 2 });
	});

	it("répartit plusieurs jokers à 0 symbole pour former des sets complets", () => {
		// 0 partout + 3 jokers -> (1,1,1) = 1+1+1+7 = 10, meilleur que (3,0,0)=9
		const result = computeScienceScore({ compass: 0, tablet: 0, gear: 0, wildcards: 3 });
		expect(result.total).toBe(10);
		expect(result.setsCount).toBe(1);
	});
});
