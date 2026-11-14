export function renderClues(acrossList, downList, clues) {
    acrossList.replaceChildren(...itemsFor(clues, "across"));
    downList.replaceChildren(...itemsFor(clues, "down"));
}

function itemsFor(clues, direction) {
    return clues
        .filter(clue => clue.direction === direction)
        .map(createItem);
}

function createItem(clue) {
    const item = document.createElement("li");
    item.textContent = `${clue.number}. ${clue.text} (${clue.length})`;
    return item;
}
