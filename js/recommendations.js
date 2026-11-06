
/* iMyBook - Book Recommendation System
   Genre + Book Length + Local Storage
*/

const genreSelect = document.getElementById('genreSelect');
const bookLengthSelect = document.getElementById('bookLengthSelect');
const recommendBtn = document.getElementById('recommendBtn');
const recommendMessage = document.getElementById('recommendMessage');
const recommendResults = document.getElementById('recommendResults');

const RECOMMENDATION_KEY = 'imybook_last_recommendations';


// CHECK BOOK LENGTH
function matchesBookLength(book, selectedLength) {

    const pages = Number(book.number_of_pages_median);
    const knownPages = Number.isInteger(pages) && pages > 0;

    if (selectedLength === 'any') {
        return true;

    } else if (!knownPages) {
        return false;

    } else if (selectedLength === 'short') {
        return pages <= 200;

    } else if (selectedLength === 'medium') {
        return pages >= 201 && pages <= 400;

    } else if (selectedLength === 'long') {
        return pages > 400;
    }

    return false;
}


// DISPLAY RECOMMENDED BOOKS
function displayRecommendations(books) {

    recommendResults.replaceChildren();

    books.forEach(function (book) {

        const card = document.createElement('article');
        card.className = 'book-card';

        // Book cover
        if (book.cover_i) {
            const cover = document.createElement('img');

            cover.src =
                `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;

            cover.alt = 'Cover of ' + book.title;
            cover.loading = 'lazy';

            cover.onerror = function () {
                cover.remove();
            };

            card.appendChild(cover);
        }

        // Book title
        const title = document.createElement('h3');
        title.textContent = book.title || 'Unknown title';

        // Author
        const author = document.createElement('p');

        author.textContent = 'Author: ' + (
            Array.isArray(book.author_name) &&
            book.author_name.length
                ? book.author_name.join(', ')
                : 'Unknown author'
        );

        // Number of pages
        const pages = document.createElement('p');
        const pageCount = Number(book.number_of_pages_median);

        pages.textContent =
            Number.isInteger(pageCount) && pageCount > 0
                ? 'Approx. pages: ' + pageCount
                : 'Pages: Not available';

        card.append(title, author, pages);

        // Show Details and Add to Reading List
        addBookCardActions(card, book, recommendMessage);

        recommendResults.appendChild(card);
    });
}


// SAVE RECOMMENDATIONS TO LOCAL STORAGE
function storeRecommendations(genre, length, books) {

    const compactBooks = books.map(function (book) {

        return {
            key: book.key,
            title: book.title,
            author_name: Array.isArray(book.author_name)
                ? book.author_name : [],
            cover_i: book.cover_i || null,
            first_publish_year: book.first_publish_year || null,
            number_of_pages_median:
                book.number_of_pages_median || null,
            subject: Array.isArray(book.subject)
                ? book.subject.slice(0, 5) : []
        };
    });

    const savedData = {
        genre: genre,
        length: length,
        books: compactBooks
    };

    localStorage.setItem(
        RECOMMENDATION_KEY,
        JSON.stringify(savedData)
    );
}


// LOAD PREVIOUS RECOMMENDATIONS
function loadSavedRecommendations() {

    try {
        const raw = localStorage.getItem(RECOMMENDATION_KEY);

        if (!raw) {
            return;
        }

        const saved = JSON.parse(raw);

        if (!saved || !Array.isArray(saved.books)) {
            return;
        }

        const validGenres = [
            'fantasy',
            'romance',
            'mystery',
            'horror',
            'thriller',
            'science fiction'
        ];

        const validLengths = [
            'any', 'short', 'medium', 'long'
        ];

        if (validGenres.includes(saved.genre)) {
            genreSelect.value = saved.genre;
        }

        if (validLengths.includes(saved.length)) {
            bookLengthSelect.value = saved.length;
        }

        displayRecommendations(saved.books);

        recommendMessage.textContent =
            'Showing your previously saved recommendations.';

    } catch (error) {

        console.error('Load recommendation error:', error);

        recommendMessage.textContent =
            'Saved recommendations could not be loaded.';
    }
}


// RECOMMEND BOOKS BUTTON
recommendBtn.addEventListener('click', async function () {

    const genre = genreSelect.value;
    const length = bookLengthSelect.value;

    const validGenres = [
        'fantasy',
        'romance',
        'mystery',
        'horror',
        'thriller',
        'science fiction'
    ];

    const validLengths = [
        'any', 'short', 'medium', 'long'
    ];

    // Input validation
    if (
        !validGenres.includes(genre) ||
        !validLengths.includes(length)
    ) {
        recommendMessage.textContent =
            'Please select a valid genre and book length.';
        return;
    }

    recommendBtn.disabled = true;
    recommendResults.replaceChildren();

    recommendMessage.textContent =
        'Finding books that match your preferences...';

    try {

        // FETCH BOOKS FROM OPEN LIBRARY API
        const query = 'subject:' + genre;

        const fields =
            'key,title,author_name,cover_i,first_publish_year,' +
            'number_of_pages_median,subject';

        const url =
            'https://openlibrary.org/search.json?q=' +
            encodeURIComponent(query) +
            '&limit=60&fields=' + fields;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.docs) ||
            data.docs.length === 0) {

            recommendMessage.textContent =
                'No books found. Try another genre.';
            return;
        }

        // STUDENT-WRITTEN SUGGESTION LOGIC

        const seen = new Set();

        const suggestions = data.docs.filter(function (book) {

            const workId =
                String(book.key || '').split('/').pop();

            // Check valid book
            if (!/^OL\d+W$/.test(workId) || !book.title) {
                return false;
            }

            // Filter by book length
            if (!matchesBookLength(book, length)) {
                return false;
            }

            // Prevent duplicate books
            if (seen.has(workId)) {
                return false;
            }

            seen.add(workId);

            return true;

        }).slice(0, 8);

        // No matching recommendations
        if (suggestions.length === 0) {

            recommendMessage.textContent =
                length === 'any'
                    ? 'No suitable books found. Try another genre.'
                    : 'No books with a matching known page count. Try Any Length.';

            return;
        }

        // Display recommended books
        displayRecommendations(suggestions);

        // Save recommendations
        let saveNotice = '';

        try {
            storeRecommendations(genre, length, suggestions);
        } catch (error) {
            console.error('Recommendation save error:', error);

            saveNotice =
                ' Recommendations could not be saved locally.';
        }

        recommendMessage.textContent =
            `Found ${suggestions.length} recommendations ` +
            `for ${genre} (${length} length).` +
            saveNotice;

    } catch (error) {

        console.error('Recommendation error:', error);

        recommendMessage.textContent =
            'Unable to retrieve recommendations. ' +
            'Please check your internet connection.';

    } finally {

        recommendBtn.disabled = false;
    }
});


// LOAD SAVED RECOMMENDATIONS WHEN APP STARTS
loadSavedRecommendations();
