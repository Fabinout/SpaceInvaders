window.onload = function () {
  new Game("screen");
};

let Game = function (canvasId) {
  let canvas = document.getElementById(canvasId);
  let screen = canvas.getContext("2d");
  this.gameSize = {x: canvas.width, y: canvas.height};
  this.player = new Player(this.gameSize, this);
  this.bodies = [this.player];

  this.generateEnnemies();

  let self = this;
  let tick = function () {
    screen.clearRect(0, 0, self.gameSize.x, self.gameSize.y);
    self.update();
    self.draw(screen);
    if (self.bodies.filter(x=> x instanceof Player).length ===1) {
      requestAnimationFrame(tick);
    }
  }
  tick();
}

Game.prototype = {
  draw: function (screen) {
    this.bodies.forEach(x => x.draw(screen));
  },
  update: function () {
    this.bodies = this.bodies.filter(x => (x.center.y < this.gameSize.y && x.center.y > 0));
    this.bodies.forEach(x => x.update());
    let bodies = this.bodies;
    let notCollidingWithAnything = function (b1) {
      return bodies.filter(function (b2) {
        function notColliding(b1, b2) {
          return (b1 === b2) ||
              b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
              b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
              b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
              b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2 ||
              (b1 instanceof Bullet && b2 instanceof Bullet)
        }

        return !notColliding(b1, b2);
      }).length === 0;
    };
    this.bodies = this.bodies.filter(notCollidingWithAnything);
  },

  generateEnnemies: function () {
    for (let i = 0; i < 24; i++) {
      let center = {x: 20 + 20 * (i % 8), y: 20 + 20 * (i % 3)}
      this.bodies.push(new Invader(center, this));
    }
  },
  invaderBelow: function (invader) {
    let invaders = this.bodies.filter(x => x instanceof Invader);
    return invaders.filter(friend =>
        (friend !== invader) &&
        (friend.center.y > invader.center.y) &&
        Math.abs(friend.center.x - invader.center.x) < invader.size.x
        ).length > 0;
  }
}


let Player = function (gameSize, game) {
  this.game = game;
  this.size = {x: 20, y: 20};
  this.gameSize = gameSize
  this.center = {x: this.gameSize.x / 2, y: this.gameSize.y - this.size.y / 2};

  this.keyboard = new Keyboard();
}

function drawBody(screen, center, size) {
  screen.fillRect(
      center.x - size.x / 2,
      center.y - size.y / 2,
      size.x,
      size.y);
}

Player.prototype = {
  draw: function (screen) {
    drawBody(screen, this.center, this.size);
  },
  update: function () {
    if (this.keyboard.right()) {
      this.center.x = Math.min(this.center.x + 4
          , this.gameSize.x - this.size.x / 2);
    } else {
      if (this.keyboard.left()) {
        this.center.x = Math.max(this.center.x - 4, this.size.x / 2);
      }
    }
    if (this.keyboard.space()) {
      this.shoot();
    }
  },
  shoot: function () {
    let yspeed = -6;
    let center = {x: this.center.x, y: this.center.y - 20};
    this.game.bodies.push(new Bullet(center, yspeed));
  }
}

let Keyboard = function () {
  let keystate = {};
  window.onkeydown = function (ev) {
    keystate[ev.code] = true;
  };
  window.onkeyup = function (ev) {
    keystate[ev.code] = false;
  };

  this.right = function () {
    return keystate["ArrowRight"] === true;
  };
  this.left = function () {
    return keystate["ArrowLeft"] === true;
  };
  this.space = function () {
    return keystate["Space"] === true;
  }
}

let Invader = function (center, game) {
  this.game = game;
  this.center = center;
  this.size = {x: 10, y: 10};
}
Invader.prototype = {
  draw: function (screen) {
    drawBody(screen, this.center, this.size);
  },
  xspeed: 0,
  xpos: 0,
  update: function () {
    if (this.xpos <= 0) {
      this.xspeed = 2;
    } else {
      if (this.xpos > 140) {
        this.xspeed = -2;
      }
    }
    this.center.x += this.xspeed;
    this.xpos += this.xspeed;

    if (Math.random() > 0.97 && ! this.game.invaderBelow(this)) {
      this.shoot();
    }
  },
  shoot: function () {
    let center = {x: this.center.x, y: this.center.y + 10};
    this.game.bodies.push(new Bullet(center, 4, (Math.random()-0.5)*3));
  }
}

let Bullet = function (center, yspeed, xspeed = 0) {
  this.center = center;
  this.yspeed = yspeed;
  this.xspeed = xspeed;
  this.size = {x: 2, y: 4}
}
Bullet.prototype = {
  draw: function (screen) {
    drawBody(screen, this.center, this.size);
  },
  update: function () {
    this.center.y += this.yspeed;
    this.center.x += this.xspeed;
  }
}
