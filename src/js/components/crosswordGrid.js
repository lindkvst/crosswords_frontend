// The puzzle grid is a list of strings, one per row: '.' is a cell to fill in, '#' is a black cell.

// How far each arrow key moves, in rows and columns.
const ARROW_STEPS = {
    ArrowUp: { row: -1, col: 0 },
    ArrowDown: { row: 1, col: 0 },
    ArrowLeft: { row: 0, col: -1 },
    ArrowRight: { row: 0, col: 1 },
};

export function renderGrid(container, puzzle) {
    const numbers = startNumbers(puzzle.clues);
    const cells = [];
    puzzle.grid.forEach((rowText, row) => {
        [...rowText].forEach((char, col) => {
            cells.push(createCell(char, row, col, numbers.get(`${row},${col}`)));
        });
    });
    // The CSS grid needs to know how many columns a row has.
    container.style.setProperty("--columns", puzzle.grid[0].length);
    container.replaceChildren(...cells);
}

// Reads the inputs back into the same format the backend expects.
export function readGrid(container) {
    const rows = new Map();
    for (const cell of container.children) {
        const row = cell.dataset.row;
        rows.set(row, (rows.get(row) ?? "") + cellValue(cell));
    }
    return [...rows.values()];
}

// Colours the cells after a check. cellMarks uses the grid's row format:
// '+' correct, '-' wrong, '.' empty, '#' black.
export function markGrid(container, cellMarks) {
    for (const cell of container.children) {
        const mark = cellMarks[cell.dataset.row][cell.dataset.col];
        cell.classList.toggle("correct", mark === "+");
        cell.classList.toggle("wrong", mark === "-");
    }
}

// Writes a grid of letters into the inputs, e.g. Claude's answer. '.' becomes an empty cell.
export function fillGrid(container, letterGrid) {
    for (const cell of container.children) {
        const input = cell.querySelector("input");
        if (input) {
            const letter = letterGrid[cell.dataset.row][cell.dataset.col];
            input.value = letter === "." ? "" : letter.toUpperCase();
        }
    }
}

// A clue knows where its word starts, so the clues tell us which cells get a number.
function startNumbers(clues) {
    const numbers = new Map();
    for (const clue of clues) {
        numbers.set(`${clue.row},${clue.col}`, clue.number);
    }
    return numbers;
}

function createCell(char, row, col, number) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.row = row;
    cell.dataset.col = col;

    if (char === "#") {
        cell.classList.add("black");
        return cell;
    }
    if (number !== undefined) {
        const label = document.createElement("span");
        label.className = "cell-number";
        label.textContent = number;
        cell.append(label);
    }
    cell.append(createInput(row, col));
    return cell;
}

function createInput(row, col) {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 1;
    input.autocomplete = "off";
    input.setAttribute("aria-label", `Række ${row + 1}, kolonne ${col + 1}`);
    input.addEventListener("input", () => {
        input.value = input.value.toUpperCase();
        // A changed letter has not been checked yet, so its colour no longer applies.
        input.closest(".cell").classList.remove("correct", "wrong");
    });
    input.addEventListener("keydown", event => {
        const step = ARROW_STEPS[event.key];
        if (step) {
            // Stops the browser from also moving the text cursor inside the input.
            event.preventDefault();
            moveFocus(input, row + step.row, col + step.col, step);
        }
    });
    return input;
}

// Moves focus one cell in the arrow's direction. Black cells are skipped,
// and nothing happens when the edge of the grid is reached.
function moveFocus(input, row, col, step) {
    const grid = input.closest(".grid");
    let cell = cellAt(grid, row, col);
    while (cell && cell.classList.contains("black")) {
        row += step.row;
        col += step.col;
        cell = cellAt(grid, row, col);
    }
    if (cell) {
        cell.querySelector("input").focus();
    }
}

function cellAt(grid, row, col) {
    return grid.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

function cellValue(cell) {
    if (cell.classList.contains("black")) {
        return "#";
    }
    const letter = cell.querySelector("input").value.trim();
    return letter === "" ? "." : letter;
}
