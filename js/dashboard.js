/* DASHBOARD: read-only summary built from EXISTING Local Storage records.
   No new API calls, book records, or storage keys are created. */

function renderDashboard() {
    let books = [];
    let goals = {};

    try {
        books = getSavedBooks();
    } catch (error) {
        console.error('Dashboard could not read saved books:', error);
    }

    try {
        goals = getMonthlyGoals();
    } catch (error) {
        console.error('Dashboard could not read monthly goals:', error);
    }

    // Count books based on the status already saved in Reading List.
    const readingBooks = books.filter(function (book) {
        return book.status === 'Reading';
    });
    const completedBooks = books.filter(function (book) {
        return book.status === 'Completed';
    });

    document.getElementById('dashboardSavedCount').textContent = books.length;
    document.getElementById('dashboardReadingCount').textContent = readingBooks.length;
    document.getElementById('dashboardCompletedCount').textContent = completedBooks.length;

    // Display one currently reading book, if available.
    const continueContainer = document.getElementById('dashboardContinue');
    continueContainer.replaceChildren();

    if (readingBooks.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'dashboard-empty';
        empty.textContent = 'No book in progress yet. Add a book and update its reading progress!';
        continueContainer.appendChild(empty);
    } else {
        const book = readingBooks[0];
        const wrap = document.createElement('div');
        wrap.className = 'continue-book';

        if (book.coverId) {
            const cover = document.createElement('img');
            cover.className = 'continue-cover';
            cover.src = `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`;
            cover.alt = 'Cover of ' + book.title;
            cover.loading = 'lazy';
            cover.onerror = function () { cover.remove(); };
            wrap.appendChild(cover);
        }

        const details = document.createElement('div');
        details.className = 'continue-details';
        const tag = document.createElement('span');
        tag.className = 'continue-tag';
        tag.textContent = 'Currently reading';
        const title = document.createElement('h4');
        title.textContent = book.title || 'Untitled';
        const author = document.createElement('p');
        author.textContent = book.author || 'Unknown author';
        details.append(tag, title, author);

        const total = Number(book.totalPages);
        const read = Number(book.pagesRead);
        if (Number.isInteger(total) && total > 0 && Number.isInteger(read) && read >= 0) {
            const percent = Math.min(100, Math.max(0, (read / total) * 100));
            const track = document.createElement('div');
            track.className = 'goal-mini-track';
            const fill = document.createElement('div');
            fill.style.width = percent + '%';
            track.appendChild(fill);
            const label = document.createElement('p');
            label.className = 'continue-pages';
            label.textContent = read + ' of ' + total + ' pages · ' + percent.toFixed(0) + '%';
            details.append(track, label);
        }

        wrap.appendChild(details);
        continueContainer.appendChild(wrap);
    }

    // Monthly Goal is entered manually by the user on My Reading List.
    const now = new Date();
    const monthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const goal = goals[monthKey];
    const monthName = now.toLocaleString('en-US', { month: 'long' }).toUpperCase();
    document.getElementById('dashboardGoalMonth').textContent = monthName;

    const stat = document.getElementById('dashboardGoalPercent');
    const big = document.getElementById('dashboardGoalBigPercent');
    const details = document.getElementById('dashboardGoalDetails');
    const remaining = document.getElementById('dashboardGoalRemaining');
    const fill = document.getElementById('dashboardGoalFill');

    if (goal && Number.isSafeInteger(goal.goal) && goal.goal > 0 &&
        Number.isSafeInteger(goal.completed) && goal.completed >= 0) {
        const percentage = (goal.completed / goal.goal) * 100;
        const text = percentage.toFixed(1) + '%';
        stat.textContent = text;
        big.textContent = text;
        details.textContent = goal.completed + ' of ' + goal.goal + ' books completed';
        remaining.textContent = Math.max(0, goal.goal - goal.completed) + ' books to go';
        fill.style.width = Math.min(100, percentage) + '%';
    } else {
        stat.textContent = '—';
        big.textContent = '—';
        details.textContent = 'Set a monthly goal to see your progress.';
        remaining.textContent = 'Your reading journey starts here.';
        fill.style.width = '0%';
    }
}