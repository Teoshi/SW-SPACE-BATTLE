"use strict";
//класс для описания эскадрильи
class TieFighter {
  constructor({ position, gameView }) {
    this.speed = {
      x: 0,
      y: 0
    };

    const image = new Image();
    image.src = './img/tieFighter.png';
    image.onload = () => {
      const scale = 1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y
      };
    };
    this.view = gameView;
  };

  //invader движется со скоростю грида
  update({ greedSpeed }) {
    this.speed = greedSpeed;
    if (this.image) {
      this.view.drawInvader(this);
      this.position.x += this.speed.x;
      this.position.y += this.speed.y;
    }
  };

  //при выстреле новый снаряд добавляется в массив снарядов эскадрильи
  shoot(tFighterShots) {
    if (this.image) {
      this.view.playInvaderShootSound();

      tFighterShots.push(new TfighterBlasterShot({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height
        },
        speed: {
          x: 0,
          y: 5
        },
        gameView: this.view
      }
      ))
    }
  };
};