import {
    fetchCrosswords, createCrossword, fetchSubmissions, postSubmission, postClaudeSubmission,
    registerUser, fetchMe, setUnauthorizedHandler,
} from "./api/crosswordApi.js";
import { setCredentials, clearCredentials } from "./auth.js";
import { initAuthForms } from "./components/authForms.js";
import { renderCrosswordList, markSelected } from "./components/crosswordList.js";
import { renderGrid, readGrid, markGrid, fillGrid } from "./components/crosswordGrid.js";
import { renderClues } from "./components/clueList.js";
import { renderSubmissions } from "./components/submissionList.js";
import { MODEL_NAMES } from "./models.js";

const authSection = document.querySelector("#auth");
const authStatus = document.querySelector("#auth-status");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const app = document.querySelector("#app");
const userInfo = document.querySelector("#user-info");
const userName = document.querySelector("#user-name");
const logoutButton = document.querySelector("#logout");
const newButton = document.querySelector("#new-crossword");
const crosswordList = document.querySelector("#crossword-list");
const puzzleSection = document.querySelector("#puzzle");
const puzzleTitle = document.querySelector("#puzzle-title");
const grid = document.querySelector("#grid");
const cluesAcross = document.querySelector("#clues-across");
const cluesDown = document.querySelector("#clues-down");
const submitButton = document.querySelector("#submit");
const claudeButton = document.querySelector("#claude-solve");
const modelSelect = document.querySelector("#claude-model");
const result = document.querySelector("#result");
const submissionList = document.querySelector("#submission-list");
const status = document.querySelector("#status");

// The crossword on screen, and when it was shown. Used to measure the time to solve.
let currentCrossword = null;
let startedAt = 0;

newButton.addEventListener("click", onNewCrossword);
submitButton.addEventListener("click", onSubmit);
claudeButton.addEventListener("click", onClaudeSolve);
logoutButton.addEventListener("click", showLogin);
initAuthForms(loginForm, registerForm, { onLogin, onRegister });
// Any 401 from the backend, e.g. a wrong password, brings the login form back.
setUnauthorizedHandler(() => {
    showLogin();
    authStatus.textContent = "Log ind for at fortsætte.";
});

async function onLogin(username, password) {
    setCredentials(username, password);
    try {
        // /me is the cheapest call that needs login, so it checks the password.
        const user = await fetchMe();
        loginForm.reset();
        await showApp(user);
    } catch (error) {
        authStatus.textContent = `Kunne ikke logge ind: ${error.message}`;
    }
}

async function onRegister(user) {
    try {
        await registerUser(user);
        registerForm.reset();
        await onLogin(user.username, user.password);
    } catch (error) {
        authStatus.textContent = `Kunne ikke oprette bruger: ${error.message}`;
    }
}

function showLogin() {
    clearCredentials();
    app.hidden = true;
    userInfo.hidden = true;
    authSection.hidden = false;
}

async function showApp(user) {
    authStatus.textContent = "";
    authSection.hidden = true;
    userName.textContent = `Logget ind som ${user.username}`;
    userInfo.hidden = false;
    app.hidden = false;
    await loadApp();
}

async function loadApp() {
    try {
        const crosswords = await loadCrosswordList();
        if (crosswords.length > 0) {
            await showCrossword(crosswords.at(-1));
        } else {
            status.textContent = "Der er ingen gemte krydsord. Hent et nyt for at komme i gang.";
        }
    } catch (error) {
        status.textContent = `Kunne ikke hente krydsord: ${error.message}`;
    }
}

async function loadCrosswordList() {
    const crosswords = await fetchCrosswords();
    renderCrosswordList(crosswordList, crosswords, showCrossword);
    return crosswords;
}

async function showCrossword(crossword) {
    currentCrossword = crossword;
    startedAt = Date.now();

    puzzleTitle.textContent = `Krydsord ${crossword.id}`;
    markSelected(crosswordList, crossword.id);
    renderGrid(grid, crossword.puzzle);
    renderClues(cluesAcross, cluesDown, crossword.puzzle.clues);
    result.textContent = "";
    status.textContent = "";
    puzzleSection.hidden = false;

    await showSubmissions();
}

async function showSubmissions() {
    try {
        renderSubmissions(submissionList, await fetchSubmissions(currentCrossword.id));
    } catch (error) {
        status.textContent = `Kunne ikke hente afleveringer: ${error.message}`;
    }
}

async function onNewCrossword() {
    // Disabled while waiting, so a double click cannot use two fills of the quota.
    newButton.disabled = true;
    status.textContent = "Henter nyt krydsord. Det kan tage op til 20 sekunder.";
    try {
        const crossword = await createCrossword();
        await loadCrosswordList();
        await showCrossword(crossword);
    } catch (error) {
        status.textContent = `Kunne ikke hente et nyt krydsord: ${error.message}`;
    } finally {
        newButton.disabled = false;
    }
}

async function onSubmit() {
    const submission = {
        grid: readGrid(grid),
        timeToSolveMs: Date.now() - startedAt,
    };
    try {
        const { submission: saved, cellMarks } = await postSubmission(currentCrossword.id, submission);
        markGrid(grid, cellMarks);
        const seconds = Math.round(saved.timeToSolveMs / 1000);
        result.textContent = `Du fik ${saved.percentCorrect} % rigtige på ${seconds} sekunder.`;
        await showSubmissions();
    } catch (error) {
        result.textContent = `Kunne ikke aflevere: ${error.message}`;
    }
}

async function onClaudeSolve() {
    // The buttons are disabled while Claude works, so the player cannot submit half-way.
    const model = modelSelect.value;
    setClaudeBusy(true);
    result.textContent = `${MODEL_NAMES[model]} løser krydsordet. Det kan tage fra sekunder til et par minutter.`;
    try {
        const { submission, submittedGrid, cellMarks } = await postClaudeSubmission(currentCrossword.id, model);
        fillGrid(grid, submittedGrid);
        markGrid(grid, cellMarks);
        const seconds = Math.round(submission.timeToSolveMs / 1000);
        result.textContent = `${MODEL_NAMES[submission.llmModel]} fik ${submission.percentCorrect} % rigtige på ${seconds} sekunder.`;
        await showSubmissions();
    } catch (error) {
        result.textContent = `Claude kunne ikke løse krydsordet: ${error.message}`;
    } finally {
        setClaudeBusy(false);
    }
}

function setClaudeBusy(busy) {
    claudeButton.disabled = busy;
    submitButton.disabled = busy;
    modelSelect.disabled = busy;
}
