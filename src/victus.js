/*
  victus.js
  copyright (c) 2021 sporeball
  MIT license
*/

!function() {
  var canvas, ctx, w, h, color, l, t;
  var p = Math.PI;
  var O = Object;

  /**
   * Primitive class. Most other primitives are derived from this class.
   *
   * @param x - X-coordinate of the primitive.
   * @param y - Y-coordinate of the primitive.
   * @param w - Width of the primitive.
   * @param h - Height of the primitive.
   */
  class Primitive {
    constructor(x, y, w, h, obj) {
      t = this;
      t.x = x;
      t.y = y;
      t.w = w;
      t.h = h;
      t.xv = t.yv = t.rotation = 0;
      t.anchorX = t.w / 2;
      t.anchorY = t.h / 2;
      t.hidden = false;
      t.setProps(obj);
    }

    moveTo(x, y) {
      this.x = x;
      this.y = y;
    }

    moveBy(x, y) {
      this.x += x;
      this.y += y;
    }

    anchor(x, y) {
      this.anchorX = x;
      this.anchorY = y;
    }

    hide() {
      this.hidden = true;
    }

    show() {
      this.hidden = false;
    }

    setProps(obj) {
      Object.assign(this, obj);
    }

    clone(obj) {
      let o = c(this);
      o.setProps(obj);
      return o;
    }

    draw() {
      // Alias this.
      t = this;

      // Move the object according to its velocity.
      t.moveBy(t.xv, t.yv);

      // Update the object's internal anchor point.
      let ax = t.x + t.anchorX;
      let ay = t.y + t.anchorY;

      // Transform the canvas.
      ctx.save();
      ctx[c="translate"](ax, ay);
      ctx.rotate(t.rotation * (p / 180));
      ctx[c](-ax, -ay);

      // Draw the object.
      if (!t.hidden) t._();

      // Undo the transformation.
      ctx.restore();
    }
  }

  /**
   * Rect class.
   *
   * @param x - X-coordinate of the rect.
   * @param y - Y-coordinate of the rect.
   * @param w - Width of the rect.
   * @param h - Height of the rect.
   * @param col - The color to use when drawing.
   */
  class Rect extends Primitive {
    constructor(x, y, w, h, col, obj) {
      super(x, y, w, h, obj);
      this.col = col;
    }

    _() {
      k(t.x, t.y, t.w, t.h, t.col);
    }
  }

  /**
   * Ellipse class.
   *
   * @param x - X-coordinate of the ellipse.
   * @param y - Y-coordinate of the ellipse.
   * @param w - Width of the ellipse.
   * @param h - Height of the ellipse.
   * @param col - The color to use when drawing.
   */
  class Ellipse extends Primitive {
    constructor(x, y, w, h, col, obj) {
      super(x, y, w, h, obj);
      this.col = col;
    }

    _() {
      ctx.fillStyle = t.col;
      ctx.beginPath();
      ctx.ellipse(t.x, t.y, t.w, t.h, 0, 0, 2 * p);
      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * Sprite class.
   *
   * @param spr - Path to the sprite.
   * @param x - X-coordinate of the sprite.
   * @param y - Y-coordinate of the sprite.
   */
  class Sprite extends Primitive {
    constructor(spr, x, y, w, h, obj) {
      super(x, y, w, h, obj);
      this.d = new Image;
      this.d.src = spr;
    }

    _() {
      ctx.drawImage(t.d, t.x, t.y, t.w, t.h);
    }
  }

  /**
   * Text class.
   *
   * @param str - The string to draw.
   * @param x - X-coordinate of the object.
   * @param y - Y-coordinate of the object.
   * @param size - The size of the text, in px.
   * @param col - Text color.
   * @param font - The font to use when drawing.
   * @param align - The text alignment to use when drawing.
   */
  class Text extends Primitive {
    constructor(str, x, y, size = 16, col = "#000", font = "Arial", align = "left") {
      super(x, y);
      t = this;
      t.str = str;
      t.size = size;
      t.col = col;
      t.font = font;
      t.align = align;
    }

    _() {
      ctx.fillStyle = t.col;
      ctx.font = t.size + "px " + t.font;
      ctx.textAlign = t.align;
      ctx.fillText(t.str, t.x, t.y);
    }
  }

  /**
   * Sound class.
   *
   * @param snd - Path to the audio file.
   * @param vol - The volume to play the sound at.
   * @param loop - Whether to loop the sound.
   */
  class Sound {
    constructor(snd, vol, loop=0) {
      t = this;
      t.vol = vol;

      // audio data
      t.d = new Audio(snd);
      t.d.loop = loop;
    }

    reset() {
      this.d.load();
    }

    play() {
      t = this;
      t.reset();
      t.d.volume = t.vol;
      t.d.play();
    }

    pause() {
      this.d.pause();
    }
  }

  // keyboard object
  var keys = {
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown"
  }

  // loop over each letter of the alphabet to quickly add the rest of the keys
  l = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  [...l].map(c => keys[c] = "Key" + c);

  // mouse object
  var mouse = {
    x: 0,
    y: 0,
    click: 0,
    held: 0
  };
  document.onmousemove = e => {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
  }
  document.onmousedown = e => {
    if (e.which == 1) {
      if (!mouse.held) {
        mouse.click = true;
      }
      mouse.held = true;
    }
  }
  document.onmouseup = e => {
    if (e.which == 1) {
      mouse.held = false;
    }
  }

  // clone an object
  c = parent => {
    let child = O.create(parent);

    for (i in parent) {
      child[i] = parent[i];
    }

    return child;
  }

  k = (x=0, y=0, a=w, b=h, c=color) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, a, b);
  }

  // expose ctx
  x=y=>ctx;

  this.victus = {
    setup: obj => {
      canvas = document.getElementById(obj.id);
      ctx = canvas.getContext("2d");

      w = canvas.width = obj.w;
      h = canvas.height = obj.h;

      color = obj.color || "#fff";
    },
    Rect: Rect,
    Ellipse: Ellipse,
    Sprite: Sprite,
    Text: Text,
    Sound: Sound,
    clear: k,
    keys: keys,
    mouse: mouse
  };
}();
