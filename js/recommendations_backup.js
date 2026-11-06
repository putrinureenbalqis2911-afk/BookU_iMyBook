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
