"use strict";
////MODEL/////
class GameModel {
  constructor({ gameView }) {
    this.view = gameView;
    this.player = new Player({ gameView: this.view });
    this.playMusic = false;
    this.bullets = []; // массив для снарядов игрока     
    this.gridLevel = 0; //уровень грида монстров, чем выше - тем больше рядов монстров и скорость движения
    this.maxLevel = 20;
    this.grid = new TieFsquadronGrid(this.view, this.gridLevel);
    this.tFshots = []; //массив для снарядов монстров
    this.particles = []; //массив для частиц от взрыва объектов
    this.score = 0; //сколько очков набрал игрок
    this.state = { // состояние игры
      over: true,
      active: false
    };
  }

  _spaState = '';

  set spaState(value) {
    this._spaState = value;
    switch (value) {
      case 'main':
        this.state = {
          over: true,
          active: false
        };
        this.view.drawNewState(value);
        break;
      case 'game':
        this.state = {
          over: false,
          active: true
        };
        this.view.drawNewState(value);
        break;
      case 'records':
        this.state = {
          over: true,
          active: false
        };
        this.getRecord();
        this.view.drawNewState(value);
        break;
      default:
        this._spaState = 'main';
        this.state = {
          over: true,
          active: false
        };
        this.view.drawNewState('main');
        break;
    }
  }

  get spaState() {
    return this._spaState;
  }

  init({ playerName, playMusic }) {
    this.player = new Player({
      gameView: this.view
    });
    this.player.playerName = playerName;
    this.playMusic = playMusic;

    this.bullets = []; // массив для снарядов игрока    
    this.tFshots = []; //массив для снарядов монстров
    this.particles = []; //массив для частиц от взрыва объектов
    this.score = 0;
    this.state = {
      over: false,
      active: true
    };

    this.gridLevel = 0;
    this.createGrid();
    this.view.initModel(this);
    this.createSpaceStars();

    if (this.playMusic) {
      this.view.playBackgroundMusic();
    }
  }

  createSpaceStars() {
    for (let i = 0; i < 150; i++) {
      this.particles.push(new StarParticles({
        position: {
          x: Math.random() * this.view.canvas.width,
          y: Math.random() * this.view.canvas.height
        },
        speed: {
          x: 0,
          y: 0.2
        },
        radius: Math.random() * 2,
        color: 'white',
        fades: false,
        gameView: this.view
      }));
    }
  }

  createParticle({ object, color, fades }) {
    for (let i = 0; i < 15; i++) {
      this.particles.push(new StarParticles({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2
        },
        speed: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        },
        radius: Math.random() * 3,
        color: color || '#ffac9c',
        fades: fades,
        gameView: this.view
      }));
    }
  }

  createGrid() {
    this.gridLevel = (this.gridLevel > this.maxLevel) ? this.maxLevel : ++this.gridLevel;
    this.grid = new TieFsquadronGrid(this.view, this.gridLevel);
  }

  updateCanvas() {
    if (this.view) {
      this.view.drawCanvas();
    }
  }

  updateParticles() {
    this.particles.forEach((particle, i) => {
      if (particle.position.y - particle.radius >= this.view.canvas.height) {
        particle.position.x = Math.random() * this.view.canvas.width;
        particle.position.y = -particle.radius;
      }
      if (particle.opacity <= 0) {
        setTimeout(() => {
          this.particles.splice(i, 1);
        }, 0);
      } else {
        particle.update();
      }
    });
  }

  endGame() {

    setTimeout(() => {
      this.player.opacity = 0;
      this.state.over = true;
      this.view.platShipExplSound();

      if (this.player.playerName) {
        this.saveRecord();
      }
    }, 0);

    setTimeout(() => {
      this.state.active = false;
      this.view.endGame();
    }, 2000);

    this.createParticle({
      object: this.player,
      color: '#ffbb7d',
      fades: true
    });

  }

  // обновление таблицы рекордов
  saveRecord() {
    let self = this;
    let storageName = 'ORLOV_AA_SW_SPACE_BATTLE_RECORDS';
    let ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
    let updatePassword;

    let successStorageHandler = function(callresult) {
      if (callresult.error !== undefined) {
        console.log(callresult.error);
      } else {
        console.log(`new record for player ${self.player.playerName}: ${self.score}!`);
      }
    };

    let errorStorageHandler = function(jqXHR, statusStr, errorStr) {
      console.log(statusStr + ' ' + errorStr);
    };

    let lockGetReady = function(callresult) {
      if (callresult.error !== undefined)
        console.log(callresult.error);
      else {
        let newRecord = {
          player: self.player.playerName,
          scores: self.score
        };
        let resultArray = JSON.parse(callresult.result);
        if (!Array.isArray(resultArray)) {
          resultArray = [];
        }

        resultArray.push(newRecord);
        resultArray.sort((a, b) => {
          return b.scores - a.scores;
        });

        if (resultArray.length > 10) {
          resultArray.splice(10, 1);
        }

        $.ajax({
          url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
          data: { f: 'UPDATE', n: storageName, v: JSON.stringify(resultArray), p: updatePassword },
          success: successStorageHandler,
          error: errorStorageHandler
        });
      }
    };

    let updateRecord = function() {
      updatePassword = Math.random();
      $.ajax({
        url: ajaxHandlerScript,
        type: 'POST',
        cache: false,
        dateType: 'json',
        data: { f: 'LOCKGET', n: storageName, p: updatePassword },
        success: lockGetReady,
        error: errorStorageHandler
      });
    };

    let readReady = function(callresult) {
      if (callresult.error !== undefined) {
        console.log(callresult.error);
      } else if (callresult.result === "") {
        let recordArray = [];
        recordArray.push({
          player: self.player.playerName, scores: self.score
        });
        $.ajax({
          url: ajaxHandlerScript,
          type: 'POST',
          cache: false,
          dateType: 'json',
          data: { f: 'INSERT', n: storageName, v: JSON.stringify(recordArray) },
          success: successStorageHandler,
          error: errorStorageHandler
        });
      } else {
        updateRecord();
      }
    };

    $.ajax(
      {
        url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
        data: { f: 'READ', n: storageName },
        success: readReady,
        error: errorStorageHandler
      }
    );
  }

  getRecord() {
    let self = this;
    let storageName = 'ORLOV_AA_SW_SPACE_BATTLE_RECORDS';
    let ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";

    let errorHandler = function(jqXHR, statusStr, errorStr) {
      console.log(statusStr + ' ' + errorStr);
    };

    let readRecordDataReady = function(callresult) {
      if (callresult.error !== undefined)
        console.log(callresult.error);
      else {
        let hashArray = JSON.parse(callresult.result);
        if (!Array.isArray(hashArray)) {
          hashArray = [];
        }
        self.view.showRecordTable(hashArray);
      }
    };

    $.ajax(
      {
        url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
        data: { f: 'READ', n: storageName },
        success: readRecordDataReady,
        error: errorHandler
      }
    );
  }

  closeRecord() {
    this.view.closeRecordTable();
  }

  updateTfShots() {
    this.tFshots.forEach((tFshot, index) => {
      if (tFshot.position.y + tFshot.height >= this.view.canvas.height) {
        setTimeout(() => {
          this.tFshots.splice(index, 1);
        }, 0);
      } else {
        tFshot.update();
      }

      //если снаряд монстра попал в игрока, игра завершается
      if (!this.state.over
        && tFshot.position.y + tFshot.height >= this.player.position.y
        && tFshot.position.x + tFshot.width >= this.player.position.x
        && tFshot.position.x <= this.player.position.x + this.player.width) {

        setTimeout(() => {
          this.tFshots.splice(index, 1);
        }, 0);

        this.endGame();
      }
    });
  }

  updateShots() {
    this.bullets.forEach((bullet, index) => {
      if (bullet.position.y + bullet.radius <= 0) {
        setTimeout(() => {
          this.bullets.splice(index, 1);
        }, 0);
      } else {
        bullet.update();
      }
    });
  }

  updateGridTfighters(frames) { // frames - как много тиков прошло с момента запуска игры
    if (this.grid.tFighters.length > 0 && this.grid.tFighters[0].image) {
      this.grid.update();

      if (!this.state.over && frames % 50 === 0) { //случайный монстр из грида делает выстрел
        this.grid.tFighters[Math.floor(Math.random() * this.grid.tFighters.length)].shoot(this.tFshots);
      }

      for (let i = this.grid.tFighters.length - 1; i >= 0; i--) {
        const invader = this.grid.tFighters[i];
        invader.update({ greedSpeed: this.grid.speed });

        //определяем попал ли какой-нибудь из снарядов игрока в текущего монстра из массива
        this.bullets.forEach((bullet, j) => {
          if (bullet.position.y - bullet.radius <= invader.position.y + invader.height
            && bullet.position.x + bullet.radius >= invader.position.x
            && bullet.position.x - bullet.radius <= invader.position.x + invader.width
            && bullet.position.y + bullet.radius >= invader.position.y) {

            //удаляем монстра и снаряд игрока из игры
            setTimeout(() => {
              const tFighterFound = this.grid.tFighters.find((x) => x === invader);
              const bulletFound = this.bullets.find((x) => x === bullet);

              if (tFighterFound && bulletFound) {
                this.score += 100;
                this.view.updateScore(this.score);
                //создаем частицы от взрыва после попадания снаряда в монстра
                this.createParticle({
                  object: invader,
                  fades: true
                });

                this.grid.tFighters.splice(i, 1);
                this.bullets.splice(j, 1);

                //изменяем размер и координаты грида, тк уменьшилось кол-во монстров в гриде
                if (this.grid.tFighters.length > 0) {
                  const firstTfighter = this.grid.tFighters[0];
                  const lastTfighter = this.grid.tFighters[this.grid.tFighters.length - 1];
                  this.grid.width = lastTfighter.position.x - firstTfighter.position.x + lastTfighter.width;
                  this.grid.position.x = firstTfighter.position.x
                }
                //звук от взрыва
                this.view.playInvaderExplSound();
              }
            }, 0);
          }
        });

        //если монстр коснулся игрока, игра завершается
        const tFighterFound = this.grid.tFighters.find((x) => x === invader);
        if (!this.state.over && tFighterFound && this.player.image && invader.image
          && invader.position.y + invader.height >= this.player.position.y
          && invader.position.x + invader.width >= this.player.position.x
          && invader.position.x <= this.player.position.x + this.player.width) {

          this.endGame();

          setTimeout(() => {
            this.grid.tFighters.splice(i, 1);
          }, 0);
          //создаем частицы от взрыва монстра после касания с игроком
          this.createParticle({
            object: invader,
            fades: true
          });
        }
      }
    } else if (this.grid.tFighters.length === 0 && frames % 100 === 0) {
      this.createGrid(); //если в гриде закончились монстры, создаем новый грид
    }
  }

  createBullet() {
    this.view.createBulletSound();
    this.bullets.push(new XwingBlasterShot({
      position: {
        x: this.player.position.x + this.player.width / 2,
        y: this.player.position.y
      },
      speed: {
        x: 0,
        y: -10
      },
      gameView: this.view
    }));
  }
}