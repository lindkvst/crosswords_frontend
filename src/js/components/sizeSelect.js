// Fills the grid size dropdown from GET /api/grid-templates/sizes.
// The player only picks the size. The backend picks one of the layouts of that size at random.
export function renderSizeOptions(select, sizes) {
    select.replaceChildren(...sizes.map(createOption));
}

function createOption({ size, layouts }) {
    const option = document.createElement("option");
    // The value is the size, which is what the backend expects in gridSize.
    option.value = size;
    option.textContent = `${size} × ${size} (${layouts} layouts)`;
    return option;
}
