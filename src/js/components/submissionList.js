import { MODEL_NAMES } from "../models.js";

export function renderSubmissions(container, submissions) {
    if (submissions.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = "Ingen afleveringer endnu.";
        container.replaceChildren(empty);
        return;
    }
    container.replaceChildren(...submissions.map(createItem));
}

function createItem(submission) {
    // llmModel is null when a player solved it. username is null for submissions from before login existed.
    const player = submission.username ?? "Ukendt spiller";
    const who = submission.llmModel ? `${MODEL_NAMES[submission.llmModel]} (startet af ${player})` : player;
    const seconds = Math.round(submission.timeToSolveMs / 1000);

    const item = document.createElement("li");
    item.textContent = `${who}: ${submission.percentCorrect} % rigtige på ${seconds} sekunder`;
    return item;
}
