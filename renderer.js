// Navigation between three functional views in index.html.
// Existing Search, Recommendation, CRUD and Calculation logic is unchanged.
const dashboardBtn = document.getElementById('dashboardBtn');
const discoverBtn = document.getElementById('discoverBtn');
const readingListBtn = document.getElementById('readingListBtn');

const dashboardPage = document.getElementById('dashboardPage');
const discoverPage = document.getElementById('discoverPage');
const readingListPage = document.getElementById('readingListPage');
const pageBreadcrumb = document.getElementById('pageBreadcrumb');

function showPage(pageName) {
    // Display one view at a time.
    dashboardPage.hidden = pageName !== 'dashboard';
    discoverPage.hidden = pageName !== 'discover';
    readingListPage.hidden = pageName !== 'readingList';

    // Highlight the active navigation button.
    dashboardBtn.classList.toggle('active', pageName === 'dashboard');
    discoverBtn.classList.toggle('active', pageName === 'discover');
    readingListBtn.classList.toggle('active', pageName === 'readingList');

    // Keep the navigation accessible for screen reader users.
    [dashboardBtn, discoverBtn, readingListBtn].forEach(function (button) {
        button.removeAttribute('aria-current');
    });

    if (pageName === 'dashboard') {
        pageBreadcrumb.textContent = 'HOME / DASHBOARD';
        dashboardBtn.setAttribute('aria-current', 'page');
        renderDashboard(); // Refresh statistics using current Local Storage.
    } else if (pageName === 'discover') {
        pageBreadcrumb.textContent = 'IMYBOOK / DISCOVER BOOKS';
        discoverBtn.setAttribute('aria-current', 'page');
    } else if (pageName === 'readingList') {
        pageBreadcrumb.textContent = 'YOUR LIBRARY / READING LIST';
        readingListBtn.setAttribute('aria-current', 'page');
        displaySavedBooks(); // Show updated records when returning to this view.
    }

    window.scrollTo(0, 0);
}

dashboardBtn.addEventListener('click', function () {
    showPage('dashboard');
});

discoverBtn.addEventListener('click', function () {
    showPage('discover');
});

readingListBtn.addEventListener('click', function () {
    showPage('readingList');
});

document.getElementById('exploreBooksBtn').addEventListener('click', function () {
    showPage('discover');
});

document.getElementById('viewReadingListBtn').addEventListener('click', function () {
    showPage('readingList');
});

document.getElementById('viewGoalsBtn').addEventListener('click', function () {
    showPage('readingList');
    document.getElementById('monthlyGoalSection').scrollIntoView({ behavior: 'smooth' });
});

// New home screen.
showPage('dashboard');