/*
 * Runstant
 * 思いたったらすぐ開発. プログラミングに革命を...
 */


phina.globalize();

var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 960;
var GRID_SIZE = 640;
var MAX_PER_LINE = 10; // パネルの一辺の最大数
var PANEL_SIZE = GRID_SIZE / MAX_PER_LINE - 4;
var PANEL_PADDING = PANEL_SIZE / 2 + 3;
var MAX_NUM = MAX_PER_LINE * MAX_PER_LINE;  // パネル総数
var MAX_BOMB_NUM = 25; // 爆弾の数

var TILE_APPEAR_ANIMATION = {
  // loop: true,
  tweens: [
    ['to', { rotation: 360 }, 500],
    ['set', { rotation: 0 }],
  ]
};


phina.define("MainScene", {
  superClass: 'DisplayScene',
  init: function () {
    this.superInit({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    });
    this.currentIndex = 1;
    this.group = DisplayElement().addChildTo(this);

    this.table = new Array(MAX_PER_LINE);
    for (let row = 0; row < MAX_PER_LINE; row++) {
      this.table[row] = new Array(MAX_PER_LINE).fill(0);
    }

    var gridX = Grid({
      width: GRID_SIZE,
      columns: MAX_PER_LINE,
      offset: PANEL_PADDING
    });
    var gridY = Grid({
      width: GRID_SIZE,
      columns: MAX_PER_LINE,
      offset: PANEL_PADDING + 150
    });

    var self = this;
    let bombs = Array.range(1, MAX_NUM + 1).shuffle().slice(0, MAX_BOMB_NUM);

    for (let row = 0; row < MAX_PER_LINE; row++) {
      for (let col = 0; col < MAX_PER_LINE; col++) {

        let index = row * MAX_PER_LINE + col + 1;
        let isBombs = false;
        if (bombs.includes(index)) {
          isBombs = true;
          this.table[col][row] = true;
        }

        var t = Tile(col, row, isBombs).addChildTo(self.group);
        t.x = gridX.span(col);
        t.y = gridY.span(row);
        t.onpointstart = function () {
          self.check(this);
        };
        t.appear();
      }
    }
  },
  onenter: function () {
    var scene = CountScene({
      backgroundColor: 'rgba(100, 100, 100, 1)',
      count: ['Ready'],
      fontSize: 100,
    });
    this.app.pushScene(scene);
  },
  update: function (app) {

  },
  check: function (tile) {

    // パネル周囲の爆弾数取得
    let cnt = this.getBombsCount(tile.col, tile.row);

    if (this.table[tile.col][tile.row]) {
      tile.text = 'BOMB!';
      tile.fill = 'red';
      // this.exit({
      //     score: tile.index,
      //   });
    } else {
      tile.fill = 'gray';
      tile.text = cnt;

    }
  },

  getBombsCount: function (col, row) {
    let cnt = 0;
    if (this.hasTopPanel(row)) {
      if (this.hasLeftPanel(col) && this.table[col - 1][row - 1])
        cnt++;
      if (this.table[col][row - 1])
        cnt++;
      if (this.hasRightPanel(col) && this.table[col + 1][row - 1])
        cnt++;
    }
    if (this.hasLeftPanel(col) && this.table[col - 1][row])
      cnt++;
    if (this.hasRightPanel(col) && this.table[col + 1][row])
      cnt++;
    if (this.hasBottomPanel(row)) {
      if (this.hasLeftPanel(col) && this.table[col - 1][row + 1])
        cnt++;
      if (this.table[col][row + 1])
        cnt++;
      if (this.hasRightPanel(col) && this.table[col + 1][row + 1])
        cnt++;
    }
    return cnt;
  },

  hasTopPanel: function (row) {
    if (0 < row) {
      return true;
    } else {
      return false;
    }
  },

  hasBottomPanel: function (row) {
    if (row < MAX_PER_LINE - 1) {
      return true;
    } else {
      return false;
    }
  },

  hasRightPanel: function (col) {
    if (col < MAX_PER_LINE - 1) {
      return true;
    } else {
      return false;
    }
  },

  hasLeftPanel: function (col) {
    if (0 < col) {
      return true;
    } else {
      return false;
    }
  }
});

phina.define('Tile', {
  superClass: 'Button',
  init: function (col, row, isBombs) {
    // 動作確認用
    let frameColor = 'blue';
    if (isBombs) {
      frameColor = 'red';
    }

    this.superInit({
      width: PANEL_SIZE,
      height: PANEL_SIZE,
      // text: col + ':' + row,
      text: '',
      fontSize: 15,
      stroke: frameColor,
    });
    this.col = col;
    this.row = row;
  },
  appear: function () {
    this.tweener
      .clear()
      .fromJSON(TILE_APPEAR_ANIMATION);
  },
});

phina.main(function () {
  var app = GameApp({
    startLabel: location.search.substr(1).toObject().scene || 'title',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    startLabel: 'title',
  });
  app.enableStats();
  app.run();
});
