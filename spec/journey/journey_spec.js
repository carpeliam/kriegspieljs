const puppeteer = require('puppeteer');

const W = wrapPromiseInTimeout;
class Player {
  async visitHomepage() {
    console.log('visiting homepage...');
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1600, height: 1200 });
    await this.page.goto('http://localhost:8124');
  }

  async setUsername(name) {
    console.log(`setting username to ${name}...`);
    // await this.page.waitFor('input#handle');
    // await this.page.type('input#handle', name);
    // await this.page.click('.ui-dialog-buttonpane button');
    await W(this.page.waitFor('input[name="username"]'));
    await W(this.page.type('input[name="username"]', name));
    await W(this.page.click('.modal-footer button'));
  }

  async chooseColor(color) {
    console.log(`choosing color ${color}...`);
    this.color = color;
    // const buttonSelector = `#${color}`;
    const buttonSelector = `.btn-${color}`;
    await W(this.page.waitFor(buttonSelector));
    await W(this.page.click(buttonSelector));
  }

  async move(from, to) {
    console.log(`moving from ${from} to ${to}...`);
    await this.page.waitFor(800);
    const fromElem = await this.getSquare(from);
    const fromBox = await fromElem.boundingBox();
    const toElem = await this.getSquare(to);
    const toBox = await toElem.boundingBox();

    await this.page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height / 2);

    await this.page.screenshot({ path: `${this.color}-${from}.png`, clip: {
        x: Math.min(fromBox.x, toBox.x),
        y: Math.min(fromBox.y, toBox.y),
        width: Math.max(fromBox.x, toBox.x) - Math.min(fromBox.x, toBox.x) + toBox.width,
        height: Math.max(fromBox.y, toBox.y) - Math.min(fromBox.y, toBox.y) + toBox.height
      }
    });

    await this.page.mouse.up();
  }

  async getSquare(notation) {
    const rows = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const row = rows.indexOf(notation[0]);
    const col = parseInt(notation[1], 10);
    // return await this.page.$(`.board :nth-child(${8 * row + col})`);
    return await this.page.$(`#board tr:nth-child(${8 - col + 1}) td:nth-child(${row + 1})`);
  }

  async hasTurn() {
    console.log(`${this.color} has a turn...`);
    const buttonSelector = `.btn-${this.color}.active`;
    await W(this.page.waitFor(buttonSelector));
  }

  async hasWon() {
    if (this.color == 'white') {
      return await this.page.evaluate(() => document.querySelector('#white').classList.contains('winning'));
    }
    return await this.page.evaluate(() => document.querySelector('#black').classList.contains('winning'));
    // return await this.page.evaluate((color) => document.querySelector(`#${color}`).classList.contains('winning'), this.color);
  }

  async hasLost() {
    if (this.color == 'white') {
      return await this.page.evaluate(() => document.querySelector('#white').classList.contains('losing'));
    }
    return await this.page.evaluate(() => document.querySelector('#black').classList.contains('losing'));
    // return await this.page.evaluate((color) => document.querySelector(`#${color}`).classList.contains('losing'), this.color);
  }
}

describe('fools mate', () => {
  let white;
  let black;
  beforeEach(() => {
    jasmine.getEnv().defaultTimeoutInterval = 5000;
  });
  it('can be played', SX(async () => {
    white = new Player();
    black = new Player();

    await white.visitHomepage();
    await black.visitHomepage();

    await white.setUsername('Bobby');
    await black.setUsername('Gary');

    await white.chooseColor('white');
    await black.chooseColor('black');

    await white.hasTurn();
    await white.move('f2', 'f3');
    await black.hasTurn();
    await black.move('e7', 'e5');
    await white.hasTurn();
    await white.move('g2', 'g4');
    await black.hasTurn();
    await black.move('d8', 'h4');

    await white.page.waitFor('#white.losing');
    await black.page.waitFor('#black.winning');

    await white.page.screenshot({ path: 'white.png' });
    await black.page.screenshot({ path: 'black.png' });

    // success!!
  }));
  afterEach(async () => {
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
      console.log('error', e);
      reject(e);
      clearTimeout(timeoutID);
    });
  });
}

function SX(fun) {
  return done => fun().then(done).catch(done.fail);
}
