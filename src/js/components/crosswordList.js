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

// The size is read from the grid itself, so the list needs nothing extra from the backend.
export function sizeLabel(crossword) {
    const grid = crossword.puzzle.grid;
    return `${grid.length} × ${grid[0].length}`;
}

function createItem(crossword, onSelect) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.id = crossword.id;
    button.textContent = `Krydsord ${crossword.id} · ${sizeLabel(crossword)}`;
    if (crossword.theme) {
        const theme = document.createElement("span");
        theme.className = "theme-label";
        theme.textContent = crossword.theme;
        button.append(theme);
    }
    button.addEventListener("click", () => onSelect(crossword));

    const item = document.createElement("li");
    item.append(button);
    return item;
}
