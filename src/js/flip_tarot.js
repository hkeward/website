// targets major-arcana.html wands.html cups.html swords.html pentacles.html
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll(".card-large");
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const card_div = card.parentNode.parentNode;

      if (card.classList.contains("card-reversed")) {
        // flip card upright
        card_div.querySelectorAll(".upright").forEach((el) => {
          el.style.display = "block";
        });
        card_div.querySelectorAll(".reversed").forEach((el) => {
          el.style.display = "none";
        });
        card.classList.remove("card-reversed");
      } else {
        // reverse card
        card_div.querySelectorAll(".upright").forEach((el) => {
          el.style.display = "none";
        });
        card_div.querySelectorAll(".reversed").forEach((el) => {
          el.style.display = "block";
        });
        card.classList.add("card-reversed");
      }
    });
  });
});
