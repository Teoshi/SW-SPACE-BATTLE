"use strict";
//класс для описания звезд и космических частиц, включая частиц от взрыва
class StarParticles {
  constructor({ position, speed, radius, color, fades, gameView }) {
    this.position = position;
    this.speed = speed;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fades = fades;
    this.view = gameView;
  }

  update() {
    this.view.drawParticle(this);
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;
    if (this.fades) {
      this.opacity -= 0.01;
    }
  }
}