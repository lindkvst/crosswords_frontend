import { API_BASE_URL } from "../config.js";

export function fetchCrosswords() {
    return request("/api/crosswords");
}

export function createCrossword() {
    return request("/api/crosswords", { method: "POST" });
}

export function fetchSubmissions(crosswordId) {
    return request(`/api/crosswords/${crosswordId}/submissions`);
}

export function postSubmission(crosswordId, submission) {
    return request(`/api/crosswords/${crosswordId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
    });
}

// One place for every call, so errors are handled the same way everywhere.
// The backend answers errors with an ErrorMessage that has a "message" field.
async function request(path, options) {
    const res = await fetch(`${API_BASE_URL}${path}`, options);
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message ?? `Kaldet fejlede med status ${res.status}`);
    }
    return res.json();
}
