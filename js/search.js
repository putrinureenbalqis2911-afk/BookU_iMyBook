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
