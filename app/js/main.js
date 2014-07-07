var D2R = Math.PI / 180;
var R2D = 180 / Math.PI;

function GLApplication () {
  this.canvas = this.initCanvas('gl');
  var gl = this.gl = this.initGL(this.canvas);

  if(!this.gl) {
    alert('Could not initialize WebGL');
    return;
  }

  window.addEventListener('resize', this.handleViewportResize.bind(this));
  this.handleViewportResize();

  this._el = this.cacheDOMElements();

  this.timeLast = Date.now();

  // Initial animation values
  this.pView = [0.0, 0.0, -15.0];
  this.pTip = 0;
  this.pTilt = 0;

  // Create some matrices
  this.vMatrix = mat4.create();
  this.pMatrix = mat4.create();
  this.mvMatrix = mat4.create();

  this.normalMatrix = mat3.create();
  this.normalizedLD = vec3.create();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  this.shaderProgram = this.initShaders();
  this.texture = this.initTexture();
  this.objects = this.initObjects({numStars: 50});

  this.pressedKeys = {};
  this.listenForKeyEvents();

  this.tick = function () {
    requestAnimationFrame(this.tick);
    this.drawScene();
    this.handleDownKeys();
    this.timeLast = this.animate();
  }.bind(this);

  window.GL = this;
  this.tick();
}

GLApplication.prototype.initObjects = function (opts) {
  var objects = [];
  var star;
  var twinkle = this._el.twinkle;
  for(var i=0; i!==opts.numStars; i++) {
    star = new Star({
      startingDistance: (i / opts.numStars) * 5.0,
      rotationSpeed: i / opts.numStars,
      twinkle: twinkle,
      texture: this.texture,
      spinOffset: i / 10
    });
    star.init(this.gl);
    objects.push(star);
  }
  return objects;
};

GLApplication.prototype.updateViewMatrix = function () {
  // Set view position
  mat4.identity(this.vMatrix);
  mat4.translate(this.vMatrix, this.vMatrix, this.pView);
  mat4.rotate(this.vMatrix, this.vMatrix, this.pTip, [1.0, 0.0, 0.0]);
  mat4.rotate(this.vMatrix, this.vMatrix, this.pTilt, [0.0, 1.0, 0.0]);
};

GLApplication.prototype.handleViewportResize = function () {
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  this.gl.viewportWidth = this.canvas.width;
  this.gl.viewportHeight = this.canvas.height;
};

GLApplication.prototype.cacheDOMElements = function () {
  return {
    twinkle: document.getElementById('twinkle'),
  };
};

var KEY_CODE = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39
};

GLApplication.prototype.listenForKeyEvents = function () {
  var ignoreKeys = [37, 38, 39, 40];
  window.addEventListener('keydown', function (e) {
    this.pressedKeys[e.keyCode] = true;

    if(ignoreKeys.indexOf(e.keyCode) !== -1) {
      e.preventDefault();
    }
  }.bind(this));

  window.addEventListener('keyup', function (e) {
    this.pressedKeys[e.keyCode] = false;
  }.bind(this));
};

GLApplication.prototype.handleDownKeys = function () {
  // WASD
  if(this.pressedKeys[KEY_CODE.W]) {
    this.pView[2] += 0.5;
  }
  if(this.pressedKeys[KEY_CODE.A]) {
    this.pView[0] += 0.5;
  }
  if(this.pressedKeys[KEY_CODE.S]) {
    this.pView[2] -= 0.5;
  }
  if(this.pressedKeys[KEY_CODE.D]) {
    this.pView[0] -= 0.5;
  }

  // PAGE UP/DOWN
  if(this.pressedKeys[KEY_CODE.PAGE_UP]) {
    this.pView[1] -= 0.5;
  }
  if(this.pressedKeys[KEY_CODE.PAGE_DOWN]) {
    this.pView[1] += 0.5;
  }

  // Arrow keys (tip/tilt)
  if(this.pressedKeys[KEY_CODE.ARROW_UP]) {
    this.pTip += 0.1;
  }
  if(this.pressedKeys[KEY_CODE.ARROW_DOWN]) {
    this.pTip -= 0.1;
  }
  if(this.pressedKeys[KEY_CODE.ARROW_LEFT]) {
    this.pTilt += 0.1;
  }
  if(this.pressedKeys[KEY_CODE.ARROW_RIGHT]) {
    this.pTilt -= 0.1;
  }
};

GLApplication.prototype.initCanvas = function (id) {
  var canvas = document.getElementById(id);
  canvas.width = window.innerHeight;
  canvas.height = window.innerWidth;
  return canvas;
};

GLApplication.prototype.initGL = function (canvas) {
  var gl = canvas.getContext('webgl') ||
    canvas.getContext('experimental-webgl');

  if(!gl) {
    return null;
  }

  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  return gl;
};

GLApplication.prototype.animate = function animate () {
  var timeNow = Date.now();
  var elapsed = timeNow - this.timeLast;
  for(var i=0; i!==this.objects.length; i++) {
    this.objects[i].animate(elapsed);
  }
  return timeNow;
};

GLApplication.prototype.initTexture = function initTexture () {
  var texture = this.gl.createTexture();
  var image = new Image();
  image.onload = function () {
    this.handleLoadedTexture(texture, image);
  }.bind(this);

  image.src = '/img/star.gif';
  return texture;
};

GLApplication.prototype.handleLoadedTexture =
  function handleLoadedTexture (texture, image) {

  var gl = this.gl;
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  // Mip map
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);

  gl.bindTexture(gl.TEXTURE_2D, null);
};

GLApplication.prototype.drawScene = function() {
  var gl = this.gl;
  var shaderProgram = this.shaderProgram;

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Initialize perspective matrix
  var viewportAspectRatio = gl.viewportWidth / gl.viewportHeight;
  mat4.perspective(this.pMatrix, 45, viewportAspectRatio, 0.1, 100.0);

  // Handle any motion of the view port
  this.updateViewMatrix();

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.enable(gl.BLEND);

  for(var i=0; i!==this.objects.length; i++) {
    this.objects[i].draw(gl, shaderProgram, this.pMatrix, this.vMatrix);
  }
};

GLApplication.prototype.loadShader = function loadShader (source, type) {
  var gl = this.gl;
  var shader;

  // Create and compile shader
  shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // Check success
  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
};

GLApplication.prototype.initShaders = function initShaders () {
  var gl = this.gl;
  var fragmentShader = this.getShader('fragment/fragment');
  var vertexShader = this.getShader('vertex/vertex');

  var shaderProgram = gl.createProgram();

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Could not initialize shaders');
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute =
    gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.textureCoordAttribute =
    gl.getAttribLocation(shaderProgram, 'aTextureCoord');
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

  shaderProgram.pMatrixUniform =
    gl.getUniformLocation(shaderProgram, 'uPMatrix');
  shaderProgram.mvMatrixUniform =
    gl.getUniformLocation(shaderProgram, 'uMVMatrix');
  shaderProgram.samplerUniform =
    gl.getUniformLocation(shaderProgram, 'uSampler');
  shaderProgram.colorUniform =
    gl.getUniformLocation(shaderProgram, 'uColor');

  return shaderProgram;
};

GLApplication.prototype.getShader = function getShader (path) {
  var gl = this.gl;
  var shaderSource = SHADERS[path];
  if(!shaderSource) {
    return void 0;
  }
  var shaderType = path.split('/')[0];

  var shaderTypeFlag;
  switch (shaderType) {
    case 'fragment':
      shaderTypeFlag = gl.FRAGMENT_SHADER;
      break;
    case 'vertex':
      shaderTypeFlag = gl.VERTEX_SHADER;
      break;
    default:
      return void 0;
  }

  var shader = gl.createShader(shaderTypeFlag);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
};


// Export main function
App.GLStart = function () {
  window.glApplication = new GLApplication();
};

