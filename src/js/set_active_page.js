// Set the class for the active page in the navbar so it can be styled differently
document.addEventListener('DOMContentLoaded', () => {
    const url_path = window.location.pathname;
    const navbarPlaceholder = document.getElementById('navbar');
    if (navbarPlaceholder) {
        var current_page_href = document.querySelectorAll(`a[href='${url_path}']`);
        if (current_page_href.length == 1) {
            current_page_href = current_page_href[0];
            current_page_href.parentNode.classList.add("current-page");
        }
    }
});
