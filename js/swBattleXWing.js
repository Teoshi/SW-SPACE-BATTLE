"use strict";
//класс для описания X-Wing'а
class Player {
  constructor({ gameView }) {
    this.speed = {
      x: 0,
      y: 0
    };
    this.opacity = 1;
    this.rotation = 0;

    const image = new Image();
    image.src = './img/x-Wing (2).png';
    image.onload = () => {
      const scale = 0.15;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: this.view.canvas.width / 2 - this.width / 2,
        y: this.view.canvas.height - this.height - 20
      };
    };
    this.view = gameView;
  }

  get playerName() {
    return this._playerName;
  }
  set playerName(value) {
    this._playerName = value;
  }

  get opacity() {
    return this._opacity;
  }
  set opacity(value) {
    this._opacity = value;
  }

  moveLeft() {
    if (this.image) {
      if (this.position.x >= 0) {
        this.speed.x = -5;
        this.rotation = -0.15;
      } else {
        this.speed.x = 0;
        this.rotation = 0;
      }
    }
  }

  moveRight() {
    if (this.image) {
      if (this.position.x + this.width < this.view.canvas.width) {
        this.speed.x = 5;
        this.rotation = 0.15;
      } else {
        this.speed.x = 0;
        this.rotation = 0;
      }
    }
  }

  stop() {
    if (this.image) {
      this.speed.x = 0;
      this.rotation = 0;
    }
  }

  update() {
    if (this.image) {
      this.view.drawPlayer(this);
      this.position.x += this.speed.x;
    }
  }
}