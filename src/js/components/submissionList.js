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
    const who = submission.llmAssisted ? "Claude" : "Spiller";
    const seconds = Math.round(submission.timeToSolveMs / 1000);

    const item = document.createElement("li");
    item.textContent = `${who}: ${submission.percentCorrect} % rigtige på ${seconds} sekunder`;
    return item;
}
