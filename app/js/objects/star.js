function Star (startingDistance, rotationSpeed) {
  this.angle = 0;
  this.dist = startingDistance;
  this.rotationSpeed = rotationSpeed;

  this.randomiseColors();
}

Star.prototype.draw = function (tilt, spin, twinkle, app) {

};
