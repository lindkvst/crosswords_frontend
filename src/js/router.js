// A tiny router for one HTML page. Each <div data-page="..."> is a page, and the # in the URL picks which one is
// shown (#home, #spil, #kontakt, #stats). The page never reloads, so the login kept in memory survives, and the
// browser's back button works, because every page change is a new #.

const pages = document.querySelectorAll("[data-page]");
const links = document.querySelectorAll("[data-nav]");
const DEFAULT_PAGE = "home";

let canShow = () => true;
let onShow = () => {};

// canShow(name) decides if the page may be shown now (e.g. Stats only for admin). If not, Home is shown.
// onShow(name) runs after a page is shown, e.g. to fetch fresh data for it.
export function initRouter(options) {
    canShow = options.canShow;
    onShow = options.onShow;
    window.addEventListener("hashchange", render);
    render();
}

export function goTo(name) {
    // Setting the same hash again fires no hashchange, so render directly in that case.
    if (location.hash === `#${name}`) {
        render();
    } else {
        location.hash = name;
    }
}

export function render() {
    const requested = location.hash.slice(1) || DEFAULT_PAGE;
    const exists = [...pages].some(page => page.dataset.page === requested);
    const name = exists && canShow(requested) ? requested : DEFAULT_PAGE;

    pages.forEach(page => { page.hidden = page.dataset.page !== name; });
    links.forEach(link => {
        if (link.dataset.nav === name) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
    onShow(name);
}
