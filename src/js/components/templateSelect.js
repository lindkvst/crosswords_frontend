// Fills the grid size dropdown from GET /api/grid-templates.
export function renderTemplateOptions(select, templates) {
    select.replaceChildren(...templates.map(createOption));
}

function createOption(template) {
    const option = document.createElement("option");
    // The value is the id, which is what the backend expects in gridTemplateId.
    option.value = template.id;
    option.textContent = `${template.rows} × ${template.cols}`;
    return option;
}
