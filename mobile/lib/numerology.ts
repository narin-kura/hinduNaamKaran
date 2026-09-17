import chaldeanLetterValues from "../data/chaldeanLetterValues.json";
import numerologyCompatibility from "../data/numerologyCompatibility.json";

export type Rank = "best" | "good" | "worst";

function reduceToSingleDigit(n: number): number {
  let value = n;
  while (value > 9) {
    value = String(value)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return value;
}

/** Birth number (Mulank): digit-sum reduction of the birth day of month, 1-9. */
export function getBirthNumber(birthDay: number): number {
  return reduceToSingleDigit(birthDay);
}

/** Chaldean name number: letter values summed and reduced to a single digit, 1-9. */
export function getNameNumber(name: string): number {
  const letterValues: Record<string, number> = chaldeanLetterValues;
  const total = name
    .toUpperCase()
    .split("")
    .reduce((sum, char) => sum + (letterValues[char] ?? 0), 0);
  return reduceToSingleDigit(total);
}

export function getCompatibility(birthNumber: number, nameNumber: number): Rank {
  const table: Record<string, Record<string, Rank>> = numerologyCompatibility as any;
  return table[String(birthNumber)][String(nameNumber)];
}

/** Chaldean number -> ruling planet. */
export const PLANET_OF_NUMBER: Record<number, string> = {
  1: "the Sun", 2: "the Moon", 3: "Jupiter", 4: "Rahu", 5: "Mercury",
  6: "Venus", 7: "Ketu", 8: "Saturn", 9: "Mars",
};

const SHADOW_PLANETS = new Set([4, 7]);

export type LetterValue = { letter: string; value: number };

/** Letter-by-letter Chaldean values plus the reduction steps, for showing the arithmetic. */
export function getNameNumberBreakdown(name: string): {
  letters: LetterValue[];
  total: number;
  steps: number[];
  result: number;
} {
  const letterValues: Record<string, number> = chaldeanLetterValues;
  const letters = name
    .toUpperCase()
    .split("")
    .filter((c) => letterValues[c] !== undefined)
    .map((c) => ({ letter: c, value: letterValues[c] }));
  const total = letters.reduce((s, l) => s + l.value, 0);
  const steps: number[] = [];
  let v = total;
  while (v > 9) {
    v = String(v).split("").reduce((s, d) => s + Number(d), 0);
    steps.push(v);
  }
  return { letters, total, steps, result: v };
}

export type Relation = "same" | "friend" | "neutral" | "enemy" | "no-rule";

export type CompatibilityExplanation = {
  rank: Rank;
  relation: Relation;
  birthPlanet: string;
  namePlanet: string;
  /** One line for a list card, e.g. "Jupiter regards Venus as an enemy". */
  short: string;
  /** Two or three sentences for the detail screen. */
  long: string;
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const RANK_WORD: Record<Rank, string> = { best: "Best", good: "Good", worst: "Worst" };

export function explainCompatibility(birthNumber: number, nameNumber: number): CompatibilityExplanation {
  const rank = getCompatibility(birthNumber, nameNumber);
  const birthPlanet = PLANET_OF_NUMBER[birthNumber];
  const namePlanet = PLANET_OF_NUMBER[nameNumber];
  const word = RANK_WORD[rank];

  if (SHADOW_PLANETS.has(birthNumber) || SHADOW_PLANETS.has(nameNumber)) {
    const shadow = SHADOW_PLANETS.has(birthNumber) ? birthPlanet : namePlanet;
    return {
      rank, relation: "no-rule", birthPlanet, namePlanet,
      short: `${cap(shadow)}: no classical friendship rule`,
      long:
        `Birth number ${birthNumber} is ruled by ${birthPlanet} and name number ${nameNumber} by ${namePlanet}. ` +
        `The classical seven-planet friendship texts define no friends or enemies for ${shadow}, ` +
        `so this pairing ranks ${word} by convention rather than by doctrine.`,
    };
  }

  if (birthNumber === nameNumber) {
    return {
      rank, relation: "same", birthPlanet, namePlanet,
      short: `Same ruling planet: ${birthPlanet}`,
      long:
        `Both numbers are ruled by ${birthPlanet}. A name that shares the birth planet reinforces ` +
        `its qualities, so this is a ${word} match.`,
    };
  }

  const relation: Relation = rank === "best" ? "friend" : rank === "good" ? "neutral" : "enemy";
  const verb =
    relation === "friend" ? `counts ${namePlanet} as a friend`
    : relation === "neutral" ? `is neutral toward ${namePlanet}`
    : `regards ${namePlanet} as an enemy`;
  return {
    rank, relation, birthPlanet, namePlanet,
    short: `${cap(birthPlanet)} ${verb}`,
    long:
      `Birth number ${birthNumber} is ruled by ${birthPlanet} and name number ${nameNumber} by ${namePlanet}. ` +
      `In the classical planetary friendship chart, ${birthPlanet} ${verb}, so this is a ${word} match.`,
  };
}
