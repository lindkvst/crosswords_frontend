// The JWT from POST /api/auth/login. It is kept in sessionStorage, so reloading the page keeps the login,
// while closing the tab ends it. The password itself is only sent once, at login, and never stored.
// Any script on the page can read sessionStorage. That is one more reason the frontend only uses textContent,
// never innerHTML, for text from users (a theme with a <script> could otherwise steal the token).
const TOKEN_KEY = "crosswords.token";

// Only used for the login call. btoa only handles Latin-1, so the text is encoded as UTF-8 bytes first
// (æ, ø and å in a password).
export function basicHeader(username, password) {
    const bytes = new TextEncoder().encode(`${username}:${password}`);
    return `Basic ${btoa(String.fromCharCode(...bytes))}`;
}

export function setToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeader() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    return token ? `Bearer ${token}` : null;
}
