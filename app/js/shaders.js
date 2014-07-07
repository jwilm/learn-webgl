var SHADERS = {
  "fragment/fragment": "precision mediump float;varying vec2 vTextureCoord;uniform sampler2D uSampler;uniform vec3 uColor;void main(void) { vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)); gl_FragColor = textureColor * vec4(uColor, 1.0);}",
  "vertex/vertex": "attribute vec3 aVertexPosition;attribute vec2 aTextureCoord;uniform mat4 uMVMatrix;uniform mat4 uPMatrix;varying vec2 vTextureCoord;void main(void) { gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); vTextureCoord = aTextureCoord;}"
};