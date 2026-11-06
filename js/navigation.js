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
