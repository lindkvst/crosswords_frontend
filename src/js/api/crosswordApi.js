import { API_BASE_URL } from "../config.js";
import { getAuthHeader, clearToken, basicHeader } from "../auth.js";

// Set by index.js. Called when the backend answers 401, so the login form can be shown.
let onUnauthorized = () => {};

export function setUnauthorizedHandler(handler) {
    onUnauthorized = handler;
}

export function registerUser(user) {
    return request("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    });
}

// The only call with the password. The answer is { token, expiresAt }, and the token is used from then on.
export function loginUser(username, password) {
    return request("/api/auth/login", {
        method: "POST",
        headers: { Authorization: basicHeader(username, password) },
    });
}

export function fetchMe() {
    return request("/api/users/me");
}

export function fetchAdminUsers() {
    return request("/api/admin/users");
}

export function fetchAdminUsage() {
    return request("/api/admin/usage");
}

export function fetchCrosswords() {
    return request("/api/crosswords");
}

export function fetchGridSizes() {
    return request("/api/grid-templates/sizes");
}

// crosswordRequest is { gridSize, playerPrompt }.
export function createCrossword(crosswordRequest) {
    return request("/api/crosswords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(crosswordRequest),
    });
}

export function fetchApiCalls(crosswordId) {
    return request(`/api/crosswords/${crosswordId}/api-calls`);
}

export function fetchSubmissions(crosswordId) {
    return request(`/api/crosswords/${crosswordId}/submissions`);
}

// Only works for your own submissions. The backend answers 403 for anyone else's.
export function fetchSubmission(crosswordId, submissionId) {
    return request(`/api/crosswords/${crosswordId}/submissions/${submissionId}`);
}

export function postSubmission(crosswordId, submission) {
    return request(`/api/crosswords/${crosswordId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
    });
}

export function postClaudeSubmission(crosswordId, model) {
    return request(`/api/crosswords/${crosswordId}/submissions/claude?model=${encodeURIComponent(model)}`, { method: "POST" });
}

// One place for every call, so login and errors are handled the same way everywhere.
// The backend answers errors with an ErrorMessage that has a "message" field.
async function request(path, options = {}) {
    const headers = { ...options.headers };
    // The login call brings its own Basic header. Every other call sends the token.
    const authHeader = getAuthHeader();
    if (authHeader && !headers.Authorization) {
        headers.Authorization = authHeader;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    if (res.status === 401) {
        // Wrong password, expired token or not logged in: forget the token and ask again.
        clearToken();
        onUnauthorized();
        throw new Error("Forkert brugernavn eller adgangskode, eller du er ikke logget ind");
    }
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message ?? `Kaldet fejlede med status ${res.status}`);
    }
    return res.json();
}
