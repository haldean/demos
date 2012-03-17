var start_animation = function() {
  rotate_cube(0);
}

var chars = [' ', '.', ',', ':', ';', '*', '$', '@', '#'];
var intensity_map = function(x) {
  return Math.pow(10, x) / 10;
}

var cube = function(side) {
  var neg = -side / 2, pos = side / 2;
  return [
    // z-neg
    triangle([neg, neg, neg], [pos, neg, neg], [neg, pos, neg]),
    triangle([pos, pos, neg], [pos, neg, neg], [neg, pos, neg]),
    // z-pos
    triangle([neg, neg, pos], [pos, neg, pos], [neg, pos, pos]),
    triangle([pos, pos, pos], [pos, neg, pos], [neg, pos, pos]),
    // x-neg
    triangle([neg, neg, pos], [neg, neg, neg], [neg, pos, neg]),
    triangle([neg, pos, neg], [neg, neg, pos], [neg, pos, pos]),
    // x-pos
    triangle([pos, neg, pos], [pos, neg, neg], [pos, pos, neg]),
    triangle([pos, pos, neg], [pos, neg, pos], [pos, pos, pos]),
    // y-neg
    triangle([neg, neg, neg], [pos, neg, neg], [neg, neg, pos]),
    triangle([pos, neg, pos], [pos, neg, neg], [neg, neg, pos]),
    // y-pos
    triangle([neg, pos, neg], [pos, pos, neg], [neg, pos, pos]),
    triangle([pos, pos, pos], [pos, pos, neg], [neg, pos, pos])
      ];
}

var rotate_cube = function(theta) {
  trace(rotate_all(cube(50), theta, theta / 2), 'output');
  setTimeout(rotate_cube, 50, theta + 0.1);
}

var trace = function(geom, id) {
  var width = 120, height = 60;
  var screen = [];

  // initialize screen
  for (var i = 0; i < height; i++) {
    screen[i] = [];
    for (var j = 0; j < width; j++) {
      screen[i][j] = " ";
    }
  }

  // render geometry
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      var origin = [2 * i - height, j - width / 2, 0];

      var close = Infinity;
      var dot_close = 0;
      for (var k = 0; k < geom.length; k++) {
        var intersection = geom[k].intersect(origin);
        if (intersection && intersection.dist < close) {
          close = intersection.dist;
          dot_close = intersection.dot;
        }
      }
      screen[i][j] = intensity_map(dot_close);
    }
  }

  // generate output
  var output = '';
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      for (var k = 0; k < chars.length; k++) {
        if (screen[i][j] <= (k + 1) / chars.length) {
          output += chars[k];
          break;
        }
      }
    }
    output += '\n'
  }

  document.getElementById(id).innerHTML = output;
}

// vector math stuff

var dot = function(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

var add = function(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

var mul = function(s, v) {
  return [s * v[0], s * v[1], s * v[2]];
}

var sub = function(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

var normalize = function(v) {
  var norm = Math.sqrt(dot(v, v));
  return mul(1 / norm, v);
}

var cross = function(a, b) {
  return [a[1] * b[2] - a[2] * b[1],
          a[2] * b[0] - a[0] * b[2],
          a[0] * b[1] - a[1] * b[0]];
}

var rotate_y = function(v, theta) {
  return [
    Math.cos(theta) * v[0] + Math.sin(theta) * v[2],
    v[1],
    Math.cos(theta) * v[2] - Math.sin(theta) * v[0]];
}

var rotate_x = function(v, theta) {
  return [
    v[0],
    Math.cos(theta) * v[1] - Math.sin(theta) * v[2],
    Math.sin(theta) * v[1] - Math.sin(theta) * v[2]];
}

var rotate = function(v, theta_y, theta_x) {
  return rotate_x(rotate_y(v, theta_y), theta_x);
}

// rotate a bunch of triangles
var rotate_all = function(tris, theta_y, theta_x) {
  var new_tris = [];
  for (var i = 0; i < tris.length; i++) {
    var tri = tris[i];
    new_tris[i] = triangle(
        rotate(tri.v1, theta_y, theta_x),
        rotate(tri.v2, theta_y, theta_x),
        rotate(tri.v3, theta_y, theta_x));
  }
  return new_tris;
}

var triangle = function(v1, v2, v3) {
  return {
    'v1': v1, 'v2': v2, 'v3': v3,
    'dot': Math.abs(normalize(cross(sub(v1, v2), sub(v3, v2)))[2]),
    'intersect': function(pos, dir) {
      var divisor = (v2[1] - v3[1]) * (v1[0] - v3[0]) + (v3[0] - v2[0]) * (v1[1] - v3[1]);
      var lambda1 = 
        ((v2[1] - v3[1]) * (pos[0] - v3[0]) + (v3[0] - v2[0]) * (pos[1] - v3[1])) / divisor;
      var lambda2 =
        ((v3[1] - v1[1]) * (pos[0] - v3[0]) + (v1[0] - v3[0]) * (pos[1] - v3[1])) / divisor;
      var lambda3 = 1 - lambda1 - lambda2;

      if (lambda1 <= 0 - 1e-5 || lambda1 >= 1) return undefined;
      if (lambda2 <= 0 - 1e-5 || lambda2 >= 1) return undefined;
      if (lambda3 <= 0 - 1e-5 || lambda3 >= 1) return undefined;

      var depth = lambda1 * v1[2] + lambda2 * v2[2] + lambda3 * v3[2];
      return {
        'dist': depth, 'dot': this.dot
      }
    }
  }
}
