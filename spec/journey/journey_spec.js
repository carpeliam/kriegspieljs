const puppeteer = require('puppeteer');

const W = wrapPromiseInTimeout;

const host = process.env.CI_SERVER || 'http://localhost:8124';

class Player {
  async visitHomepage() {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1600, height: 1200 });
    await this.page.goto(host);
  }

  async setUsername(name) {
    await W(this.page.waitFor('input#handle'));
    await W(this.page.type('input#handle', name));
    await W(this.page.click('.ui-dialog-buttonpane button'));
    await W(this.page.waitFor(() => {
      const modal = document.querySelector('.ui-dialog');
      if (!modal) {
        return true;
      }
      const style = window.getComputedStyle(modal);
      return style && style.display === 'none';
    }));
    // await W(this.page.waitFor('input[name="username"]'));
    // await W(this.page.type('input[name="username"]', name));
    // await W(this.page.click('.modal-footer button'));
  }

  async chooseColor(color) {
    this.color = color;
    const buttonSelector = `#${color}`;
    // const buttonSelector = `.btn-${color}`;
    await this.page.waitFor(200);
    await W(this.page.waitFor(buttonSelector));
    await W(this.page.click(buttonSelector));
    await W(this.page.waitFor((selector) => {
      return document.querySelector(selector).innerText.includes('leave');
    }, {}, buttonSelector));
  }

  async move(from, to) {
    await this.page.waitFor(800);
    const fromElem = await W(this.getSquare(from));
    const fromBox = await W(fromElem.boundingBox());
    const toElem = await W(this.getSquare(to));
    const toBox = await W(toElem.boundingBox());

    await W(this.page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2));
    await W(this.page.mouse.down());
    await W(this.page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height / 2));

    await W(this.page.screenshot({ path: `${this.color}-${from}.png`, clip: {
        x: Math.min(fromBox.x, toBox.x),
        y: Math.min(fromBox.y, toBox.y),
        width: Math.max(fromBox.x, toBox.x) - Math.min(fromBox.x, toBox.x) + toBox.width,
        height: Math.max(fromBox.y, toBox.y) - Math.min(fromBox.y, toBox.y) + toBox.height
      }
    }));

    await W(this.page.mouse.up());
  }

  async getSquare(notation) {
    const rows = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const row = rows.indexOf(notation[0]);
    const col = parseInt(notation[1], 10);
    // return await W(this.page.$(`.board :nth-child(${8 * row + col})`));
    return await W(this.page.$(`#board tr:nth-child(${8 - col + 1}) td:nth-child(${row + 1})`));
  }

  async hasTurn() {
    const buttonSelector = `#${this.color}.active`;
    await W(this.page.waitFor(buttonSelector));
  }

  async wins() {
    return W(this.page.waitFor(`#${this.color}.winning`));
  }

  async loses() {
    return W(this.page.waitFor(`#${this.color}.losing`));
  }

  async standsUp() {
    const buttonSelector = `#${this.color}`;
    // const buttonSelector = `.btn-${color}`;
    await W(this.page.click(buttonSelector));
    await W(this.page.waitFor((selector) => {
      return document.querySelector(selector).innerText.includes('sit');
    }, {}, buttonSelector));
  }
}

describe('fools mate', () => {
  let white;
  let black;
  beforeEach(() => {
    jasmine.getEnv().defaultTimeoutInterval = 35000;
  });
  it('can be played', SX(async () => {
    white = new Player();
    black = new Player();

    await white.visitHomepage();
    await black.visitHomepage();

    await white.setUsername('Bobby');
    await black.setUsername('Frank');

    await white.chooseColor('white');
    await black.chooseColor('black');

    await white.hasTurn();
    await white.move('f2', 'f4');
    await black.hasTurn();
    await black.move('e7', 'e5');
    await white.hasTurn();
    await white.move('g2', 'g4');
    await black.hasTurn();
    await black.move('d8', 'h4');

    await white.loses();
    await black.wins();

    await white.standsUp();
    await black.standsUp();
  }));
  afterEach(async () => {
    if (white.page) {
      await white.page.screenshot({ path: 'white.png' });
    }
    if (black.page) {
      await black.page.screenshot({ path: 'black.png' });
    }
    if (white.browser) {
      await white.browser.close();
    }
    if (black.browser) {
      await black.browser.close();
    }
  });
});

function wrapPromiseInTimeout(promise) {
  const possibleError = new Error();
  return new Promise((resolve, reject) => {
    const timeoutID = setTimeout(() => reject(possibleError), 1000);
    promise.then((a) => {
      resolve(a);
      clearTimeout(timeoutID);
    }).catch((e) => {
      reject(e);
      clearTimeout(timeoutID);
    });
  });
}

function SX(fun) {
  return done => Promise.resolve(fun()).then(done).catch(done);
}
