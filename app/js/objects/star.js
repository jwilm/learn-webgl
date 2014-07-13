var Star = (function() {
  var id = 0;
  function Star (opts) {
    Renderable.prototype.constructor.apply(this);

    this.angle = 0;
    this.spin = D2R * 0.3;
    this.angle = id * 25 * D2R;
    this.dist = opts.startingDistance;
    this.rotationSpeed = opts.rotationSpeed;
    this._twinkle = opts.twinkle;
    this._spinTotal = 0;
    this.texture = opts.texture;
    this.id = id++;

    this._sprite = true;

    // initial rotation offset
    this.rotate(0, 0, opts.spinOffset);
    this.randomiseColors();
  }

  Star.prototype = new Renderable();
  Star.prototype.constructor = Star;

  var effectiveFPMS = 60 / 1000;
  var sin = Math.sin;
  var cos = Math.cos;
  var _ANIMATE = false;

  Star.prototype.animate = function (dt) {
    // Rotate about center
    if(_ANIMATE) {
      this.angle += this.rotationSpeed * dt * effectiveFPMS / 10;

      // Decrease distance and reset when reaching center
      this.dist -= (0.01 * dt * effectiveFPMS);

      if(this.dist < 0.0) {
        this.dist += 5.0;
        this.randomiseColors();
      }
    }

    // Calculate position in cartesian space
    this.moveTo([this.dist * cos(this.angle),
                this.dist * sin(this.angle),
                this._translation[2]]);
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

  var acos = Math.acos;
  var _temp = quat.create();
  var _cameraPos = mat4.create();
  Star.prototype.draw = function (gl, shaderProgram, pMatrix, vMatrix) {

    mat4.invert(_cameraPos, vMatrix);
    this._spinTotal += this.spin;

    // draw rotating star in background
    if(this._twinkle.checked) {
      // Draw non rotating star in alternate twinkling color
      gl.uniform3f(shaderProgram.colorUniform,
        this.twinkleR, this.twinkleG, this.twinkleB);

      this.lookAt([_cameraPos[12], _cameraPos[13], _cameraPos[14]], 0);
      // stash current rotation and change it
      // quat.copy(_temp, this._rotation);
      // quat.setAxisAngle(this._rotation, [0, 0, 1], 0);

      // Draw
      this._draw(gl, shaderProgram, pMatrix, vMatrix);

      // reset old rotation
      // quat.copy(this._rotation, _temp);
    }

    this.lookAt([_cameraPos[12], _cameraPos[13], _cameraPos[14]], this._spinTotal);
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
