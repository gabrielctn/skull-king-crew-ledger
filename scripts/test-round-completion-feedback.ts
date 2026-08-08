/**
 * Run with: npm run test:round-completion-feedback
 */
import {
  finalRoundHaptic,
  gameHadCompleted,
} from "../src/roundCompletionFeedback";

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
  finalRoundHaptic(false) === "success"
);
check(
  "a final-round correction keeps impact feedback after draft editing unrecords it",
  finalRoundHaptic(
    gameHadCompleted({ status: "in_progress", finishedAt: 1_785_000_000_000 })
  ) === "impact"
);

const legacyFinishedBeforeEdit = gameHadCompleted({
  status: "finished",
  finishedAt: null,
});
const legacyDraftEdit = { status: "in_progress" as const, finishedAt: null };
check(
  "a pre-v8 finished game keeps impact feedback after editing clears its status",
  legacyFinishedBeforeEdit &&
    legacyDraftEdit.status === "in_progress" &&
    finalRoundHaptic(legacyFinishedBeforeEdit) === "impact"
);

if (failures > 0) process.exit(1);
