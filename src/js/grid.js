// targets the_grid.html
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    videoId: '4-J4duzP8Ng',
    events: {
      'onReady': onPlayerReady
    }
  });
}

const clickableArea = {
  x1: 100,
  y1: 400,
  x2: 300,
  y2: 600,
};

function onPlayerReady() {
  function handleClick(event) {
    const clickX = event.pageX;
    const clickY = event.pageY;

    console.log(clickX, clickY);
    if (
      clickX >= clickableArea.x1 &&
      clickX <= clickableArea.x2 &&
      clickY >= clickableArea.y1 &&
      clickY <= clickableArea.y2
    ) {
      document.removeEventListener('click', handleClick);
      player.playVideo();
      setTimeout(function () {
        document.body.style.backgroundImage = 'url("/assets/images/grid.sun.png")';
        setTimeout(function () {
          var header = document.getElementById("page-header");
          header.style.color = "rgb(241, 26, 79)";
          header.style.fontFamily = "monospace";
        }, 3500);
        setTimeout(function () {
          const inLeft = document.createElement("div");
          inLeft.classList.add("slide-in-text");
          inLeft.textContent = "I GOT IN";
          document.body.appendChild(inLeft);
        }, 35500);
      }, 10000);
    }
  }
  document.addEventListener('click', handleClick);
}
