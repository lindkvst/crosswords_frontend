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
