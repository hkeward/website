document.addEventListener('DOMContentLoaded', () => {
  const navbarPlaceholder = document.getElementById('navbar');
  if (navbarPlaceholder) {
    fetch('/html/components/navbar.html')
      .then(response => response.text())
      .then(data => {
        navbarPlaceholder.innerHTML = data;
      })
      .catch(err => console.error('Failed to load navbar:', err));
  }
});
