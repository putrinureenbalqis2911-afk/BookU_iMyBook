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

        // Create book object
        const newBook = {
            id: sourceKey,
            sourceKey: sourceKey,
            title: book.title || 'Unknown title',

            author: Array.isArray(book.author_name)
                ? book.author_name.join(', ')
                : 'Unknown author',

            coverId: book.cover_i || null,

            // Total Pages will be entered manually by user
            totalPages: null,

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
