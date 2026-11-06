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
