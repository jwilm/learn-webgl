var shaders = {
  "fragment/fragment": "precision mediump float;varying vec4 vColor;void main(void) { gl_FragColor = vColor;}",
  "vertex/vertex": "attribute vec3 aVertexPosition;attribute vec4 aVertexColor;uniform mat4 uMVMatrix;uniform mat4 uPMatrix;varying vec4 vColor;void main(void) { gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); vColor = aVertexColor;}"
};