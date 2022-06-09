"use strict";
function vibro() {
  if (navigator.vibrate) {
    window.navigator.vibrate(20);
  }
}


(function init() {
  const canvas = document.querySelector('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const view = new GameView(canvas);
  const model = new GameModel({ gameView: view });
  const controller = new GameController(model);
  controller.start();
})();