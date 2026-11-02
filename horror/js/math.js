(function (global) {
  "use strict";

  var V3 = {
    add: function (a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; },
    sub: function (a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; },
    scale: function (a, s) { return [a[0] * s, a[1] * s, a[2] * s]; },
    dot: function (a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; },
    cross: function (a, b) {
      return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    },
    length: function (a) { return Math.sqrt(V3.dot(a, a)); },
    normalize: function (a) {
      var l = V3.length(a);
      return l > 1e-8 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 0];
    }
  };

  var M4 = {
    identity: function () {
      var m = new Float32Array(16);
      m[0] = m[5] = m[10] = m[15] = 1;
      return m;
    },
    multiply: function (a, b) {
      var o = new Float32Array(16);
      for (var c = 0; c < 4; c++) {
        for (var r = 0; r < 4; r++) {
          o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
        }
      }
      return o;
    },
    perspective: function (fovy, aspect, near, far) {
      var f = 1 / Math.tan(fovy / 2);
      var m = new Float32Array(16);
      m[0] = f / aspect;
      m[5] = f;
      m[10] = (far + near) / (near - far);
      m[11] = -1;
      m[14] = 2 * far * near / (near - far);
      return m;
    },
    lookAt: function (eye, center, up) {
      var z = V3.normalize(V3.sub(eye, center));
      var x = V3.normalize(V3.cross(up, z));
      var y = V3.cross(z, x);
      var m = new Float32Array(16);
      m[0] = x[0]; m[1] = y[0]; m[2] = z[0];
      m[4] = x[1]; m[5] = y[1]; m[6] = z[1];
      m[8] = x[2]; m[9] = y[2]; m[10] = z[2];
      m[12] = -V3.dot(x, eye);
      m[13] = -V3.dot(y, eye);
      m[14] = -V3.dot(z, eye);
      m[15] = 1;
      return m;
    },
    translation: function (x, y, z) {
      var m = M4.identity();
      m[12] = x; m[13] = y; m[14] = z;
      return m;
    },
    scaling: function (x, y, z) {
      var m = M4.identity();
      m[0] = x; m[5] = y; m[10] = z;
      return m;
    },
    rotationX: function (a) {
      var m = M4.identity(), c = Math.cos(a), s = Math.sin(a);
      m[5] = c; m[6] = s; m[9] = -s; m[10] = c;
      return m;
    },
    rotationY: function (a) {
      var m = M4.identity(), c = Math.cos(a), s = Math.sin(a);
      m[0] = c; m[2] = -s; m[8] = s; m[10] = c;
      return m;
    },
    rotationZ: function (a) {
      var m = M4.identity(), c = Math.cos(a), s = Math.sin(a);
      m[0] = c; m[1] = s; m[4] = -s; m[5] = c;
      return m;
    },
    invert: function (m) {
      var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
      var a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
      var a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
      var a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
      var b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10;
      var b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12;
      var b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30;
      var b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
      var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      if (!det) return null;
      det = 1 / det;
      var o = new Float32Array(16);
      o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
      o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
      o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
      o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
      o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
      o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
      o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
      o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
      o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
      return o;
    },
    normalFromMat4: function (a) {
      var a00 = a[0], a01 = a[1], a02 = a[2];
      var a10 = a[4], a11 = a[5], a12 = a[6];
      var a20 = a[8], a21 = a[9], a22 = a[10];
      var b01 = a22 * a11 - a12 * a21;
      var b11 = -a22 * a10 + a12 * a20;
      var b21 = a21 * a10 - a11 * a20;
      var det = a00 * b01 + a01 * b11 + a02 * b21;
      if (!det) return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
      det = 1 / det;
      var o = new Float32Array(9);
      o[0] = b01 * det;
      o[1] = (-a22 * a01 + a02 * a21) * det;
      o[2] = (a12 * a01 - a02 * a11) * det;
      o[3] = b11 * det;
      o[4] = (a22 * a00 - a02 * a20) * det;
      o[5] = (-a12 * a00 + a02 * a10) * det;
      o[6] = b21 * det;
      o[7] = (-a21 * a00 + a01 * a20) * det;
      o[8] = (a11 * a00 - a01 * a10) * det;
      return o;
    }
  };

  global.V3 = V3;
  global.M4 = M4;
  if (typeof module !== "undefined" && module.exports) module.exports = { V3: V3, M4: M4 };
})(typeof window !== "undefined" ? window : globalThis);
