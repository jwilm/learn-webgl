var D2R = Math.PI / 180;
var R2D = 180 / Math.PI;

var MVStack = function () {
  this.stack = [];
};

MVStack.prototype.push = function (mvMatrix) {
  this.stack.push(mat4.clone(mvMatrix));
  return this;
};

MVStack.prototype.pop = function (mvMatrix) {
  return this.stack.pop();
};

var mvStack = new MVStack();

var pressedKeys = {};
var selectedTexture = 0;

var listenForKeyEvents = function () {
  var ignoreKeys = [37, 38, 39, 40];
  window.addEventListener('keydown', function (e) {
    pressedKeys[e.keyCode] = true;

    if(ignoreKeys.indexOf(e.keyCode) !== -1) {
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', function (e) {
    pressedKeys[e.keyCode] = false;
  });
};

var GLStart = function () {
  var canvas = document.getElementById('gl');
  canvas.width = window.innerHeight;
  canvas.height = window.innerWidth;

  var gl = initGL(canvas);
  var shaderProgram = initShaders(gl);
  var buffers = initBuffers(gl);
  var texture = initTexture(gl);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  listenForKeyEvents();

  var tick = function (gl, shaderProgram, buffers, texture) {
    requestAnimationFrame(tick);
    drawScene(gl, shaderProgram, buffers, texture);
    handleDownKeys();
    animate();
  }.bind(null, gl, shaderProgram, buffers, texture);

  tick();
};

var handleDownKeys = function () {
  if(pressedKeys[37]) {
    ySpeed -= 0.5;
  }

  if(pressedKeys[39]) {
    ySpeed += 0.5;
  }

  if(pressedKeys[40]) {
    xSpeed -= 0.5;
  }

  if(pressedKeys[38]) {
    xSpeed += 0.5;
  }

  if(pressedKeys[33]) {
    zPos += 0.5;
  }

  if(pressedKeys[34]) {
    zPos -= 0.5;
  }
};

var zPos = -5.0;
var xRot = 0;
var yRot = 0;

var xSpeed = 50;
var ySpeed = 50;

var timeLast = Date.now();
var animate = function animate () {
  var timeNow = Date.now();
  var elapsed = timeLast - timeNow;
  timeLast = timeNow;
  xRot += (xSpeed * elapsed) / 1000;
  yRot += (ySpeed * elapsed) / 1000;
};

var initTexture = function (gl) {
  var texture = gl.createTexture();
  var image = new Image();
  image.onload = function () {
    handleLoadedTexture(gl, texture, image);
  };

  image.src = '/img/glass.gif';
  return texture;
};

var handleLoadedTexture = function handleLoadedTexture (gl, texture, image) {
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

var initBuffers = function(gl) {

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

var drawScene = function(gl, shaderProgram, buffers, texture) {

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
  var mvMatrix = mat4.create();
  var pMatrix = mat4.create();

  // Initialize pMatrix, mvMatrix
  mat4.perspective(pMatrix, 45, viewportAspectRatio, 0.1, 100.0);
  mat4.identity(mvMatrix);

  mvStack.push(mvMatrix);

  // Draw the square now.. relative to current mvMatrix pos
  mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, zPos]);

  mat4.rotate(mvMatrix, mvMatrix, D2R * xRot, [1, 0, 0]);
  mat4.rotate(mvMatrix, mvMatrix, D2R * yRot, [0, 1, 0]);

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
  var blending = document.getElementById('blending').checked;
  if (blending) {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.uniform1f(shaderProgram.alphaUniform,
                 parseFloat(document.getElementById('alpha').value));
  } else {
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
  }

  // Set uUseLighting
  var lighting = document.getElementById('lighting').checked;
  gl.uniform1i(shaderProgram.useLightingUniform, lighting);

  if (lighting) {
    // Set ambient color uniforms
    gl.uniform3f(
      shaderProgram.ambientColorUniform,
      parseFloat(document.getElementById('ambientR').value),
      parseFloat(document.getElementById('ambientG').value),
      parseFloat(document.getElementById('ambientB').value)
    );

    // Push lighting direction
    var lightingDirection = [
      parseFloat(document.getElementById('lightDirectionX').value),
      parseFloat(document.getElementById('lightDirectionY').value),
      parseFloat(document.getElementById('lightDirectionZ').value),
    ];
    var normalizedLD = vec3.create();
    vec3.normalize(normalizedLD, lightingDirection);
    // Direction specifies which way light is going, but calculation is based
    // on where light is coming from. Therefore, increase speed, drop down, and
    // reverse direction.
    vec3.scale(normalizedLD, normalizedLD, -1);
    gl.uniform3fv(shaderProgram.lightingDirectionUniform, normalizedLD);

    // Push directional components
    gl.uniform3f(
      shaderProgram.directionalColorUniform,
      parseFloat(document.getElementById('directionalR').value),
      parseFloat(document.getElementById('directionalG').value),
      parseFloat(document.getElementById('directionalB').value)
    );
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  setMatrixUniforms(gl, shaderProgram, pMatrix, mvMatrix);
  gl.drawElements(gl.TRIANGLES,
                  cubeVertexIndexBuffer.numItems,
                  gl.UNSIGNED_SHORT,
                  0);

  // triangle strip -> first 3 vertices for first triangle, next vertex plus
  // previous two for next triangle and so on.
  gl.drawArrays(gl.TRIANGLE, 0, cubeVertexPositionBuffer.numItems);

  mvMatrix = mvStack.pop();
};

function initGL(canvas) {
  var gl = canvas.getContext('webgl') ||
    canvas.getContext('experimental-webgl');

  if(!gl) {
    return alert('Could not initialize WebGL');
  }

  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  return gl;
}

function loadShader(gl, source, type) {
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
}

var initShaders = function initShaders (gl) {
  var fragmentShader = getShader(gl, 'fragment/fragment');
  var vertexShader = getShader(gl, 'vertex/vertex');

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

var getShader = function getShader (gl, path) {
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

var normalMatrix = mat3.create();
function setMatrixUniforms (gl, shaderProgram, pMatrix, mvMatrix) {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
  mat3.fromMat4(normalMatrix, mvMatrix);
  mat3.invert(normalMatrix, normalMatrix);
  mat3.transpose(normalMatrix, normalMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

// Export main function
App.GLStart = GLStart;

