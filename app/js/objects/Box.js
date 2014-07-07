var Box = (function () {
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

  var vertices = [
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

  var cubeVertexIndices = [
    0, 1, 2,      0, 2, 3,    // Front face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
  ];

  function Box (opts) {
    Renderable.prototype.constructor.apply(this, arguments);
    this.texture = opts.texture;
    this.mvMatrix = mat4.create();

    this.vRotation = [
      Math.random() * 20 * D2R / 1000,
      Math.random() * 20 * D2R / 1000,
      Math.random() * 20 * D2R / 1000
    ];
    this.vTranslation = [0, 0, 0];
  }

  Box.prototype = new Renderable();
  Box.prototype.constructor = Box;

  Box.prototype.init = function (gl) {
    this.vertexPositionBuffer = gl.createBuffer();
    this.vertexTextureCoordBuffer = gl.createBuffer();
    this.vertexNormalBuffer = gl.createBuffer();
    this.vertexIndexBuffer = gl.createBuffer();

    // Vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.vertexPositionBuffer.itemSize = 3;
    this.vertexPositionBuffer.numItems = vertices.length / 3;

    // Vertex Normals
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(vertexNormals),
                  gl.STATIC_DRAW);
    this.vertexNormalBuffer.itemSize = 3;
    this.vertexNormalBuffer.numItems = vertexNormals.length / 3;

    // Texture coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(textureCoords),
                  gl.STATIC_DRAW);
    this.vertexTextureCoordBuffer.itemSize = 2;
    this.vertexTextureCoordBuffer.numItems = textureCoords.length / 2;

    // Vertex indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                  new Uint16Array(cubeVertexIndices),
                  gl.STATIC_DRAW);
    this.vertexIndexBuffer.itemSize = 1;
    this.vertexIndexBuffer.numItems = cubeVertexIndices.length;
  };

  Box.prototype.animate = function (dt) {
    var vRot = this.vRotation;
    var vMov = this.vTranslation;
    this.rotate(vRot[0] * dt, vRot[1] * dt, vRot[2] * dt);
    this.translate(vMov[0] * dt, vMov[1] * dt, vMov[2] * dt);
  };

  Box.prototype.draw = function (gl, shaderProgram, pMatrix, vMatrix) {
    this.modelViewMatrix(this.mvMatrix, vMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
      this.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
      this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
      this.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    this.setMatrixUniforms(gl, shaderProgram, pMatrix, this.mvMatrix);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES,
      this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    gl.drawArrays(gl.TRIANGLE, 0, this.vertexPositionBuffer.numItems);
  };

  return Box;
})();
