export function renderCrosswordList(container, crosswords, onSelect) {
    container.replaceChildren(...crosswords.map(crossword => createItem(crossword, onSelect)));
}

// Highlights the button for the crossword on screen. aria-pressed tells screen readers the same.
export function markSelected(container, crosswordId) {
    for (const button of container.querySelectorAll("button")) {
        const selected = Number(button.dataset.id) === crosswordId;
        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", selected);
    }
}

function createItem(crossword, onSelect) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.id = crossword.id;
    button.textContent = `Krydsord ${crossword.id}`;
    button.addEventListener("click", () => onSelect(crossword));

    const item = document.createElement("li");
    item.append(button);
    return item;
}
