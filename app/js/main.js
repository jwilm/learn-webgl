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

  this.timeLast = Date.now();

  // Initial animation values
  this.zPos = -5.0;
  this.xRot = 0;
  this.yRot = 0;

  this.xSpeed = 50;
  this.ySpeed = 50;

  // Create some matrices
  this.mvMatrix = mat4.create();
  this.pMatrix = mat4.create();
  this.normalMatrix = mat3.create();
  this.normalizedLD = vec3.create();

  // Storage for stack of mvMatrix
  this._mvStack = [];

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  this.shaderProgram = this.initShaders();
  this.buffers = this.initBuffers();
  this.texture = this.initTexture();

  this.pressedKeys = {};
  this.listenForKeyEvents();

  this._el = this.cacheDOMElements();

  this.tick = function () {
    requestAnimationFrame(this.tick);
    this.drawScene();
    this.handleDownKeys();
    this.timeLast = this.animate();
  }.bind(this);

  this.tick();
}

GLApplication.prototype.handleViewportResize = function () {
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  this.gl.viewportWidth = this.canvas.width;
  this.gl.viewportHeight = this.canvas.height;
};

GLApplication.prototype.cacheDOMElements = function () {
  return {
    alpha: document.getElementById('alpha'),
    blending: document.getElementById('blending'),
    lighting: document.getElementById('lighting'),
    ambientR: document.getElementById('ambientR'),
    ambientG: document.getElementById('ambientG'),
    ambientB: document.getElementById('ambientB'),
    lightDirectionX: document.getElementById('lightDirectionX'),
    lightDirectionY: document.getElementById('lightDirectionY'),
    lightDirectionZ: document.getElementById('lightDirectionZ'),
    directionalR: document.getElementById('directionalR'),
    directionalG: document.getElementById('directionalG'),
    directionalB: document.getElementById('directionalB')
  };
};

GLApplication.prototype.pushMVMatrix = function () {
  // This is a very naive implementation of pushMVMatrix. We should probably
  // initialize a number of matrices before rendering starts, copy into those
  // until we run out, and only create new ones if necessary. Ideally, there
  // will always be a sufficient stack available so no new allocations are
  // done.
  this._mvStack.push(mat4.clone(this.mvMatrix));
  return this;
};

GLApplication.prototype.popMVMatrix = function () {
  this.mvMatrix = this._mvStack.pop();
  return this.mvMatrix;
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
  if(this.pressedKeys[37]) {
    this.ySpeed -= 0.5;
  }

  if(this.pressedKeys[39]) {
    this.ySpeed += 0.5;
  }

  if(this.pressedKeys[40]) {
    this.xSpeed -= 0.5;
  }

  if(this.pressedKeys[38]) {
    this.xSpeed += 0.5;
  }

  if(this.pressedKeys[33]) {
    this.zPos += 0.5;
  }

  if(this.pressedKeys[34]) {
    this.zPos -= 0.5;
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
  var elapsed = this.timeLast - timeNow;
  this.xRot += (this.xSpeed * elapsed) / 1000;
  this.yRot += (this.ySpeed * elapsed) / 1000;
  return timeNow;
};

GLApplication.prototype.initTexture = function initTexture () {
  var texture = this.gl.createTexture();
  var image = new Image();
  image.onload = function () {
    this.handleLoadedTexture(texture, image);
  }.bind(this);

  image.src = '/img/glass.gif';
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
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                   gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);

  gl.bindTexture(gl.TEXTURE_2D, null);
};

GLApplication.prototype.initBuffers = function initBuffers () {
  var gl = this.gl;
  var cubeVertexPositionBuffer;
  var cubeVertexTextureCoordBuffer;
  var cubeVertexNormalBuffer;
  var cubeVertexIndexBuffer;

  cubeVertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
  var vertexNormals = [
    // Front face
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // Back face
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // Top face
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Bottom face
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,

    // Right face
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    // Left face
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(vertexNormals),
                gl.STATIC_DRAW);
  cubeVertexNormalBuffer.itemSize = 3;
  cubeVertexNormalBuffer.numItems = vertexNormals.length / 3;

  // Do it all over again for a cube
  cubeVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  vertices = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  cubeVertexPositionBuffer.itemSize = 3;
  cubeVertexPositionBuffer.numItems = vertices.length / 3;

  // Color buffer for cube
  cubeVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
  var textureCoords = [
    // Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // Bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    // Right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(textureCoords),
                gl.STATIC_DRAW);
  cubeVertexTextureCoordBuffer.itemSize = 2;
  cubeVertexTextureCoordBuffer.numItems = 24;

  cubeVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

  var cubeVertexIndices = [
    0, 1, 2,      0, 2, 3,    // Front face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
  ];

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(cubeVertexIndices),
                gl.STATIC_DRAW);

  cubeVertexIndexBuffer.itemSize = 1;
  cubeVertexIndexBuffer.numItems = cubeVertexIndices.length;

  return {
    cubeVertexPositionBuffer: cubeVertexPositionBuffer,
    cubeVertexTextureCoordBuffer: cubeVertexTextureCoordBuffer,
    cubeVertexIndexBuffer: cubeVertexIndexBuffer,
    cubeVertexNormalBuffer: cubeVertexNormalBuffer
  };
};

GLApplication.prototype.drawScene = function() {
  var gl = this.gl;
  var shaderProgram = this.shaderProgram;
  var buffers = this.buffers;
  var texture = this.texture;

  var cubeVertexPositionBuffer = buffers.cubeVertexPositionBuffer;
  var cubeVertexTextureCoordBuffer = buffers.cubeVertexTextureCoordBuffer;
  var cubeVertexIndexBuffer = buffers.cubeVertexIndexBuffer;
  var cubeVertexNormalBuffer = buffers.cubeVertexNormalBuffer;

  // Tell webGL about the canvas
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  // Clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // setup scene perspective
  var viewportAspectRatio = gl.viewportWidth / gl.viewportHeight;

  // Initialize pMatrix, mvMatrix
  mat4.perspective(this.pMatrix, 45, viewportAspectRatio, 0.1, 100.0);
  mat4.identity(this.mvMatrix);

  this.pushMVMatrix();

  // Draw the square now.. relative to current mvMatrix pos
  mat4.translate(this.mvMatrix, this.mvMatrix, [0.0, 0.0, this.zPos]);

  mat4.rotate(this.mvMatrix, this.mvMatrix, D2R * this.xRot, [1, 0, 0]);
  mat4.rotate(this.mvMatrix, this.mvMatrix, D2R * this.yRot, [0, 1, 0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
                         cubeVertexNormalBuffer.itemSize,
                         gl.FLOAT,
                         false,
                         0,
                         0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
                         cubeVertexTextureCoordBuffer.itemSize,
                         gl.FLOAT,
                         false,
                         0,
                         0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  // will it blend?
  var blending = this._el.blending.checked;
  if (blending) {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.uniform1f(shaderProgram.alphaUniform,
                 parseFloat(this._el.alpha.value));
  } else {
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
  }

  // Set uUseLighting
  var lighting = this._el.lighting.checked;
  gl.uniform1i(shaderProgram.useLightingUniform, lighting);

  if (lighting) {
    // Set ambient color uniforms
    gl.uniform3f(
      shaderProgram.ambientColorUniform,
      parseFloat(this._el.ambientR.value),
      parseFloat(this._el.ambientG.value),
      parseFloat(this._el.ambientB.value)
    );

    // Push lighting direction
    var lightingDirection = [
      parseFloat(this._el.lightDirectionX.value),
      parseFloat(this._el.lightDirectionY.value),
      parseFloat(this._el.lightDirectionZ.value),
    ];

    vec3.normalize(this.normalizedLD, lightingDirection);
    // Direction specifies which way light is going, but calculation is based
    // on where light is coming from. Therefore, increase speed, drop down, and
    // reverse direction.
    vec3.scale(this.normalizedLD, this.normalizedLD, -1);
    gl.uniform3fv(shaderProgram.lightingDirectionUniform, this.normalizedLD);

    // Push directional components
    gl.uniform3f(
      shaderProgram.directionalColorUniform,
      parseFloat(this._el.directionalR.value),
      parseFloat(this._el.directionalG.value),
      parseFloat(this._el.directionalB.value)
    );
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  this.setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES,
                  cubeVertexIndexBuffer.numItems,
                  gl.UNSIGNED_SHORT,
                  0);

  // triangle strip -> first 3 vertices for first triangle, next vertex plus
  // previous two for next triangle and so on.
  gl.drawArrays(gl.TRIANGLE, 0, cubeVertexPositionBuffer.numItems);

  this.popMVMatrix();
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

  shaderProgram.vertexNormalAttribute =
    gl.getAttribLocation(shaderProgram, 'aVertexNormal');
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.pMatrixUniform =
    gl.getUniformLocation(shaderProgram, 'uPMatrix');
  shaderProgram.mvMatrixUniform =
    gl.getUniformLocation(shaderProgram, 'uMVMatrix');
  shaderProgram.nMatrixUniform =
    gl.getUniformLocation(shaderProgram, 'uNMatrix');
  shaderProgram.samplerUniform =
    gl.getUniformLocation(shaderProgram, 'uSampler');
  shaderProgram.useLightingUniform =
    gl.getUniformLocation(shaderProgram, 'uUseLighting');
  shaderProgram.ambientColorUniform =
    gl.getUniformLocation(shaderProgram, 'uAmbientColor');
  shaderProgram.lightingDirectionUniform =
    gl.getUniformLocation(shaderProgram, 'uLightingDirection');
  shaderProgram.directionalColorUniform =
    gl.getUniformLocation(shaderProgram, 'uDirectionalColor');
  shaderProgram.alphaUniform =
    gl.getUniformLocation(shaderProgram, 'uAlpha');

  return shaderProgram;
};

GLApplication.prototype.getShader = function getShader (path) {
  var gl = this.gl;
  var shaderSource = shaders[path];
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

GLApplication.prototype.setMatrixUniforms = function setMatrixUniforms () {

  var gl = this.gl;
  var shaderProgram = this.shaderProgram;

  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, this.pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, this.mvMatrix);
  mat3.fromMat4(this.normalMatrix, this.mvMatrix);
  mat3.invert(this.normalMatrix, this.normalMatrix);
  mat3.transpose(this.normalMatrix, this.normalMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, this.normalMatrix);
};

// Export main function
App.GLStart = function () {
  window.glApplication = new GLApplication();
};

