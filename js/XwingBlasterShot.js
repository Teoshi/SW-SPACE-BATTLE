"use strict";
//класс для описания снаряда корабля
class XwingBlasterShot {
  constructor({ position, speed, gameView }) {
    this.position = position;
    this.speed = speed;
    this.view = gameView;
    this.radius = 3;
  }

  update() {
    this.view.drawBullet(this);
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;
  }
}