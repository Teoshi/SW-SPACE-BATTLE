"use strict";
class TfighterBlasterShot {
  constructor({ position, speed, gameView }) {
    this.position = position;
    this.speed = speed;
    this.view = gameView;

    this.width = 3;
    this.height = 10;
  }

  update() {
    this.view.drawTfShot(this);
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;
  }
}