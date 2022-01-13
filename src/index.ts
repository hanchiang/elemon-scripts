import {
  Element,
  ElementsStrengthWeaknessCount,
  SortOrder,
  CombineAttackDefenseStrengthWeakness,
  ElementsCombinedStrengthWeaknessCount,
} from "./types/elements";
import {
  elementAttackAdvantageMap,
  elementAttackDisadvantageMap,
  elementAttackIneffectiveMap,
} from "./constants/elementStrengthWeakness";

/**
 * This script has 2 features
 * 1. Determine the best individual elements according to the number of
 *  attack and defense advantages they have.
 *
 * 2. Determine the elemental strengths and weaknesses of a team composition
 *
 * PRE-REQUISITE:
 * 1. Make sure typescript and ts-node is installed
 *
 * HOW TO USE:
 * Run: ts-node path/to/directory/marketplace-adhoc.ts
 */

export const processElementsDefenseMap = (
  elementAttackAdvantageMap: Record<Element, Element[]>
): Record<Element, number> => {
  const result: Record<Element, number> = {
    normal: 0,
    fire: 0,
    water: 0,
    electric: 0,
    grass: 0,
    ice: 0,
    fighting: 0,
    poison: 0,
    ground: 0,
    flying: 0,
    psychic: 0,
    bug: 0,
    rock: 0,
    ghost: 0,
    dragon: 0,
    dark: 0,
    steel: 0,
    fairy: 0,
  };
  for (const [_, values] of Object.entries(elementAttackAdvantageMap)) {
    for (const value of values) {
      result[value as Element] += 1;
    }
  }

  return result;
};

export const getElementsForDefenseStrengthWeakness = (
  elementAttackAdvantageMap: Record<Element, Element[]>,
  sortOrder: SortOrder
): ElementsStrengthWeaknessCount[] => {
  const result: ElementsStrengthWeaknessCount[] = [];

  const elementsDefenseWeaknessCountMap = processElementsDefenseMap(
    elementAttackAdvantageMap
  );
  for (const [key, value] of Object.entries(elementsDefenseWeaknessCountMap)) {
    result.push({
      element: key as Element,
      count: value,
    });
  }

  switch (sortOrder) {
    case "ascending": {
      result.sort((a, b) => a.count - b.count);
      break;
    }
    case "descending": {
      result.sort((a, b) => b.count - a.count);
    }
  }

  return result;
};

export const getElementsForAttackStrengthWeakness = (
  elementAttackAdvantageMap: Record<Element, Element[]>,
  sortOrder: SortOrder
): ElementsStrengthWeaknessCount[] => {
  const result: ElementsStrengthWeaknessCount[] = [];

  for (const [key, values] of Object.entries(elementAttackAdvantageMap)) {
    result.push({
      element: key as Element,
      count: values.length,
    });
  }

  switch (sortOrder) {
    case "ascending": {
      result.sort((a, b) => a.count - b.count);
      break;
    }
    case "descending": {
      result.sort((a, b) => b.count - a.count);
    }
  }

  return result;
};

export const combineAttackDefenseStrengthWeakness = (
  data: CombineAttackDefenseStrengthWeakness
): ElementsCombinedStrengthWeaknessCount[] => {
  const result: ElementsCombinedStrengthWeaknessCount[] = [];
  const {
    elementsWithMostAttackStrength,
    elementsWithLeastAttackWeakness,
    elementsWithMostDefenseStrength,
    elementsWithLeastDefenseWeakness,
    elementsWithMostSuperDefenseStrength,
    elementsWithLeastSuperAttackWeakness,
  } = data;

  if (
    elementsWithMostAttackStrength.length !==
      elementsWithLeastAttackWeakness.length &&
    elementsWithLeastAttackWeakness.length !==
      elementsWithMostDefenseStrength.length &&
    elementsWithMostDefenseStrength.length !==
      elementsWithLeastDefenseWeakness.length &&
    elementsWithLeastDefenseWeakness.length !==
      elementsWithMostSuperDefenseStrength.length &&
    elementsWithMostSuperDefenseStrength.length !==
      elementsWithLeastSuperAttackWeakness.length
  ) {
    console.log(
      "oops! lengths of attack defense strength weakness array are not equal"
    );
    return result;
  }

  const elementsWithMostAttackStrengthCountMap =
    processElementsStrengthWeaknessCountToObject(
      elementsWithMostAttackStrength
    );
  const elementsWithMostAttackWeaknessCountMap =
    processElementsStrengthWeaknessCountToObject(
      elementsWithLeastAttackWeakness
    );
  const elementsWithMostDefenseStrengthCountMap =
    processElementsStrengthWeaknessCountToObject(
      elementsWithMostDefenseStrength
    );
  const elementsWithLeastDefenseWeaknessCountMap =
    processElementsStrengthWeaknessCountToObject(
      elementsWithLeastDefenseWeakness
    );
  const elementsWithMostSuperDefenseStrengthCountMap =
    processElementsStrengthWeaknessCountToObject(
      elementsWithMostSuperDefenseStrength
    );
  const elementsWithLeastSuperAttackWeaknessCountMap =
    processElementsStrengthWeaknessCountToObject(
      elementsWithLeastSuperAttackWeakness
    );

  const SUPER_DEFENSE_STRENGTH_MULTIPLIER = 2;
  const SUPER_ATTACK_WEAKNESS_MULTIPLIER = 2;
  for (let i = 0; i < elementsWithMostAttackStrength.length; i++) {
    const element = elementsWithMostAttackStrength[i].element;

    const attackStrengthCount = elementsWithMostAttackStrengthCountMap[element];
    const attackWeaknessCount = elementsWithMostAttackWeaknessCountMap[element];
    const defenseStrengthCount =
      elementsWithMostDefenseStrengthCountMap[element];
    const defenseWeaknessCount =
      elementsWithLeastDefenseWeaknessCountMap[element];
    const superDefenseStrengthCount =
      elementsWithMostSuperDefenseStrengthCountMap[element];
    const superAttackWeaknessCount =
      elementsWithLeastSuperAttackWeaknessCountMap[element];

    const scoreWithoutSuperDefenseAttackStrengthWeakness =
      attackStrengthCount -
      attackWeaknessCount +
      defenseStrengthCount -
      defenseWeaknessCount;
    const score =
      scoreWithoutSuperDefenseAttackStrengthWeakness +
      superDefenseStrengthCount * SUPER_DEFENSE_STRENGTH_MULTIPLIER -
      superAttackWeaknessCount * SUPER_ATTACK_WEAKNESS_MULTIPLIER;

    result.push({
      element,
      attackStrengthCount,
      attackWeaknessCount,
      defenseStrengthCount,
      defenseWeaknessCount,
      superDefenseStrengthCount: superDefenseStrengthCount,
      superAttackWeaknessCount: superAttackWeaknessCount,
      score,
      scoreWithoutSuperDefenseAttackStrengthWeakness,
    });
  }

  result.sort((a, b) => {
    if (b.score > a.score) {
      return 1;
    }
    if (a.score > b.score) {
      return -1;
    }
    if (
      b.scoreWithoutSuperDefenseAttackStrengthWeakness >
      a.scoreWithoutSuperDefenseAttackStrengthWeakness
    ) {
      return 1;
    }
    if (
      a.scoreWithoutSuperDefenseAttackStrengthWeakness >
      b.scoreWithoutSuperDefenseAttackStrengthWeakness
    ) {
      return -1;
    }
    return 0;
  });
  return result;
};

export const processElementsStrengthWeaknessCountToObject = (
  elementsStrengthWeakness: ElementsStrengthWeaknessCount[]
): Record<Element, number> => {
  const result: Record<Element, number> = {
    normal: 0,
    fire: 0,
    water: 0,
    electric: 0,
    grass: 0,
    ice: 0,
    fighting: 0,
    poison: 0,
    ground: 0,
    flying: 0,
    psychic: 0,
    bug: 0,
    rock: 0,
    ghost: 0,
    dragon: 0,
    dark: 0,
    steel: 0,
    fairy: 0,
  };
  for (const elementStrengthWeakness of elementsStrengthWeakness) {
    result[elementStrengthWeakness.element as Element] =
      elementStrengthWeakness.count;
  }
  return result;
};

export const teamAnalysis = (elements: Element[]) => {
  const attackStrongAgainstMap: Partial<Record<Element, number>> = {};
  const attackWeakAgainstMap: Partial<Record<Element, number>> = {};
  const defenseWeakAgainstMap: Partial<Record<Element, number>> = {};
  const defenseStrongAgainstMap: Partial<Record<Element, number>> = {};

  const elementsWithLeastDefenseWeakness =
    getElementsForDefenseStrengthWeakness(
      elementAttackAdvantageMap,
      "ascending"
    );
  const defenseWeakAgainst = processElementsStrengthWeaknessCountToObject(
    elementsWithLeastDefenseWeakness
  );

  const elementsWithMostDefenseStrength = getElementsForDefenseStrengthWeakness(
    elementAttackDisadvantageMap,
    "descending"
  );
  const defenseStrongAgainst = processElementsStrengthWeaknessCountToObject(
    elementsWithMostDefenseStrength
  );

  // TODO: refactor
  for (const element of elements) {
    const attackStrongAgainst = elementAttackAdvantageMap[element];
    const attackWeakAgainst = elementAttackDisadvantageMap[element];

    for (const s of attackStrongAgainst) {
      if (!attackStrongAgainstMap[s]) {
        attackStrongAgainstMap[s] = 0;
      }
      attackStrongAgainstMap[s]++;
    }

    for (const s of attackWeakAgainst) {
      if (!attackWeakAgainstMap[s]) {
        attackWeakAgainstMap[s] = 0;
      }
      attackWeakAgainstMap[s]++;
    }

    if (!defenseWeakAgainstMap[element]) {
      defenseWeakAgainstMap[element] = 0;
    }
    defenseWeakAgainstMap[element] += defenseWeakAgainst[element];

    if (!defenseStrongAgainstMap[element]) {
      defenseStrongAgainstMap[element] = 0;
    }
    defenseStrongAgainstMap[element] += defenseStrongAgainst[element];
  }
  return {
    attackStrongAgainstMap,
    attackWeakAgainstMap,
    defenseStrongAgainstMap,
    defenseWeakAgainstMap,
  };
};

// Note that this does not take into account the distribution of the elements
// i.e. assume that there is an equal number elemons with each element, and there are no
// additional advantage an element has over another

// TODO: consider saving data in csv
const determineBestIndividualElements = () => {
  // Get statistic on the attack and defense strength and weakness of the elements
  const elementsWithLeastDefenseWeakness =
    getElementsForDefenseStrengthWeakness(
      elementAttackAdvantageMap,
      "ascending"
    );

  const elementsWithMostDefenseStrength = getElementsForDefenseStrengthWeakness(
    elementAttackDisadvantageMap,
    "descending"
  );

  const elementsWithMostAttackStrength = getElementsForAttackStrengthWeakness(
    elementAttackAdvantageMap,
    "descending"
  );

  const elementsWithLeastAttackWeakness = getElementsForAttackStrengthWeakness(
    elementAttackDisadvantageMap,
    "ascending"
  );
  const elementsWithMostSuperDefenseStrength =
    getElementsForDefenseStrengthWeakness(
      elementAttackIneffectiveMap,
      "descending"
    );
  const elementsWithLeastSuperAttackWeakness =
    getElementsForAttackStrengthWeakness(
      elementAttackIneffectiveMap,
      "ascending"
    );

  const elementsCombinedAttackDefenseStrengthWeakness =
    combineAttackDefenseStrengthWeakness({
      elementsWithMostAttackStrength,
      elementsWithLeastAttackWeakness,
      elementsWithMostDefenseStrength,
      elementsWithLeastDefenseWeakness,
      elementsWithMostSuperDefenseStrength,
      elementsWithLeastSuperAttackWeakness,
    });

  console.log("--- ELEMENTS WITH LEAST DEFENSE WEAKNESS ---");
  console.log(elementsWithLeastDefenseWeakness);
  console.log("--- Element WITH MOST ATTACK STRENGTH ---");
  console.log(elementsWithMostAttackStrength);
  console.log("--- ELEMENTS WITH MOST DEFENSE STRENGTH ---");
  console.log(elementsWithMostDefenseStrength);
  console.log("--- ELEMENTS WITH MOST ATTACK WEAKNESS ---");
  console.log(elementsWithLeastAttackWeakness);
  console.log("--- ELEMENTS WITH MOST SUPER DEFENSE STRENGTH ---");
  console.log(elementsWithMostSuperDefenseStrength);
  console.log("--- ELEMENTS WITH MOST SUPER ATTACK WEAKNESS ---");
  console.log(elementsWithLeastSuperAttackWeakness);
  console.log("--- ELEMENTS COMBINED ATTACK STRENGTH WEAKNESS ---");
  console.log(elementsCombinedAttackDefenseStrengthWeakness);
};

const analyseTeamComp = () => {
  const teams: Element[] = ["steel", "fairy", "ghost", "water", "ground"];
  const {
    attackStrongAgainstMap,
    attackWeakAgainstMap,
    defenseStrongAgainstMap,
    defenseWeakAgainstMap,
  } = teamAnalysis(teams);

  // TODO: test to assert output combineAttackDefenseStrengthWeakness() and teamAnalysis()
  // should tally in score
  console.log(`team: ${teams}`);
  console.log(`--- attack strong against ---`);
  console.log(attackStrongAgainstMap);
  console.log(
    `sum: ${Object.values(attackStrongAgainstMap).reduce(
      (sum: number, curr: number) => curr + sum,
      0
    )}`
  );

  console.log(`--- attack weak against ---`);
  console.log(attackWeakAgainstMap);
  console.log(
    `sum: ${Object.values(attackWeakAgainstMap).reduce(
      (sum: number, curr: number) => curr + sum,
      0
    )}`
  );

  console.log(`--- defense strong against ---`);
  console.log(defenseStrongAgainstMap);
  console.log(
    `sum: ${Object.values(defenseStrongAgainstMap).reduce(
      (sum: number, curr: number) => curr + sum,
      0
    )}`
  );

  console.log(`--- defense weak against ---`);
  console.log(defenseWeakAgainstMap);
  console.log(
    `sum: ${Object.values(defenseWeakAgainstMap).reduce(
      (sum: number, curr: number) => curr + sum,
      0
    )}`
  );
};

determineBestIndividualElements();
analyseTeamComp();
