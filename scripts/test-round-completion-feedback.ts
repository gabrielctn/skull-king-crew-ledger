/**
 * Run with: npm run test:round-completion-feedback
 */
import { finalRoundHaptic } from "../src/roundCompletionFeedback";

let failures = 0;

function check(label: string, condition: boolean): void {
  if (condition) {
    console.log(`PASS ${label}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${label}`);
}

check(
  "recording a game for the first time uses success feedback",
  finalRoundHaptic({ status: "in_progress", finishedAt: null }) === "success"
);
check(
  "a final-round correction keeps impact feedback after draft editing unrecords it",
  finalRoundHaptic({ status: "in_progress", finishedAt: 1_785_000_000_000 }) ===
    "impact"
);

if (failures > 0) process.exit(1);
