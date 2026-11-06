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

    const valid = totalText !== '' && readText !== '' &&
        Number.isInteger(total) && total > 0 &&
        Number.isInteger(read) && read >= 0 && 
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

        // Update book data
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
