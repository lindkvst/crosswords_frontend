import { MODEL_NAMES } from "../models.js";
import { formatWh } from "../energy.js";

const API_NAMES = {
    TEXS_FILL: "texs: udfyld gitter",
    TEXS_CLUES: "texs: hent ledetråde",
    CLAUDE_SOLVE: "Claude løser",
};

// One row per external API call, followed by one row per player submission (the human "call").
export function renderResourceRows(tbody, apiCalls, submissions) {
    const callRows = apiCalls.map(call => createRow(
        call.llmModel ? `${API_NAMES[call.apiName]} (${MODEL_NAMES[call.llmModel]})` : API_NAMES[call.apiName],
        call.durationMs,
        call.inputTokens === null ? "–" : `${call.inputTokens} / ${call.outputTokens}`,
        call.estimatedWh));
    const humanRows = submissions
        .filter(submission => submission.llmModel === null)
        .map(submission => createRow(`Menneske: ${submission.username ?? "ukendt spiller"}`,
            submission.timeToSolveMs, "–", submission.estimatedWh));

    const rows = [...callRows, ...humanRows];
    if (rows.length === 0) {
        rows.push(createRow("Ingen målinger for dette krydsord endnu", null, "", null));
    }
    tbody.replaceChildren(...rows);
}

function createRow(label, durationMs, tokens, wh) {
    const row = document.createElement("tr");
    const cells = [
        label,
        durationMs === null ? "" : `${(durationMs / 1000).toLocaleString("da-DK", { maximumFractionDigits: 1 })} s`,
        tokens,
        wh === null ? "" : formatWh(wh),
    ];
    for (const text of cells) {
        const cell = document.createElement("td");
        cell.textContent = text;
        row.append(cell);
    }
    return row;
}
