import { Element } from "../types/elements";

// We want an element value to be found in as few places as possible(defense)
// We want an element key to contain as many values as possible(strong offense)
export const elementAttackAdvantageMap: Record<Element, Element[]> = {
  normal: [],
  fire: ["grass", "ice", "bug", "steel"],
  water: ["fire", "ground", "rock"],
  electric: ["water", "flying"],
  grass: ["water", "ground", "rock"],
  ice: ["grass", "ground", "flying", "dragon"],
  fighting: ["normal", "ice", "rock", "dark", "steel"],
  poison: ["grass", "psychic"],
  ground: ["fire", "electric", "poison", "rock", "steel"],
  flying: ["grass", "fighting", "bug"],
  psychic: ["fighting", "poison"],
  bug: ["grass", "psychic", "dark"],
  rock: ["fire", "ice", "flying", "bug"],
  ghost: ["psychic", "ghost"],
  dragon: ["dragon"],
  dark: ["psychic", "ghost"],
  steel: ["ice", "rock", "fairy"],
  fairy: ["fighting", "dragon", "dark"],
};

// We want an element value to be found in as many places as possible(strong defense)
// We want an element key to contain as few values as possible(weak attack)
export const elementAttackDisadvantageMap: Record<Element, Element[]> = {
  normal: ["rock", "steel"],
  fire: ["fire", "water", "rock", "dragon"],
  water: ["water", "grass", "dragon"],
  electric: ["electric", "grass", "dragon"],
  grass: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"],
  ice: ["fire", "water", "ice", "steel"],
  fighting: ["poison", "flying", "psychic", "bug", "fairy"],
  poison: ["poison", "ground", "rock", "ghost"],
  ground: ["grass", "bug"],
  flying: ["electric", "rock", "steel"],
  psychic: ["psychic", "steel"],
  bug: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"],
  rock: ["poison", "ground", "steel"],
  ghost: ["dark"],
  dragon: ["steel"],
  dark: ["fighting", "dark", "fairy"],
  steel: ["fire", "water", "electric"],
  fairy: ["fire", "ghost", "steel"],
};

// We want an element value to be found in as many places as possible(super strong defense)
// We want an element key to contain as few values as possible(super weak attack)
export const elementAttackIneffectiveMap: Record<Element, Element[]> = {
  normal: ["ghost"],
  fire: [],
  water: [],
  electric: ["ground"],
  grass: [],
  ice: [],
  fighting: ["ghost"],
  poison: ["steel"],
  ground: ["flying"],
  flying: [],
  psychic: ["dark"],
  bug: [],
  rock: [],
  ghost: ["normal"],
  dragon: ["fairy"],
  dark: [],
  steel: [],
  fairy: [],
};
