// Wires the login and register forms. The forms only collect the values;
// index.js decides what happens with them.
export function initAuthForms(loginForm, registerForm, { onLogin, onRegister }) {
    loginForm.addEventListener("submit", event => {
        event.preventDefault();
        const data = new FormData(loginForm);
        onLogin(data.get("email"), data.get("password"));
    });
    registerForm.addEventListener("submit", event => {
        event.preventDefault();
        const data = new FormData(registerForm);
        onRegister({
            username: data.get("username"),
            email: data.get("email"),
            password: data.get("password"),
        });
    });
}
