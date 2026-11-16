// Display names for the three Claude models. The backend knows them by the enum names.
export const MODEL_NAMES = {
    CHEAP_AND_DUMB: "Billig og Dum (Haiku)",
    SMARTER_AND_PRICIER: "Lidt Klogere og Dyrere (Sonnet)",
    TOTAL_TOKEN_KILLER: "Total Token Killer (Fable)",
};

// Display names for the external APIs whose usage the backend records.
export const API_NAMES = {
    TEXS_FILL: "texs: udfyld gitter",
    TEXS_CLUES: "texs: hent ledetråde",
    CLAUDE_SOLVE: "Claude løser",
};
