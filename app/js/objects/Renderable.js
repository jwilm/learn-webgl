/**
 * A renderable object
 * @class Renderable
 */
function Renderable () {
  // Rotation about i, j, k
  this.rotation = [0.0, 0.0, 0.0];

  // Position
  this.position = [0.0, 0.0, 0.0];

  // model matrix
  this.mMatrix = mat4.create();
  this.normalMatrix = mat3.create();
}

/**
 * Rotate the object from its current orientation
 * @method rotate
 */
Renderable.prototype.rotate = function (dx, dy, dz) {
  this._mMatrixNeedsUpdate = true;
  this.rotation[0] = this.rotation[0] + dx;
  this.rotation[1] = this.rotation[1] + dy;
  this.rotation[2] = this.rotation[2] + dz;
};

/**
 * translate the object from its current position
 * @method translate
 */
Renderable.prototype.translate = function (dx, dy, dz) {
  this._mMatrixNeedsUpdate = true;
  this.position[0] = this.position[0] + dx;
  this.position[1] = this.position[1] + dy;
  this.position[2] = this.position[2] + dz;
};

/**
 * Calculate the model matrix based on current orientation and position.
 * @method updateModelMatrix
 */
Renderable.prototype.updateModelMatrix = function () {
  mat4.identity(this.mMatrix);
  mat4.rotate(this.mMatrix, this.mMatrix, this.rotation[0], [1, 0, 0]);
  mat4.rotate(this.mMatrix, this.mMatrix, this.rotation[1], [0, 1, 0]);
  mat4.rotate(this.mMatrix, this.mMatrix, this.rotation[2], [0, 0, 1]);
  mat4.translate(this.mMatrix, this.mMatrix, this.position);
  this._mMatrixNeedsUpdate = false;
};

/**
 * Return the model matrix. Recalculates it if necessary.
 * @method getModelMatrix
 */
Renderable.prototype.getModelMatrix = function () {
  if(this._mMatrixNeedsUpdate) {
    this.updateModelMatrix();
  }

  return this.mMatrix;
};

/**
 * Calculate the model view matrix
 * @method modelViewMatrix
 * @param {mat4} mvMatrix - container for model view matrix
 * @param {mat4} vMatrix - current view
 */
Renderable.prototype.modelViewMatrix = function (mvMatrix, vMatrix) {
  mat4.multiply(mvMatrix, vMatrix, this.getModelMatrix());
};

/**
 * Draw the renderable object.
 * @method draw
 * @param {WebGLRenderingContext} gl - reference to webgl instance
 * @param {mat4} viewMatrix - current view matrix to render for
 */
Renderable.prototype.draw = function (gl, viewMatrix, shaderProgram) {

};

Renderable.prototype.setMatrixUniforms =
  function (gl, shaderProgram, pMatrix, mvMatrix) {

  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
  mat3.fromMat4(this.normalMatrix, mvMatrix);
  mat3.invert(this.normalMatrix, this.normalMatrix);
  mat3.transpose(this.normalMatrix, this.normalMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, this.normalMatrix);
};
