var Star = (function() {
  function Star (opts) {
    Renderable.prototype.constructor.apply(this);
    this.angle = 0;
    this.spin = D2R * 0.3;
    this.dist = opts.startingDistance;
    this.rotationSpeed = opts.rotationSpeed;
    this._twinkle = opts.twinkle;
    this.texture = opts.texture;

    // initial rotation offset
    this.rotate(0, 0, opts.spinOffset);
    this.randomiseColors();
  }

  Star.prototype = new Renderable();
  Star.prototype.constructor = Star;

  var effectiveFPMS = 60 / 1000;
  var sin = Math.sin;
  var cos = Math.cos;

  Star.prototype.animate = function (dt) {
    // Rotate about center
    this.angle += this.rotationSpeed * dt * effectiveFPMS / 10;

    // Decrease distance and reset when reaching center
    this.dist -= (0.01 * dt * effectiveFPMS);

    if(this.dist < 0.0) {
      this.dist += 5.0;
      this.randomiseColors();
    }

    // Calculate position in cartesian space
    this.moveTo(this.dist * cos(this.angle), this.dist * sin(this.angle), this.position[2]);
  };

  var initialized = false;
  var vertexTextureCoordBuffer;
  var vertexPositionBuffer;

  Star.prototype.init = function (gl) {
    if(!initialized) {
      vertexPositionBuffer = gl.createBuffer();
      vertexTextureCoordBuffer = gl.createBuffer();

      var vertices = [
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0,
        -1.0,  1.0,  0.0,
         1.0,  1.0,  0.0
      ];

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(vertices), gl.STATIC_DRAW);
      vertexPositionBuffer.itemSize = 3;
      vertexPositionBuffer.numItems = 4;

      var textureCoords = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
      ];

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(textureCoords), gl.STATIC_DRAW);
      vertexTextureCoordBuffer.itemSize = 2;
      vertexTextureCoordBuffer.numItems = 4;
    }
  };

  var random = Math.random;
  Star.prototype.randomiseColors = function () {
    this.r = random();
    this.g = random();
    this.b = random();

    this.twinkleR = random();
    this.twinkleG = random();
    this.twinkleB = random();
  };

  Star.prototype.draw = function (gl, shaderProgram, pMatrix, vMatrix) {

    if(this._twinkle.checked) {
      // Draw non rotating star in alternate twinkling color
      gl.uniform3f(shaderProgram.colorUniform,
        this.twinkleR, this.twinkleG, this.twinkleB);
      var zRot = this.rotation[2];
      this.rotate(0, 0, -zRot);
      this._draw(gl, shaderProgram, pMatrix, vMatrix);
      this.rotate(0, 0, zRot);
    }

    this.rotate(0, 0, this.spin);
    gl.uniform3f(shaderProgram.colorUniform, this.r, this.g, this.b);

    this._draw(gl, shaderProgram, pMatrix, vMatrix);
  };

  Star.prototype._draw = function (gl, shaderProgram, pMatrix, vMatrix) {
    this.modelViewMatrix(this.mvMatrix, vMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
      vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
      vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    this.setMatrixUniforms(gl, shaderProgram, pMatrix, this.mvMatrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPositionBuffer.numItems);
  };

  Star.prototype.setMatrixUniforms =
    function (gl, shaderProgram, pMatrix, mvMatrix) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
  };

  return Star;
})();
