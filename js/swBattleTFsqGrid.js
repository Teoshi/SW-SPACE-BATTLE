"use strict";
//класс для описания грида из монстров
class TieFsquadronGrid {
  constructor(gameView, level) {
    this.position = {
      x: 0,
      y: 0
    };

    const startSpeed = 3;
    this.speed = {
      x: level * 0.5 + startSpeed,
      y: 0
    };

    this.gridLevel = level;
    this.view = gameView;
    this.tFighters = [];

    //кол-во столбцов монстров определяем в зависимости от ширины экрана
    //а также размера одного монстра (50px)
    //грид монстров по ширине должен занимать третью часть ширины экрана
    let columns = this.gridLevel + this.view.canvas.width / (50 * 3);
    if (columns > 15) {
      columns = 15;
    }
    let rows = this.gridLevel + 3;
    if (rows > 7) {
      rows = 7;
    }

    this.width = columns * 50;

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        this.tFighters.push(
          new TieFighter({
            position: {
              x: x * 50,
              y: y * 50
            },
            gameView: this.view
          })
        )
      }
    }
  }

  update() {
    if (this.tFighters.length > 0 && this.tFighters[0].image) {
      this.position.x += this.speed.x;
      this.position.y += this.speed.y;
      this.speed.y = 0;

      if (this.position.x + this.width >= this.view.canvas.width ||
        this.position.x <= 0) {
        this.speed.x = -this.speed.x * 1.1;
        this.speed.y = 30 + this.gridLevel;
      }
    }
  }
}