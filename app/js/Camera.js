function Camera () {
  this._mat = mat4.create();
  this._view = mat4.create();
  this._vec4 = vec4.create();
}

Camera.prototype.move = function (_vec4) {
  // this ignores the vec4 scale factor
  vec4.transformMat4(this._vec4, _vec4, this._mat);
  this._mat[12] = this._mat[12] + this._vec4[0];
  this._mat[13] = this._mat[13] + this._vec4[1];
  this._mat[14] = this._mat[14] + this._vec4[2];
};

Camera.prototype.rotate = function (yaw, pitch) {
  mat4.rotate(this._mat, this._mat, pitch, [0, 1, 0]);
  mat4.rotate(this._mat, this._mat, yaw, [1, 0, 0]);
};

Camera.prototype.moveTo = function (_vec3) {
  this._mat[12] = _vec3[0];
  this._mat[13] = _vec3[1];
  this._mat[14] = _vec3[2];
};

Camera.prototype.reset = function () {
  mat4.identity(this._mat);
};

Camera.prototype.getViewMatrix = function () {
  mat4.invert(this._view, this._mat);
  return this._view;
};

