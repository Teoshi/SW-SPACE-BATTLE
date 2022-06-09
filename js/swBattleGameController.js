"use strict";
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