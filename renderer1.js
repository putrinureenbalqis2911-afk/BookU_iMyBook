const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const bookResults = document.getElementById('bookResults');
const message = document.getElementById('message');

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();

    if (!query) {
        message.textContent = 'Please enter a book title or author..';
        return;
    }

    bookResults.replaceChildren();
    message.textContent = 'Searching for books...';

    try {
        // Request book data from Open Library API
        const url = 'https://openlibrary.org/search.json?q=' + encodeURIComponent(query) + '&limit=20' + '&fields=key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject';

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        // Convert JSON response into a JavaScript object
        const data = await response.json();

        if (!data.docs || data.docs.length === 0) {
            message.textContent = 'No books found. Try another search.';
            return;
        }

        // Display each book returned by the API
        data.docs.forEach((book) => {
            const card = document.createElement('article');
            card.className = 'book-card';

            const title = document.createElement('h3');
            title.textContent = book.title || 'Unknown title';

            const author = document.createElement('p');
            author.textContent =
                'Author: ' +
                (book.author_name?.join(', ') || 'Unknown author');

            const year = document.createElement('p');
            year.textContent =
                'First published: ' +
                (book.first_publish_year || 'Unknown');

            card.append(title, author, year);

            // Display a cover when the API provides a cover ID
            if (book.cover_i) {
                const cover = document.createElement('img');

                cover.src =
                    `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;

                cover.alt = `Cover of ${book.title || 'this book'}`;
                cover.loading = 'lazy';

                card.prepend(cover);
            }

            addBookCardActions(card, book, message);
            bookResults.appendChild(card);
        });

        message.textContent =
            `Found ${data.docs.length} book results.`;

    } catch (error) {
        console.error('Book search error:', error);

        message.textContent =
            'Unable to retrieve books. Please check your connection and try again.';
    }
});


const genreSelect = document.getElementById('genreSelect');
const recommendBtn = document.getElementById('recommendBtn');
const recommendMessage = document.getElementById('recommendMessage');
const recommendResults = document.getElementById('recommendResults');

recommendBtn.addEventListener('click', async function () {
    const genre = genreSelect.value;
    let searchTerm = '';

    // Student-written recommendation logic
    if (genre === 'fantasy') {
        searchTerm = 'fantasy';
    } else if (genre === 'romance') {
        searchTerm = 'romance';
    } else if (genre === 'mystery') {
        searchTerm = 'mystery';
    } else if (genre === 'science fiction') {
        searchTerm = 'science fiction';
    } else if (genre === 'horror') {
        searchTerm = 'horror';
    } else if (genre === 'thriller'){
        searchTerm = 'thriller';
    } else {
        recommendMessage.textContent =
            'No suitable recommendation is available.';
        return;
    }

    recommendResults.replaceChildren();
    recommendMessage.textContent = 'Finding recommended books...';

    try {
        const url =
            'https://openlibrary.org/search.json?q=' +
            encodeURIComponent('subject:' + searchTerm) +
            '&limit=10' + '&fields=key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject';

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Recommendation request failed.');
        }

        const data = await response.json();

        if (!data.docs || data.docs.length === 0) {
            recommendMessage.textContent =
                'No suitable books found for this genre.';
            return;
        }

        data.docs.forEach(function (book) {
            const card = document.createElement('article');
            card.className = 'book-card';

            const title = document.createElement('h3');
            title.textContent = book.title || 'Unknown title';

            const author = document.createElement('p');
            author.textContent =
                'Author: ' +
                (book.author_name?.join(', ') || 'Unknown author');

            card.append(title, author);

            if (book.cover_i) {
                const cover = document.createElement('img');
                cover.src =
                    `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
                cover.alt = `Cover of ${book.title || 'this book'}`;
                cover.loading = 'lazy';

                cover.onerror = function () {
                    cover.remove();
                };
                
                card.prepend(cover);
            }

            addBookCardActions(card, book, recommendMessage);
            recommendResults.appendChild(card);
        });

        recommendMessage.textContent =
            `Recommended books for ${genreSelect.options[genreSelect.selectedIndex].text}.`;

    } catch (error) {
        console.error('Recommendation error:', error);
        recommendMessage.textContent =
            'Unable to load recommendations. Please try again.';
    }
});

//NAVIGATION BETWEEN PAGES

//get navigations buttons 
const discoverBtn = document.getElementById('discoverBtn');
const readingListBtn = document.getElementById('readingListBtn');

//get selection
const discoverPage = document.getElementById('discoverPage');
const readingListPage = document.getElementById('readingListPage');

//function to display selected page
function showPage(pageName) {
    if(pageName === 'discover') {
        discoverPage.hidden = false;
        readingListPage.hidden = true;

        discoverBtn.classList.add('active');
        readingListBtn.classList.remove('active');
    } else if (pageName === 'readingList') {
        discoverPage.hidden = true;
        readingListPage.hidden = false;

        discoverBtn.classList.remove('active');
        readingListBtn.classList.add('active');
    }
}

//when discover books button is clicked
discoverBtn.addEventListener('click', function() {
    showPage('discover');
});

//when reading list button is clicked
readingListBtn.addEventListener('click', function() {
    showPage('readingList');
});

//display discover books when application starts
showPage('discover');

//book details and reading list

//local storage key
const READING_KEY = 'imybook_reading_list';

//read data from local storage
function getSavedBooks() {
    const data = JSON.parse(
        localStorage.getItem(READING_KEY) || '[]'
    );

    if(!Array.isArray(data)) {
        throw new Error('Invalid saved list');
    }

    return data;
}

//add buttons to each book card
function addBookCardActions(card, book, feedbackElement) {
    const actions = document.createElement('div');
    actions.className = 'book-actions';

    //show details button
    const detailsButton = document.createElement('button');
    detailsButton.type = 'button';
    detailsButton.textContent = 'Show Details';

    detailsButton.addEventListener('click', function() {
        showBookDetails(book);
    });

    //add reading list button
    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.textContent = 'Add to Reading List';
    const sourceKey = String(book.key || '').split('/').pop();
    addButton.dataset.sourceKey = sourceKey;

    addButton.addEventListener('click', function() {

        if(saveBookList(book, feedbackElement)) {
            addButton.textContent = 'Saved ✓';
            addButton.disabled = true;
        }
    });

    //check if book is already saved
    try {
        const key = String(book.key || '').split('/').pop();

        if(getSavedBooks().some(saved => saved.sourceKey === key)) {
            addButton.textContent = 'Saved ✓';
            addButton.disabled = true;
        }
    } catch(error) {
        console.error('Saved books check error : ', error);
    }

    actions.append(detailsButton, addButton);
    card.appendChild(actions);
}


//create - save selected book
function saveBookList(book, feedbackElement) {

    try {
        const list = getSavedBooks();

        const sourceKey = String(book.key || '').split('/').pop();

        if(!/^OL\d+W$/.test(sourceKey)) {
            feedbackElement.textContent =
                'Cannot save this book: missing book ID.';
            return false;
        }

        // Prevent duplicate books
        if (list.some(saved =>
            saved.sourceKey === sourceKey
        )) {
            feedbackElement.textContent =
                'This book is already in My Reading List.';
            return false;
        }

        const pageCount = Number(
            book.number_of_pages_median
        );

        // Create book object
        const newBook = {
            id: sourceKey,
            sourceKey: sourceKey,
            title: book.title || 'Unknown title',

            author: Array.isArray(book.author_name)
                ? book.author_name.join(', ')
                : 'Unknown author',

            coverId: book.cover_i || null,

            totalPages:
                Number.isInteger(pageCount) && pageCount > 0
                    ? pageCount
                    : null,

            pagesRead: 0,
            status: 'To Read'
        };

        // Save into Local Storage
        list.push(newBook);

        localStorage.setItem(
            READING_KEY,
            JSON.stringify(list)
        );

        displaySavedBooks();

        feedbackElement.textContent =
            'Book added to My Reading List!';

        return true;

    } catch (error) {

        console.error('Save error:', error);

        feedbackElement.textContent =
            'Could not save book. Please try again.';

        return false;
    }
}

/* READ AND UPDATE READING PROGRESS */

function displaySavedBooks() {

    const container = document.getElementById('savedBooks');
    container.replaceChildren();

    let list;

    try {
        list = getSavedBooks();
    } catch (error) {
        container.textContent = 'Unable to load saved books.';
        return;
    }

    if (list.length === 0) {
        container.textContent =
            'No saved books yet. Add one from Discover Books!';
        return;
    }

    // Display every saved book
    list.forEach(function (book) {

        const card = document.createElement('article');
        card.className = 'book-card';

        // Display book cover
        if (book.coverId) {
            const cover = document.createElement('img');

            cover.src =
                `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`;

            cover.alt = 'Cover of ' + book.title;
            card.appendChild(cover);
        }

        // Display book title and author
        const title = document.createElement('h3');
        title.textContent = book.title;

        const author = document.createElement('p');
        author.textContent = 'Author: ' + book.author;

        const total = Number(book.totalPages);
        const pagesRead = Number(book.pagesRead) || 0;

        const hasTotal =
            Number.isInteger(total) && total > 0;

        const pages = document.createElement('p');

        pages.textContent = hasTotal
            ? `Pages Read: ${pagesRead} / ${total}`
            : 'Total Pages: Not available';

        const status = document.createElement('p');
        status.textContent = 'Status: ' + book.status;

        card.append(title, author, pages, status);

        // CALCULATION
        if (hasTotal) {

            const percent = Math.min(
                100,
                (pagesRead / total) * 100
            );

            const progressLabel = document.createElement('p');

            progressLabel.textContent =
                `Reading Progress: ${percent.toFixed(1)}%`;

            // Create progress bar
            const track = document.createElement('div');
            track.className = 'progress-track';

            const fill = document.createElement('div');
            fill.className = 'progress-fill';
            fill.style.width = percent + '%';

            track.appendChild(fill);

            // Calculate remaining pages
            const remaining = document.createElement('p');

            remaining.textContent =
                `Remaining Pages: ${Math.max(0, total - pagesRead)}`;

            card.append(progressLabel, track, remaining);

        } else {

            const note = document.createElement('p');

            note.textContent =
                'Enter Total Pages to calculate your reading progress.';

            card.appendChild(note);
        }

        
        // UPDATE PROGRESS BUTTON

        const editButton = document.createElement('button');

        editButton.type = 'button';
        editButton.textContent = 'Update Progress';

        editButton.addEventListener('click', function () {
            openProgressDialog(book.id);
        });

        card.appendChild(editButton);


        // delete book button
        const deleteButton = document.createElement('button');

        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete Book';
        deleteButton.className = 'delete-book-btn';

        deleteButton.addEventListener('click', function() {
            deleteSavedBook(book.id);
        })

        card.appendChild(deleteButton);
        container.appendChild(card);
    });
}


// SHOW BOOK DETAILS POPUP
async function showBookDetails(book) {

    const dialog = document.getElementById('bookDialog');
    const heading = document.getElementById('dialogBookTitle');
    const content = document.getElementById('dialogBookContent');

    heading.textContent = book.title || 'Unknown title';
    content.replaceChildren();

    function addDetail(label, value) {
        const p = document.createElement('p');
        p.textContent = label + ': ' + value;
        content.appendChild(p);
    }

    addDetail(
        'Author',
        Array.isArray(book.author_name)
            ? book.author_name.join(', ')
            : 'Unknown'
    );

    addDetail(
        'First published',
        book.first_publish_year || 'Unknown'
    );

    addDetail(
        'Total Pages',
        book.number_of_pages_median || 'Not available'
    );

    addDetail(
        'Subjects',
        Array.isArray(book.subject)
            ? book.subject.slice(0, 3).join(', ')
            : 'Not available'
    );

    const synopsis = document.createElement('p');
    synopsis.textContent = 'Loading synopsis...';
    content.appendChild(synopsis);

    dialog.showModal();

    // Get work ID from API
    const workId = String(book.key || '').split('/').pop();

    if (!/^OL\d+W$/.test(workId)) {
        synopsis.textContent = 'Synopsis not available.';
        return;
    }

    try {
        const response = await fetch(
            `https://openlibrary.org/works/${workId}.json`
        );

        if (!response.ok) {
            throw new Error('Details request failed');
        }

        const data = await response.json();

        const description =
            typeof data.description === 'string'
                ? data.description
                : data.description?.value;

        synopsis.textContent = description
            ? 'Synopsis: ' + description
            : 'Synopsis not available.';

    } catch (error) {
        synopsis.textContent =
            'Unable to load synopsis. Please try again.';
    }
}


// CLOSE DETAILS POPUP
document.getElementById('closeBookDialog')
    .addEventListener('click', function () {

        document.getElementById('bookDialog').close();

    });


// DISPLAY SAVED BOOKS WHEN APPLICATION STARTS
displaySavedBooks();


/* DELETE - REMOVE BOOK FROM READING LIST */

function deleteSavedBook(bookId) {

    try {
        // Retrieve all saved books
        const list = getSavedBooks();

        // Find the selected book
        const selectedBook = list.find(function (book) {
            return book.id === bookId;
        });

        if (!selectedBook) {
            throw new Error('Book not found.');
        }

        // Ask for confirmation before deleting
        const confirmation = window.confirm(
            'Are you sure you want to delete "' +
            selectedBook.title +
            '" from My Reading List?'
        );

        // Cancel deletion
        if (!confirmation) {
            return;
        }

        // Remove selected book from array
        const updatedList = list.filter(function (book) {
            return book.id !== bookId;
        });

        // Save updated list into Local Storage
        localStorage.setItem(
            READING_KEY,
            JSON.stringify(updatedList)
        );

        // Refresh My Reading List
        displaySavedBooks();

        // Display success message
        document.getElementById('readingMessage')
            .textContent =
            '"' + selectedBook.title +
            '" deleted successfully!';

        // Allow deleted book to be added again
        document.querySelectorAll(
            '.book-actions button[data-source-key]'
        ).forEach(function (button) {

            if (
                button.dataset.sourceKey ===
                selectedBook.sourceKey
            ) {
                button.disabled = false;
                button.textContent = 'Add to Reading List';
            }
        });

    } catch (error) {

        console.error('Delete book error:', error);

        document.getElementById('readingMessage')
            .textContent =
            'Unable to delete book. Please try again.';
    }
}


/* UPDATE READING PROGRESS POPUP */

const progressDialog =
    document.getElementById('progressDialog');

const progressForm =
    document.getElementById('progressForm');

const progressBookTitle =
    document.getElementById('progressBookTitle');

const progressTotal =
    document.getElementById('progressTotal');

const progressRead =
    document.getElementById('progressRead');

const progressError =
    document.getElementById('progressError');

const progressPercent =
    document.getElementById('progressPercent');

const progressRemaining =
    document.getElementById('progressRemaining');

const progressFill =
    document.getElementById('progressPreviewFill');

let editingBookId = null;


// GET AND VALIDATE USER INPUT
function getProgressInput() {

    const totalText = progressTotal.value.trim();
    const readText = progressRead.value.trim();

    const total = Number(totalText);
    const read = Number(readText);

    const valid =
        totalText !== '' &&
        readText !== '' &&
        Number.isInteger(total) &&
        total > 0 &&
        Number.isInteger(read) &&
        read >= 0 &&
        read <= total;

    return { total, read, valid };
}


// LIVE PROGRESS CALCULATION
function updateProgressPreview() {

    const { total, read, valid } = getProgressInput();

    if (!valid) {
        progressPercent.textContent = '—';
        progressRemaining.textContent =
            'Enter valid page numbers.';

        progressFill.style.width = '0%';
        return;
    }

    const percentage = (read / total) * 100;

    progressPercent.textContent =
        percentage.toFixed(1) + '%';

    progressRemaining.textContent =
        (total - read) + ' pages remaining';

    progressFill.style.width = percentage + '%';
}


// OPEN UPDATE PROGRESS POPUP
function openProgressDialog(bookId) {

    try {
        const book = getSavedBooks().find(
            item => item.id === bookId
        );

        if (!book) {
            throw new Error('Book not found');
        }

        editingBookId = book.id;

        progressBookTitle.textContent = book.title;

        // Display previously saved values
        progressTotal.value =
            Number(book.totalPages) > 0
                ? book.totalPages
                : '';

        progressRead.value = book.pagesRead ?? 0;

        // Clear previous errors
        progressError.hidden = true;
        progressError.textContent = '';

        updateProgressPreview();
        progressDialog.showModal();

    } catch (error) {

        console.error('Unable to open progress:', error);

        const feedback =
            document.getElementById('readingMessage');

        if (feedback) {
            feedback.textContent =
                'Unable to open progress editor.';
        }
    }
}


// SHOW RED ERROR MESSAGE
function showProgressError(text) {

    progressError.textContent = text;
    progressError.hidden = false;
}


// UPDATE PREVIEW WHEN USER TYPES
[progressTotal, progressRead].forEach(function (input) {

    input.addEventListener('input', function () {

        progressError.hidden = true;
        updateProgressPreview();

    });

});


// SAVE UPDATED READING PROGRESS
progressForm.addEventListener('submit', function (event) {

    event.preventDefault();

    const { total, read, valid } = getProgressInput();

    if (!valid) {

        showProgressError(
            'Invalid page numbers! Total Pages must be greater than 0 and Pages Read cannot exceed Total Pages.'
        );

        return;
    }

    try {
        const list = getSavedBooks();

        const book = list.find(
            item => item.id === editingBookId
        );

        if (!book) {
            showProgressError(
                'Book not found. Please reopen the editor.'
            );
            return;
        }

        // UPDATE BOOK INFORMATION
        book.totalPages = total;
        book.pagesRead = read;

        // AUTOMATIC READING STATUS
        if (read === total) {
            book.status = 'Completed';

        } else if (read === 0) {
            book.status = 'To Read';

        } else {
            book.status = 'Reading';
        }

        // SAVE TO LOCAL STORAGE
        localStorage.setItem(
            READING_KEY,
            JSON.stringify(list)
        );

        // CLOSE POPUP
        progressDialog.close();

        // REFRESH SAVED BOOKS
        displaySavedBooks();

        document.getElementById('readingMessage')
            .textContent =
            'Reading progress updated successfully!';

    } catch (error) {

        console.error('Unable to update progress:', error);

        showProgressError(
            'Could not save reading progress. Please try again.'
        );
    }
});


// CANCEL WITHOUT SAVING
document.getElementById('cancelProgress')
    .addEventListener('click', function () {

        progressDialog.close();

    });


// RESET SELECTED BOOK WHEN POPUP CLOSES
progressDialog.addEventListener('close', function () {

    editingBookId = null;

});


/* MONTHLY READING GOAL TRACKER */

const MONTHLY_GOAL_KEY = 'imybook_monthly_goals';

const monthlyGoalForm =
    document.getElementById('monthlyGoalForm');

const monthlyGoalMonth =
    document.getElementById('monthlyGoalMonth');

const monthlyGoalTarget =
    document.getElementById('monthlyGoalTarget');

const monthlyGoalCompleted =
    document.getElementById('monthlyGoalCompleted');

const monthlyGoalError =
    document.getElementById('monthlyGoalError');

const monthlyGoalResult =
    document.getElementById('monthlyGoalResult');


// READ SAVED MONTHLY GOALS
function getMonthlyGoals() {

    const data = JSON.parse(
        localStorage.getItem(MONTHLY_GOAL_KEY) || '{}'
    );

    if (!data || typeof data !== 'object' ||
        Array.isArray(data)) {
        throw new Error('Invalid monthly goal data');
    }

    return data;
}


// VALIDATE USER INPUT
function getMonthlyGoalInput() {

    const month = monthlyGoalMonth.value;
    const goalText = monthlyGoalTarget.value.trim();
    const completedText = monthlyGoalCompleted.value.trim();

    const goal = Number(goalText);
    const completed = Number(completedText);

    const valid =
        /^\d{4}-(0[1-9]|1[0-2])$/.test(month) &&
        goalText !== '' &&
        completedText !== '' &&
        Number.isSafeInteger(goal) &&
        goal > 0 &&
        Number.isSafeInteger(completed) &&
        completed >= 0;

    return { month, goal, completed, valid };
}


// CALCULATE AND DISPLAY ACHIEVEMENT
function displayMonthlyGoal(goal, completed) {

    const percentage = (completed / goal) * 100;

    const remaining = Math.max(0, goal - completed);

    document.getElementById('monthlyGoalPercentage')
        .textContent = percentage.toFixed(1) + '%';

    document.getElementById('monthlyGoalFill')
        .style.width = Math.min(100, percentage) + '%';

    document.getElementById('monthlyGoalRemaining')
        .textContent = remaining + ' books remaining';

    const status =
        document.getElementById('monthlyGoalStatus');

    // Student-written control statements
    if (completed > goal) {

        status.textContent =
            'Amazing! You exceeded your goal by ' +
            (completed - goal) + ' books!';

    } else if (completed === goal) {

        status.textContent =
            'Congratulations! Monthly goal achieved!';

    } else {

        status.textContent =
            'Keep reading! You can reach your goal!';
    }

    monthlyGoalResult.hidden = false;
}


// LIVE CALCULATION PREVIEW
function previewMonthlyGoal() {

    const data = getMonthlyGoalInput();

    monthlyGoalError.hidden = true;

    if (data.valid) {
        displayMonthlyGoal(data.goal, data.completed);
    } else {
        monthlyGoalResult.hidden = true;
    }
}

monthlyGoalTarget.addEventListener(
    'input', previewMonthlyGoal
);

monthlyGoalCompleted.addEventListener(
    'input', previewMonthlyGoal
);


// CREATE / UPDATE - SAVE MONTHLY GOAL
monthlyGoalForm.addEventListener('submit', function (event) {

    event.preventDefault();

    const data = getMonthlyGoalInput();

    if (!data.valid) {

        monthlyGoalError.textContent =
            'Please enter a valid month, a goal greater than 0, and a non-negative completed count.';

        monthlyGoalError.hidden = false;
        return;
    }

    try {

        const goals = getMonthlyGoals();

        // Save values under selected month
        goals[data.month] = {
            goal: data.goal,
            completed: data.completed
        };

        localStorage.setItem(
            MONTHLY_GOAL_KEY,
            JSON.stringify(goals)
        );

        displayMonthlyGoal(data.goal, data.completed);

        monthlyGoalError.hidden = true;

        document.getElementById('monthlyGoalMessage')
            .textContent =
            'Monthly reading goal saved successfully!';

    } catch (error) {

        console.error('Monthly goal save error:', error);

        monthlyGoalError.textContent =
            'Unable to save monthly goal. Please try again.';

        monthlyGoalError.hidden = false;
    }
});


// READ - LOAD GOAL FOR SELECTED MONTH
function loadMonthlyGoal() {

    monthlyGoalError.hidden = true;

    document.getElementById('monthlyGoalMessage')
        .textContent = '';

    try {

        const goals = getMonthlyGoals();
        const saved = goals[monthlyGoalMonth.value];

        if (saved &&
            Number.isSafeInteger(saved.goal) &&
            saved.goal > 0 &&
            Number.isSafeInteger(saved.completed) &&
            saved.completed >= 0) {

            monthlyGoalTarget.value = saved.goal;
            monthlyGoalCompleted.value = saved.completed;

            displayMonthlyGoal(saved.goal, saved.completed);

        } else {

            monthlyGoalTarget.value = '';
            monthlyGoalCompleted.value = 0;
            monthlyGoalResult.hidden = true;
        }

    } catch (error) {

        console.error('Monthly goal load error:', error);

        monthlyGoalError.textContent =
            'Unable to load saved monthly goals.';

        monthlyGoalError.hidden = false;
        monthlyGoalResult.hidden = true;
    }
}


// LOAD WHEN USER CHANGES MONTH
monthlyGoalMonth.addEventListener(
    'change', loadMonthlyGoal
);


// SELECT CURRENT MONTH AUTOMATICALLY
const today = new Date();

monthlyGoalMonth.value =
    today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0');

loadMonthlyGoal();


