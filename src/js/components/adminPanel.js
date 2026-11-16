import { formatWh } from "../energy.js";
import { API_NAMES } from "../models.js";

export function renderUsage(tbody, usage) {
    tbody.replaceChildren(...usage.map(createUsageRow));
}

export function renderUsers(list, users) {
    list.replaceChildren(...users.map(user => {
        const item = document.createElement("li");
        item.textContent = `${user.username} (${user.email}) – ${user.role}`;
        return item;
    }));
}

// One row per role, one column per permission, ✓ where the role has it. Read from the database, so roles added
// with SQL show up too.
export function renderRoleMatrix(table, { permissions, roles }) {
    const header = document.createElement("tr");
    header.append(cell("th", "Rolle"), ...permissions.map(p => {
        const th = cell("th", p.name);
        th.title = p.description;
        return th;
    }));
    const rows = roles.map(role => {
        const row = document.createElement("tr");
        const name = cell("th", role.name);
        name.title = role.description ?? "";
        row.append(name, ...permissions.map(p => cell("td", role.permissions.includes(p.name) ? "✓" : "–")));
        return row;
    });
    table.replaceChildren(header, ...rows);
}

function cell(tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    return element;
}

function createUsageRow(summary) {
    const row = document.createElement("tr");
    // The token sums are null for texs, which has no tokens.
    const tokens = summary.totalInputTokens === null ? "–" : `${summary.totalInputTokens} / ${summary.totalOutputTokens}`;
    const cells = [
        API_NAMES[summary.apiName],
        summary.calls,
        `${Math.round(summary.totalDurationMs / 1000)} s`,
        tokens,
        formatWh(summary.totalEstimatedWh),
    ];
    for (const text of cells) {
        const cell = document.createElement("td");
        cell.textContent = text;
        row.append(cell);
    }
    return row;
}
