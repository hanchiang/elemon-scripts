export type Element =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export type ProcessElementsAttackDefenseStrengthOperator = "+" | "-"
export type SortOrder = "ascending" | "descending"

export interface ElementsStrengthWeaknessCount {
  element: Element;
  count: number;
  // TODO: can consider adding the associated elements. Rename element to baseElement
}

export interface CombineAttackDefenseStrengthWeakness {
  elementsWithMostAttackStrength: ElementsStrengthWeaknessCount[];
  elementsWithLeastAttackWeakness: ElementsStrengthWeaknessCount[];
  elementsWithLeastDefenseWeakness: ElementsStrengthWeaknessCount[];
  elementsWithMostDefenseStrength: ElementsStrengthWeaknessCount[];
  elementsWithMostSuperDefenseStrength: ElementsStrengthWeaknessCount[];
  elementsWithLeastSuperAttackWeakness: ElementsStrengthWeaknessCount[];
}

export interface ElementsCombinedStrengthWeaknessCount {
  element: Element;
  attackStrengthCount: number;
  attackWeaknessCount: number;
  defenseStrengthCount: number;
  defenseWeaknessCount: number;
  superDefenseStrengthCount: number;
  superAttackWeaknessCount: number;
  score: number;
  scoreWithoutSuperDefenseAttackStrengthWeakness: number;
}