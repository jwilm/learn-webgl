/**
 * A renderable object
 * @class Renderable
 */
function Renderable () {
  this._eye = vec3.create();
  this._up = vec3.fromValues(0, 1, 0);

  this._translation = vec3.create();
  this._rotation = quat.create();
  this._mat = mat4.create();

  // model matrix
  this.normalMatrix = mat3.create();
  this.mvMatrix = mat4.create();
}

/**
 * Rotate the object from its current orientation
 * @method rotate
 */
Renderable.prototype.rotate = function (dx, dy, dz) {
  if (dx !== 0) {
    quat.rotateX(this._rotation, this._rotation, dx);
  }
  if (dy !== 0) {
    quat.rotateY(this._rotation, this._rotation, dy);
  }
  if (dz !== 0) {
    quat.rotateZ(this._rotation, this._rotation, dz);
  }
  return this;
};

/**
 * translate the object from its current position
 * @method translate
 */
Renderable.prototype.translate = function (_vec3) {
  vec3.add(this._translation, this._translation, _vec3);
  return this;
};

/**
 * translate to a particular location
 * @method moveTo
 */
Renderable.prototype.moveTo = function (_vec3) {
  vec3.copy(this._translation, _vec3);
  return this;
};

/**
 * Calculate the model view matrix
 * @method modelViewMatrix
 * @param {mat4} mvMatrix - container for model view matrix
 * @param {mat4} vMatrix - current view
 */
Renderable.prototype.modelViewMatrix = function (mvMatrix, vMatrix) {
  mat4.fromRotationTranslation(this._mat, this._rotation, this._translation);
  return mat4.multiply(mvMatrix, vMatrix, this._mat);
};

/**
 * Draw the renderable object.
 * @method draw
 * @param {WebGLRenderingContext} gl - reference to webgl instance
 * @param {mat4} viewMatrix - current view matrix to render for
 */
Renderable.prototype.draw = function (gl, viewMatrix, shaderProgram) {

};

/**
 * Look at a point
 * @param {vec3} target the location to look at
 */

var los = vec3.create();
Renderable.prototype.lookAt = function (target) {
  vec3.subtract(los, target, this._translation);
  vec3.cross(los, target, los);
  vec3.normalize(los, los);
  quat.setAxisAngle(this._rotation, los, Math.PI / 2);
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
