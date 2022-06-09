"use strict";
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