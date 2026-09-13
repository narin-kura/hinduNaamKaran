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
