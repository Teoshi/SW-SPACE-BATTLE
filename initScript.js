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

//класс для описания космического монстра
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

  //при выстреле новый снаряд добавляется в массив снарядов монстров
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
      window.removeEventListener

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

//View
class GameView {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.context = this.canvas.getContext('2d');

    this.backgroundMusicAudio = new Audio('./audio/Star_Wars_Imperial_March.mp3');
    this.backgroundMusicAudio.loop = true;
    this.shipShootAudio = new Audio('./audio/Laser_V100.mp3');
    this.shipExplAudio = new Audio('./audio/x-wing_boom.mp3');
    this.invaderExplAudio = new Audio('./audio/tie_fighter_boom.mp3');
    this.invaderShootAudio = new Audio('./audio/tie_shot_V100.mp3');

    this.modalMainEl = document.querySelector('#modalEl');
    this.modalGameEl = document.querySelector('#modalGameEl');
    this.modalRecordEl = document.querySelector('#modalRecordEl');
    this.bigScoreEl = document.querySelector('#bigScoreEl');
    this.scoresContainerEl = document.querySelector('#scoresContainer');
    this.playerNameEl = document.querySelector('#playerId');
    this.errorSpanEl = document.querySelector('#IErrorSpan');
    this.scoreEl = document.querySelector('#scoreEl');
    this.buttonsPhone = document.querySelector('.buttonsPhone');
  }

  gameModel;
  initModel(model) {
    let self = this;
    this.gameModel = model;

    //для ограничения частоты обработки событий
    let limFuncHandler = function(func, interval, immediate) {
      let timer;
      return function() {
        let cont = self, args = arguments;
        let later = function() {
          timer = null;
          if (!immediate)
            func.apply(cont, args);
        };
        let callNow = immediate && !timer;
        clearTimeout(timer);
        timer = setTimeout(later, interval);
        if (callNow)
          func.apply(cont, args);
      };
    };

    //при изменении размеров экрана перестраиваем игру сначала
    let resizeHandler = function() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      if (this.gameModel && !this.gameModel.state.over) {
        this.gameModel.init({
          playerName: this.gameModel.player.playerName,
          playMusic: this.gameModel.playMusic
        });
        this.scoreEl.innerHTML = 0;
      }
    };
    window.addEventListener('resize', limFuncHandler(resizeHandler, 1000, false));
  }

  drawNewState(state) {
    switch (state) {
      case 'main':
        this.modalGameEl.style.display = 'none';
        this.modalRecordEl.style.display = 'none';
        this.modalMainEl.style.display = 'flex';
        this.scoresContainerEl.style.display = 'none';
        this.buttonsPhone.style.display = 'none';
        this.backgroundMusicAudio.pause();
        break;
      case 'game':
        this.modalMainEl.style.display = 'none';
        this.modalRecordEl.style.display = 'none';
        this.scoresContainerEl.style.display = '';
        this.scoreEl.innerHTML = 0;
              //////
        if (this.canvas.width < 900 ) {
          this.buttonsPhone.style.display = 'flex';
          this.buttonsPhone.style.flexDirection = 'row';
          this.buttonsPhone.style.justifyContent = 'space-around';
          this.buttonsPhone.style.width = '100%';
          this.buttonsPhone.style.position = 'absolute';
          this.buttonsPhone.style.top = '90%';
          this.buttonsPhone.style.display = '50%';
          this.buttonsPhone.style.transform = 'translateY(-50%)';
          this.buttonsPhone.style.zindex = '1000000';
        } else {
          this.buttonsPhone.style.display = 'none';
        }
        break;
      case 'records':
        this.modalMainEl.style.display = 'none';
        this.modalGameEl.style.display = 'none';
        this.scoresContainerEl.style.display = 'none';
        this.modalRecordEl.style.display = 'block';
        this.backgroundMusicAudio.pause();
        break;
      default:
        break;
    }
  }

  playBackgroundMusic() {
    if (this.gameModel.playMusic) {
      this.backgroundMusicAudio.play();
      this.backgroundMusicAudio.volume = 0.5;
    }
  }

  platShipExplSound() {
    if (this.gameModel.playMusic) {
      this.shipExplAudio.play();
      this.shipExplAudio.volume = 0.5;
    };
  }

  endGame() {
    if (this.gameModel.spaState === 'game') {
      setTimeout(() => {
        this.modalGameEl.style.display = 'flex';
        this.bigScoreEl.innerHTML = this.gameModel.score;
        if (this.gameModel.playMusic) {
          this.backgroundMusicAudio.pause();
        }
      }, 2000);
    }
  }

  drawCanvas() {
    setTimeout(() => {
      this.context.fillStyle = 'black';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }, 0);
  }

  drawPlayer(player) {
    this.context.save();
    this.context.globalAlpha = player.opacity;
    //перемещаем центр координат в центр корабля для маневра
    this.context.translate(player.position.x + player.width / 2, player.position.y + player.height / 2);
    this.context.rotate(player.rotation);

    //после маневра корабля возвращаем центр координат в исходную точку
    this.context.translate(-player.position.x - player.width / 2, -player.position.y - player.height / 2);
    this.context.drawImage(
      player.image,
      player.position.x,
      player.position.y,
      player.width,
      player.height);

    this.context.restore();
  }

  drawInvader(invader) {
    this.context.drawImage(
      invader.image,
      invader.position.x,
      invader.position.y,
      invader.width,
      invader.height);
  };

  drawBullet(bullet) {
    this.context.beginPath();
    this.context.arc(bullet.position.x, bullet.position.y, bullet.radius, 0, Math.PI * 2);
    this.context.fillStyle = 'red';
    this.context.fill();
    this.context.closePath();
  }

  drawTfShot(invaderBullet) {
    this.context.fillStyle = 'green';
    this.context.fillRect(invaderBullet.position.x, invaderBullet.position.y,
      invaderBullet.width, invaderBullet.height);
    this.context.closePath();
  }

  drawParticle(particle) {
    this.context.save();
    this.context.globalAlpha = particle.opacity;
    this.context.beginPath();
    this.context.arc(particle.position.x, particle.position.y, particle.radius, 0, Math.PI * 2);
    this.context.fillStyle = particle.color;
    this.context.fill();
    this.context.closePath();
    this.context.restore();
  }

  createBulletSound() {
    if (this.gameModel.playMusic) {
      this.shipShootAudio.play();
      this.shipShootAudio.volume = 0.3;
    }
  }

  updateScore(score) {
    this.scoreEl.innerHTML = score;
  }

  playInvaderExplSound() {
    if (this.gameModel.playMusic) {
      this.invaderExplAudio.play();
      this.invaderExplAudio.currentTime = 0;
      this.invaderExplAudio.volume = 0.4;
    }
  }

  playInvaderShootSound() {
    if (this.gameModel.playMusic) {
      this.invaderShootAudio.play();
      this.invaderShootAudio.volume = 0.3;
      this.invaderShootAudio.currentTime = 0;
    }
  }

  showRecordTable(hashArray) {
    this.closeRecordTable();
    this.modalRecordEl.style.display = '';
    this.modalMainEl.style.display = 'none';
    this.modalGameEl.style.display = 'none';

    let tableEl = document.createElement('table');
    tableEl.className = 'table';
    tableEl.style.display = 'table';
    tableEl.style.color = 'gold';
    // tableEl.style.border = 'solid';
    tableEl.style.borderCollapse = 'collapse';
    tableEl.style.borderColor = 'gold';
    tableEl.style.width = '100%';
    tableEl.style.verticalAlign = 'top';
    tableEl.style.textAlign = 'center';
    tableEl.style.lineHeight = '1.5';
    tableEl.style.fontSize = '15px';

    this.modalRecordEl.appendChild(tableEl);

    let theadEl = document.createElement('thead');
    let trHeadEl = document.createElement('tr');
    let th1El = document.createElement('th');
    th1El.innerHTML = '#';
    let thPlayerEl = document.createElement('th');
    thPlayerEl.innerHTML = 'Player';
    let thScoreEl = document.createElement('th');
    thScoreEl.innerHTML = 'Score';
    trHeadEl.appendChild(th1El);
    trHeadEl.appendChild(thPlayerEl);
    trHeadEl.appendChild(thScoreEl);
    theadEl.appendChild(trHeadEl);

    tableEl.appendChild(theadEl);

    let tbodyEl = document.createElement('tbody');
    hashArray.forEach((v, i, a) => {
      let trBodyEl = document.createElement('tr');
      let tdNumber = document.createElement('td');
      tdNumber.innerHTML = i + 1;
      let tdPlayer = document.createElement('td');
      tdPlayer.innerHTML = escapeHTML(v.player);
      let tdScore = document.createElement('td');
      tdScore.innerHTML = v.scores;
      trBodyEl.appendChild(tdNumber);
      trBodyEl.appendChild(tdPlayer);
      trBodyEl.appendChild(tdScore);
      tbodyEl.appendChild(trBodyEl);
    });
    tableEl.appendChild(tbodyEl);

    function escapeHTML(text) {
      if (!text)
        return text;
      text = text.toString()
        .split("&").join("&amp;")
        .split("<").join("&lt;")
        .split(">").join("&gt;")
        .split('"').join("&quot;")
        .split("'").join("&#039;");
      return text;
    }
  }

  closeRecordTable() {
    let recordTableEl = this.modalRecordEl.getElementsByClassName('table')[0];
    if (recordTableEl) {
      this.modalRecordEl.removeChild(recordTableEl);
    }
  }
}

//Controller
class GameController {
  constructor(gameModel) {
    this.model = gameModel;

    this.keys = {
      arrowLeft: {
        pressed: false
      },
      arrowRight: {
        pressed: false
      },
      space: {
        pressed: false
      }
    };

    this.timerSet = false;
    this.playerName = '';
    this.scoresContainerEl = document.querySelector('#scoresContainer');
    this.scoreEl = document.querySelector('#scoreEl');

    this.modalMainEl = document.querySelector('#modalEl');
    this.modalGameEl = document.querySelector('#modalGameEl');
    this.modalRecordEl = document.querySelector('#modalRecordEl');

    this.playerNameEl = document.querySelector('#playerId');
    this.errorSpanEl = document.querySelector('#IErrorSpan');

    this.startGameBtn = document.querySelector('#startGameBtn');
    this.nextGameBtn = document.querySelector('#nextGameBtn');
    this.returnBtn = document.querySelector('#returnBtn');
    this.recordTableBtn = document.querySelector('#recordTableBtn');
    this.modalRecordCloseBtn = document.querySelector('#modalRecordCloseBtn');
    this.musicSwitchEl = document.querySelector('#gameMusicSwitch');
  }

  frames;
  randomInterval;

  start() {
    this.switchToStateFromURLHash();
    //подписываемся на событие запуска игры
    this.startGameBtn.addEventListener('click', () => {
      vibro();
      this.playerName = this.playerNameEl.value;
      if (this.playerName === '' || this.playerName === null) {
        this.errorSpanEl.innerHTML = 'Enter your name';
        this.errorSpanEl.style.display = 'block';
        return;
      }
      this.errorSpanEl.innerHTML = '';
      this.switchToSPAstate('game');
    });

    //подписываемся на событие запуска следующей игры
    this.nextGameBtn.addEventListener('click', () => {
      vibro();
      this.playerName = this.playerNameEl.value;
      this.scoreEl.innerHTML = 0;
      this.frames = 0;
      this.randomInterval = Math.floor(Math.random() * 500 + 500);

      this.modalGameEl.style.display = 'none';
      this.modalMainEl.style.display = 'none';

      this.model.init({
        playerName: this.playerName,
        playMusic: this.musicSwitchEl.checked
      });
    });

    //подписываемся на событие открытия таблицы рекордов
    this.recordTableBtn.addEventListener('click', () => {
      vibro();
      this.switchToSPAstate('records');
    });

    //подписываемся на событие закрытия таблицы рекордов
    this.modalRecordCloseBtn.addEventListener('click', () => {
      this.model.closeRecord();
      vibro();
      this.switchToSPAstate('main');
    });

    //подписываемся на событие возврата из таблицы рекордов в основное меню
    this.returnBtn.addEventListener('click', () => {
      this.modalGameEl.style.display = 'none';
      this.modalMainEl.style.display = 'none';
      this.scoresContainerEl.style.display = 'none';
      this.switchToSPAstate('main');
    });

    window.addEventListener('keydown', (EO) => {
      if (this.model.state.over) {
        return;
      }

      EO = EO || window.event;
      EO.preventDefault();

      let key = EO.code || EO.keyCode;
      if (key === EO.code) {

        switch (key) {
          case 'ArrowLeft':
            this.keys.arrowLeft.pressed = true;
            break;
          case 'ArrowRight':
            this.keys.arrowRight.pressed = true;
            break;
          case 'Space':
            this.keys.space.pressed = true;
            this.model.createBullet();
            vibro();
            break;
        }
      } else if (key === EO.keyCode) {

        switch (key) {
          case 37:
            this.keys.arrowLeft.pressed = true;
            break;
          case 39:
            this.keys.arrowRight.pressed = true;
            break;
          case 32:
            this.keys.space.pressed = true;
            this.model.createBullet();
            vibro();
            break;
        }
      }
    });

    window.addEventListener('touchstart', (EO) => {
      if (this.model.state.over) {
        return;
      }
      EO = EO || window.event;
      EO.preventDefault();

      if (EO.target.classList.contains("btn-left")) {
        this.keys.arrowLeft.pressed = true;
      }
      if (EO.target.classList.contains("btn-right")) {
        this.keys.arrowRight.pressed = true;
      }
      if (EO.target.classList.contains("btn-shot")) {
        this.keys.space.pressed = true;
        this.model.createBullet();
        vibro();
      }
      
    }, { passive: false });

    window.addEventListener('touchend', (EO) => {
      if (this.model.state.over) {
        return;
      }
      EO = EO || window.event;

      if (EO.target.classList.contains("btn-left")) {
        this.keys.arrowLeft.pressed = false;
      }
      if (EO.target.classList.contains("btn-right")) {
        this.keys.arrowRight.pressed = false;
      }
      if (EO.target.classList.contains("btn-shot")) {
        this.keys.space.pressed = false;
      }
      
    }, { passive: false });

    window.addEventListener('keyup', (EO) => {
      EO = EO || window.event;

      let key = EO.code || EO.keyCode;
      if (key === EO.code) {

        switch (key) {
          case 'ArrowLeft':
            this.keys.arrowLeft.pressed = false;
            break;
          case 'ArrowRight':
            this.keys.arrowRight.pressed = false;
            break;
          case 'Space':
            this.keys.space.pressed = false;
            break;
        }
      } else if (key === EO.keyCode) {

        switch (key) {
          case 37:
            this.keys.arrowLeft.pressed = false;
            break;
          case 39:
            this.keys.arrowRight.pressed = false;
            break;
          case 32:
            this.keys.space.pressed = false;
            break;
        }
      }
    });

    //подписываемся на событие изменения закладки URL
    window.addEventListener('hashchange', () => {
      this.switchToStateFromURLHash();
    });

    //подписываемся на событие закрытия/перезагрузки страницы
    window.addEventListener('beforeunload', (event) => {
      event = event || window.event;

      if (this.model.score > 0 && !this.model.state.over) {
        event.returnValue = 'Вы потеряете весь несохраненные прогресс.'
      }
    });
  };

  switchToSPAstate(newState) {
    location.hash = newState;
  }

  animate() {
    let RAF=
        // находим, какой requestAnimationFrame доступен
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        // ни один не доступен
        // будем работать просто по таймеру
        function(callback)
            { window.setTimeout(callback, 1000 / 60); }
        ;
    RAF(() => {
      this.animate();
    });

    if (!this.model.state.active) {
      //при неактивной игре продолжаем обновлять канвас в части звезд в космосе
      this.model.updateCanvas();
      this.model.updateParticles();
      return;
    }

    this.model.updateCanvas();
    this.model.player.update();
    this.model.updateParticles();
    this.model.updateTfShots();
    this.model.updateShots();
    this.model.updateGridTfighters(this.frames);

    if (this.keys.arrowLeft.pressed) {
      this.model.player.moveLeft();
    } else if (this.keys.arrowRight.pressed) {
      this.model.player.moveRight();
    } else {
      this.model.player.stop();
    }
    this.frames++;
  }

  switchToStateFromURLHash() {
    let URLHash = window.location.hash;
    let stateStr = URLHash.substr(1);
    if (stateStr === '') {
      stateStr = 'main';
    }

    switch (stateStr) {
      case 'main':
        this.model.init({
          playerName: this.playerName,
          playMusic: false
        });
        this.model.spaState = 'main';
        break;
      case 'game':
        this.model.init({
          playerName: this.playerName,
          playMusic: this.musicSwitchEl.checked
        });
        this.model.spaState = 'game';
        this.frames = 0;
        this.randomInterval = Math.floor(Math.random() * 500 + 500);
        if (!this.timerSet) {
          this.animate();
          this.timerSet = true;
        }
        break;
      case 'records':
        this.model.init({
          playerName: this.playerName,
          playMusic: false
        });
        this.model.spaState = 'records';
        break;
    }
  }
}

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