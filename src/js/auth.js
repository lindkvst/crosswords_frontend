// The login lives only in this variable, not in localStorage or a cookie.
// Any script on the page can read localStorage, and it survives closing the browser.
// The price: reloading the page means logging in again.
let authHeader = null;

export function setCredentials(username, password) {
    // btoa only handles Latin-1, so the text is encoded as UTF-8 bytes first (æ, ø and å in a password).
    const bytes = new TextEncoder().encode(`${username}:${password}`);
    authHeader = `Basic ${btoa(String.fromCharCode(...bytes))}`;
}

export function clearCredentials() {
    authHeader = null;
}

export function getAuthHeader() {
    return authHeader;
}
