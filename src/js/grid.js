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
  x1: 350,
  y1: 350,
  x2: 450,
  y2: 450,
};

function onPlayerReady() {
  document.addEventListener('click', (event) => {
    const clickX = event.pageX;
    const clickY = event.pageY;

    console.log(clickX);
    console.log(clickY);
    if (
      clickX >= clickableArea.x1 &&
      clickX <= clickableArea.x2 &&
      clickY >= clickableArea.y1 &&
      clickY <= clickableArea.y2
    ) {
      console.log("HIT");
      document.body.style.backgroundImage = 'url("/assets/images/grid.sun.png")';
      player.playVideo();
    };
  });
};
