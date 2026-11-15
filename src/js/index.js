import {
    fetchCrosswords, createCrossword, fetchSubmissions, postSubmission, postClaudeSubmission,
    registerUser, fetchMe, setUnauthorizedHandler, fetchGridSizes, fetchApiCalls, fetchSubmission,
    fetchAdminUsers, fetchAdminUsage,
} from "./api/crosswordApi.js";
import { setCredentials, clearCredentials } from "./auth.js";
import { initAuthForms } from "./components/authForms.js";
import { renderCrosswordList, markSelected, sizeLabel } from "./components/crosswordList.js";
import { renderSizeOptions } from "./components/sizeSelect.js";
import { renderGrid, readGrid, markGrid, fillGrid } from "./components/crosswordGrid.js";
import { renderClues } from "./components/clueList.js";
import { renderSubmissions } from "./components/submissionList.js";
import { renderResourceRows } from "./components/resourceTable.js";
import { renderUsage, renderUsers } from "./components/adminPanel.js";
import { MODEL_NAMES } from "./models.js";
import { initRouter, goTo } from "./router.js";

const authSection = document.querySelector("#auth");
const authStatus = document.querySelector("#auth-status");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const welcome = document.querySelector("#welcome");
const navStats = document.querySelector("#nav-stats");
const userInfo = document.querySelector("#user-info");
const userName = document.querySelector("#user-name");
const logoutButton = document.querySelector("#logout");
const createForm = document.querySelector("#create-form");
const sizeSelect = document.querySelector("#grid-size");
const createStatus = document.querySelector("#create-status");
const newButton = document.querySelector("#new-crossword");
const crosswordList = document.querySelector("#crossword-list");
const puzzleSection = document.querySelector("#puzzle");
const puzzleTitle = document.querySelector("#puzzle-title");
const puzzleTheme = document.querySelector("#puzzle-theme");
const grid = document.querySelector("#grid");
const cluesAcross = document.querySelector("#clues-across");
const cluesDown = document.querySelector("#clues-down");
const submitButton = document.querySelector("#submit");
const claudeButton = document.querySelector("#claude-solve");
const modelSelect = document.querySelector("#claude-model");
const result = document.querySelector("#result");
const submissionsSection = document.querySelector("#submissions");
const submissionList = document.querySelector("#submission-list");
const resourceRows = document.querySelector("#resource-rows");
const adminModelOption = document.querySelector("#admin-model");
const adminUsage = document.querySelector("#admin-usage");
const adminUsers = document.querySelector("#admin-users");
const adminStatus = document.querySelector("#admin-status");
const status = document.querySelector("#status");

// The crossword on screen, and when it was shown. Used to measure the time to solve.
let currentCrossword = null;
let startedAt = 0;
// The logged-in user. Used to show "Vis svar" only on the user's own submissions.
let currentUser = null;

createForm.addEventListener("submit", onNewCrossword);
submitButton.addEventListener("click", onSubmit);
claudeButton.addEventListener("click", onClaudeSolve);
logoutButton.addEventListener("click", showLogin);
initAuthForms(loginForm, registerForm, { onLogin, onRegister });
// Any 401 from the backend, e.g. a wrong password, brings the login form back.
setUnauthorizedHandler(() => {
    showLogin();
    authStatus.textContent = "Log ind for at fortsætte.";
});
initRouter({ canShow, onShow: onPageShown });

// Home and Kontakt are open to everyone. Only a convenience: the backend answers 401/403 anyway.
function canShow(page) {
    if (page === "spil" && !currentUser) {
        authStatus.textContent = "Log ind for at spille.";
        return false;
    }
    if (page === "stats") {
        return currentUser?.role === "ADMIN";
    }
    return true;
}

// Stats is fetched every time the page is opened, so the numbers include the latest calls.
function onPageShown(page) {
    if (page === "stats") {
        loadAdmin();
    }
}

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
    currentUser = null;
    userInfo.hidden = true;
    navStats.hidden = true;
    welcome.hidden = true;
    authSection.hidden = false;
    goTo("home");
}

async function showApp(user) {
    currentUser = user;
    authStatus.textContent = "";
    authSection.hidden = true;
    userName.textContent = `Logget ind som ${user.username}`;
    userInfo.hidden = false;
    welcome.hidden = false;
    // Only a convenience: the backend refuses these for a player anyway.
    const isAdmin = user.role === "ADMIN";
    adminModelOption.disabled = !isAdmin;
    if (!isAdmin && modelSelect.value === adminModelOption.value) {
        modelSelect.value = "CHEAP_AND_DUMB";
    }
    navStats.hidden = !isAdmin;
    await loadApp();
    goTo("spil");
}

async function loadAdmin() {
    try {
        const [usage, users] = await Promise.all([fetchAdminUsage(), fetchAdminUsers()]);
        renderUsage(adminUsage, usage);
        renderUsers(adminUsers, users);
    } catch (error) {
        adminStatus.textContent = `Kunne ikke hente admin-data: ${error.message}`;
    }
}

async function loadApp() {
    try {
        renderSizeOptions(sizeSelect, await fetchGridSizes());
    } catch (error) {
        createStatus.textContent = `Kunne ikke hente gitterstørrelser: ${error.message}`;
    }
    try {
        const crosswords = await loadCrosswordList();
        if (crosswords.length > 0) {
            await showCrossword(crosswords.at(-1));
        } else {
            status.textContent = "Der er ingen gemte krydsord. Lav et nyt ovenfor for at komme i gang.";
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

    puzzleTitle.textContent = `Krydsord ${crossword.id} · ${sizeLabel(crossword)}`;
    puzzleTheme.textContent = crossword.theme ? `Tema: ${crossword.theme}` : "";
    markSelected(crosswordList, crossword.id);
    renderGrid(grid, crossword.puzzle);
    renderClues(cluesAcross, cluesDown, crossword.puzzle.clues);
    result.textContent = "";
    status.textContent = "";
    puzzleSection.hidden = false;
    submissionsSection.hidden = false;

    await showSubmissions();
}

// Submissions and resource usage are fetched together, because the table also shows the players' time.
async function showSubmissions() {
    try {
        const [submissions, apiCalls] = await Promise.all([
            fetchSubmissions(currentCrossword.id),
            fetchApiCalls(currentCrossword.id),
        ]);
        renderSubmissions(submissionList, submissions, currentUser.username, onShowSubmission);
        renderResourceRows(resourceRows, apiCalls, submissions);
    } catch (error) {
        status.textContent = `Kunne ikke hente afleveringer: ${error.message}`;
    }
}

// Puts a saved submission back in the grid with green and red cells, so the player can see what was right.
async function onShowSubmission(submission) {
    try {
        const { submittedGrid, cellMarks } = await fetchSubmission(currentCrossword.id, submission.id);
        fillGrid(grid, submittedGrid);
        markGrid(grid, cellMarks);
        const who = submission.llmModel ? MODEL_NAMES[submission.llmModel] : "Din aflevering";
        result.textContent = `${who}: ${submission.percentCorrect} % rigtige. Rediger gitteret og tjek igen, hvis du vil.`;
    } catch (error) {
        result.textContent = `Kunne ikke vise afleveringen: ${error.message}`;
    }
}

async function onNewCrossword(event) {
    event.preventDefault();
    const data = new FormData(createForm);
    const crosswordRequest = {
        gridSize: Number(data.get("gridSize")),
        playerPrompt: data.get("playerPrompt"),
    };
    // Disabled while waiting, so a double click cannot use two fills of the quota.
    newButton.disabled = true;
    createStatus.textContent = "Laver krydsord. Det kan tage op til et halvt minut.";
    try {
        const crossword = await createCrossword(crosswordRequest);
        createForm.reset();
        createStatus.textContent = "";
        await loadCrosswordList();
        await showCrossword(crossword);
    } catch (error) {
        createStatus.textContent = `Kunne ikke lave krydsordet: ${error.message}`;
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
