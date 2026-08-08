/**
 * Run with: npm run test:setup-validation
 */
import { validateSetupPlayers } from "../src/setupValidation";

let failures = 0;

function check(label: string, condition: boolean, detail = ""): void {
  if (condition) {
    console.log(`PASS ${label}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ""}`);
}

const twoDistinct = validateSetupPlayers([
  { id: "ada", name: "Ada" },
  { id: "bea", name: "Bea" },
]);
check(
  "two distinct named players can start and add a seat",
  twoDistinct.named.length === 2 &&
    twoDistinct.duplicateName === null &&
    twoDistinct.canStart &&
    twoDistinct.canAdd
);

const normalizedDuplicate = validateSetupPlayers([
  { id: "elise-1", name: "Élise de L’Île" },
  { id: "elise-2", name: "  ELISE\tDE l’île  " },
]);
check(
  "accents, case, and whitespace cannot make duplicate names distinct",
  normalizedDuplicate.duplicateName === "ELISE\tDE l’île" &&
    !normalizedDuplicate.canStart
);

const eightPlayers = validateSetupPlayers(
  Array.from({ length: 8 }, (_, index) => ({
    id: `player-${index + 1}`,
    name: `Player ${index + 1}`,
  }))
);
check(
  "eight players reaches the add-player ceiling",
  eightPlayers.canStart && !eightPlayers.canAdd
);

const ninePlayers = validateSetupPlayers(
  Array.from({ length: 9 }, (_, index) => ({
    id: `player-${index + 1}`,
    name: `Player ${index + 1}`,
  }))
);
check(
  "nine players cannot start or add another seat",
  !ninePlayers.canStart && !ninePlayers.canAdd
);

const nineSeatsWithEightNames = validateSetupPlayers([
  ...Array.from({ length: 8 }, (_, index) => ({
    id: `named-${index + 1}`,
    name: `Player ${index + 1}`,
  })),
  { id: "extra-blank-seat", name: "" },
]);
check(
  "a ninth blank seat cannot bypass the setup player ceiling",
  !nineSeatsWithEightNames.canStart && !nineSeatsWithEightNames.canAdd
);

const blankSeats = validateSetupPlayers([
  { id: "ada", name: "Ada" },
  { id: "blank", name: "   " },
  { id: "also-blank", name: "" },
]);
check(
  "blank seats do not count toward the two-player minimum",
  blankSeats.named.length === 1 && !blankSeats.canStart
);

const duplicateDisplayName = validateSetupPlayers([
  { id: "ada-1", name: "Ada" },
  { id: "bea", name: "Bea" },
  { id: "ada-2", name: "  ADA  " },
]);
check(
  "the duplicate feedback uses the trimmed player-facing name",
  duplicateDisplayName.duplicateName === "ADA"
);

if (failures > 0) process.exit(1);
