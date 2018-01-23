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
    await W(this.page.waitFor('input[name="username"]'));
    await W(this.page.type('input[name="username"]', name));
    await W(this.page.click('button[type="submit"]'));
  }

  async chooseColor(color) {
    console.log(`choosing color ${color}...`);
    this.color = color;
    const buttonSelector = `.btn-${color}`;
    await this.page.waitFor(200);
    await W(this.page.waitFor(buttonSelector));
    await W(this.page.click(buttonSelector));
    await W(this.page.waitFor((selector) => {
      return document.querySelector(selector).innerText.includes('leave');
    }, {}, buttonSelector));
  }

  async move(from, to) {
    console.log(`moving from ${from} to ${to}...`);
    await this.page.waitFor(800);
    const fromElem = await this.getSquare(from);
    const fromBox = await W(fromElem.boundingBox());
    const toElem = await this.getSquare(to);
    const toBox = await W(toElem.boundingBox());

    await W(this.page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2));
    await W(this.page.mouse.down());
    await W(this.page.mouse.move(toBox.x + toBox.width / 2, toBox.y + toBox.height / 2));

    await W(this.page.screenshot({ path: `${this.color}-${from}.png`, clip: {
        x: Math.min(fromBox.x, toBox.x) - toBox.width,
        y: Math.min(fromBox.y, toBox.y) - toBox.height,
        width: Math.max(fromBox.x, toBox.x) - Math.min(fromBox.x, toBox.x) + 3 * toBox.width,
        height: Math.max(fromBox.y, toBox.y) - Math.min(fromBox.y, toBox.y) + 3 * toBox.height
      }
    }));

    await W(this.page.mouse.up());
  }

  async getSquare(notation) {
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const col = cols.indexOf(notation[0]);
    const row = parseInt(notation[1], 10);
    return W(this.page.$(`.board > div:nth-of-type(${(8 - row) * 8 + 1 + col})`));
  }

  async hasTurn() {
    console.log(`${this.color} has a turn...`);
    const buttonSelector = `.btn-${this.color}.active`;
    await W(this.page.waitFor(buttonSelector));
  }

  async wins() {
    return W(this.page.waitFor(`#${this.color}.winning`));
  }

  async loses() {
    return W(this.page.waitFor(`#${this.color}.losing`));
  }
}

describe('fools mate', () => {
  let white;
  let black;
  it('can be played', async () => {
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

    await white.loses();
    await black.wins();
  }, 10000);
  afterEach(async () => {
    if (white.page) {
      await white.page.screenshot({ path: 'white.png' });
    }
    if (black.page) {
      await black.page.screenshot({ path: 'black.png' });
    }
  });
});

function wrapPromiseInTimeout(promise) {
  const possibleError = new Error('timeout');
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
