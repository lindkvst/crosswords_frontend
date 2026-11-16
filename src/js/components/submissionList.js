import { MODEL_NAMES } from "../models.js";
import { formatWh } from "../energy.js";

// onShow(submission) is called when the player clicks "Vis svar". The button is only shown on the player's own
// submissions, because the backend refuses the rest (a Claude answer with 100 % is the answer key).
// Ownership is compared by user id, which never changes, not by the username, which may.
export function renderSubmissions(container, submissions, currentUserId, onShow) {
    if (submissions.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = "Ingen afleveringer endnu.";
        container.replaceChildren(empty);
        return;
    }
    container.replaceChildren(...submissions.map(submission => createItem(submission, currentUserId, onShow)));
}

function createItem(submission, currentUserId, onShow) {
    // llmModel is null when a player solved it. username is null for submissions from before login existed.
    const player = submission.username ?? "Ukendt spiller";
    const who = submission.llmModel ? `${MODEL_NAMES[submission.llmModel]} (startet af ${player})` : player;
    const seconds = Math.round(submission.timeToSolveMs / 1000);

    const item = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = `${who}: ${submission.percentCorrect} % rigtige på ${seconds} sekunder (≈ ${formatWh(submission.estimatedWh)})`;
    item.append(text);

    if (submission.userId === currentUserId) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "secondary small";
        button.textContent = "Vis svar";
        button.addEventListener("click", () => onShow(submission));
        item.append(button);
    }
    return item;
}
