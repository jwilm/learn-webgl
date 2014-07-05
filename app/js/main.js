var triangleVertexPositionBuffer,
  squareVertexPositionBuffer,
  gl,
  mvMatrix = mat4.create(),
  pMatrix = mat4.create();

var GLStart = function () {
  var canvas = document.getElementById('gl');
  canvas.width = window.innerHeight;
  canvas.height = window.innerWidth;

  var gl = initGL(canvas);
  var shaderProgram = initShaders(gl);
  var buffers = initBuffers(gl);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  drawScene(gl, shaderProgram, buffers);
};

var initBuffers = function(gl) {

  var triangleVertexPositionBuffer;
  var squareVertexPositionBuffer;
  var triangleVertexColorBuffer;
  var squareVertexColorBuffer;

  // create buffer on graphics card
  triangleVertexPositionBuffer = gl.createBuffer();

  // specify buffer to use for subsequent operations
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);

  var vertices = [
    0.0,  1.0,  0.0,
   -1.0, -1.0,  0.0,
    1.0, -1.0,  0.0
  ];

  // Send vertices array to buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Properties for convenience, not WebGL related
  triangleVertexPositionBuffer.itemSize = 3; // elements per vertex
  triangleVertexPositionBuffer.numItems = 3; // num vertices

  // Color buffer for triangle
  triangleVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  var colors = [
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  triangleVertexColorBuffer.itemSize = 4;
  triangleVertexColorBuffer.numItems = 3;

  // Do it all over again for a square
  squareVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  vertices = [
    1.0,  1.0,  0.0,
   -1.0,  1.0,  0.0,
    1.0, -1.0,  0.0,
   -1.0, -1.0,  0.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  squareVertexPositionBuffer.itemSize = 3;
  squareVertexPositionBuffer.numItems = 4;

  // Color buffer for square
  squareVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
  colors = [
    0.5, 0.5, 1.0, 1.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, 0.5, 1.0, 1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  squareVertexColorBuffer.itemSize = 4;
  squareVertexColorBuffer.numItems = 4;

  return {
    triangleVertexPositionBuffer: triangleVertexPositionBuffer,
    squareVertexPositionBuffer: squareVertexPositionBuffer,
    triangleVertexColorBuffer: triangleVertexColorBuffer,
    squareVertexColorBuffer: squareVertexColorBuffer
  };
};

var drawScene = function(gl, shaderProgram, buffers) {

  var triangleVertexPositionBuffer = buffers.triangleVertexPositionBuffer;
  var squareVertexPositionBuffer = buffers.squareVertexPositionBuffer;
  var triangleVertexColorBuffer = buffers.triangleVertexColorBuffer;
  var squareVertexColorBuffer = buffers.squareVertexColorBuffer;

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

  // Multiple mvMatrix by translation vector
  mat4.translate(mvMatrix, mvMatrix, [-1.5, 0.0, -7.0]);

  // Draw triangle
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // Assign the WebGLBuffer object currently bound to the ARRAY_BUFFER target
  // to the vertex attribute at the passed index.
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
                         triangleVertexColorBuffer.itemSize,
                         gl.FLOAT,
                         false,
                         0,
                         0);


  // send mv matrix stuff to gfx card
  setMatrixUniforms(gl, shaderProgram, pMatrix, mvMatrix);

  // WebGL now has array of numbers it knows to treat as vertex positions, and
  // it also knows about matrices. Draw the vertex array as triangles starting
  // at item 0, go to numItems element
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

  // Draw the square now.. relative to current mvMatrix pos
  mat4.translate(mvMatrix, mvMatrix, [3.0, 0.0, 0.0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
                         squareVertexColorBuffer.itemSize,
                         gl.FLOAT,
                         false,
                         0,
                         0);

  setMatrixUniforms(gl, shaderProgram, pMatrix, mvMatrix);

  // triangle strip -> first 3 vertices for first triangle, next vertex plus
  // previous two for next triangle and so on.
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
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

  shaderProgram.vertexColorAttribute =
    gl.getAttribLocation(shaderProgram, 'aVertexColor');
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  shaderProgram.pMatrixUniform =
    gl.getUniformLocation(shaderProgram, 'uPMatrix');
  shaderProgram.mvMatrixUniform =
    gl.getUniformLocation(shaderProgram, 'uMVMatrix');

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

function setMatrixUniforms (gl, shaderProgram, pMatrix, mvMatrix) {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

// Export main function
App.GLStart = GLStart;

