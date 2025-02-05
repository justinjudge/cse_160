// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GloablRotateMatrix;
  void main() {
    gl_Position = u_GloablRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Gloabl Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GloablRotateMatrix

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // to get alpha transparency to work
  gl.enable(gl.BLEND); 
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // to fix depth of shapes in 3d
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GloablRotateMatrix
  u_GloablRotateMatrix = gl.getUniformLocation(gl.program, 'u_GloablRotateMatrix');
  if (!u_GloablRotateMatrix) {
    console.log('Failed to get the storage location of u_GloablRotateMatrix');
    return;
  }

  // set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Gloabls related UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_isMouseDown = false;
// let g_selectedSegments = 10;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // Button Events for Picture
  document.getElementById('pictureButton').onclick = function() {beyondTheBasics();};

  // Button Events (Shapy Type)
  document.getElementById('green').onclick = function() {g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() {g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('clearButton').onclick = function() {g_shapesList = []; renderAllShapes();};

  document.getElementById('pointButton').onclick = function() {g_selectedType = POINT};
  document.getElementById('triButton').onclick = function() {g_selectedType = TRIANGLE};
  document.getElementById('circleButton').onclick = function() {g_selectedType = CIRCLE};

  // Slider Events
  document.getElementById("redSlide").addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById("greenSlide").addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById("blueSlide").addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  // Transparency
  document.getElementById("transSlide").addEventListener('mouseup', function() { g_selectedColor[3] = this.value/100; });

  // Button events
  document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation = false;};
  document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation = true;};
  document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation = false;};
  document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation = true;};

  // Angle Slider
  document.getElementById("angleSlide").addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });

  // Mouse Control

  // Yellow Slider
  document.getElementById("yellowSlide").addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });

  // Magenta Slider
  document.getElementById("magentaSlide").addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); });

  // Size Slider Events
  document.getElementById("sizeSlide").addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById("segmentSlide").addEventListener('mouseup', function() { g_selectedSegments = this.value; });
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // he commented out above and put 
  // renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by the browser repeatedly whenever its time
function tick() {
  // Save the current time
  g_seconds = performance.now()/1000.0 - g_startTime;
  console.log(g_seconds);

  // Update Animation Angles
  updateAnimationAngles();

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it ahs time
  requestAnimationFrame(tick);
}

var g_shapesList = [];

/*
var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = []; // The array to store the size of a point
*/

// This is my Beyond The Basics attempt. I made a new Humanoid Robot.
function beyondTheBasics() {
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Torso
  gl.uniform4f(u_FragColor, 1.0, 0.8, 0.7, 1.0);
  drawTriangle( [-0.5, -1,    0.5, 0.1,   0.5, -1] );
  drawTriangle( [-0.5, -1,    0.5, 0.1,   -0.5, 0.1] );

  // Arms
  drawTriangle( [0.5, 0.1,    1.0, 0.1,   0.5, -0.1] );
  drawTriangle( [0.5, -0.1,    1.0, 0.1,   1.0, -0.1] );
  drawTriangle( [-0.5, 0.1,    -1.0, 0.1,   -0.5, -0.1] );
  drawTriangle( [-0.5, -0.1,    -1.0, 0.1,   -1.0, -0.1] );

  // Head
  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
  drawTriangle( [-0.3, 0.1,    -0.3, 0.7,   0.3, 0.7] );
  drawTriangle( [-0.3, 0.1,    0.3, 0.7,   0.3, 0.1] );

  // Eyes
  gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0);
  drawTriangle( [-0.1, 0.6,    -0.1, 0.5,   -0.2, 0.55] );
  drawTriangle( [0.1, 0.6,    0.1, 0.5,   0.2, 0.55] );

  // Mouth
  gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0);
  drawTriangle( [-0.2, 0.2,    -0.2, 0.3,   0.2, 0.3] );
  drawTriangle( [-0.2, 0.2,    0.2, 0.3,   0.2, 0.2] );

  // Hat
  gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);
  drawTriangle( [0.0, 0.9,    -0.15, 0.7,   0.15, 0.7] );

}

function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  let [x, y] = convertCoordinatesEventToGL(ev);
  
  // Create and store the new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  
  /*
  // Store the coordinates to g_points array
  g_points.push([x, y]);
  
  // Store the color to g_points array
  g_colors.push(g_selectedColor.slice());

  // Store the size to the g sizes array
  g_sizes.push(g_selectedSize);
  */

  /*
  if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  }
  */

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

// Update the angles of everything if currently animated
function updateAnimationAngles() {
  if (g_yellowAnimation) {
    g_yellowAngle = (45*Math.sin(g_seconds));
  }
  if (g_magentaAnimation) {
    g_magentaAngle = (45*Math.sin(3*g_seconds));
  }
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

  // Pass the matrix to u_ModelMatrix attribute
  var gloablRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GloablRotateMatrix, false, gloablRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //var len = g_points.length;
  /*var len = g_shapesList.length;

  for(var i = 0; i < len; i++) {

    g_shapesList[i].render();
  
  }*/

  // Draw a test triangle
  // drawTriangle3D( [-1.0, 0.0, 0.0,    -0.5, -1.0, 0.0,   0.0, 0.0, 0.0] );

  // Draw the body cube
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.setTranslate(-0.25, -0.75, 0.0);
  body.matrix.rotate(-5, 1, 0, 0);
  body.matrix.scale(0.5, 0.3, 0.5);
  body.render();

  // Draw a left arm
  var leftArm = new Cube();
  leftArm.color = [1, 1, 0, 1];
  leftArm.matrix.setTranslate(0, -0.5, 0.0);
  leftArm.matrix.rotate(-5, 1, 0, 0);
  leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  //if (g_yellowAnimation) {
  //  leftArm.matrix.rotate(45*Math.sin(g_seconds), 0, 0, 1);
  //} else {
  //  leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  //}
  var yellowCoordinatesMatrix = new Matrix4(leftArm.matrix);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  leftArm.matrix.translate(-0.5, 0, 0);
  leftArm.render();

  // Test box
  var box = new Cube();
  box.color = [1, 0, 1, 1];
  box.matrix = yellowCoordinatesMatrix;
  box.matrix.translate(0, 0.65, 0);
  box.matrix.rotate(g_magentaAngle, 0, 0, 1);
  var purpleCoordinatesMatrix = new Matrix4(box.matrix);
  box.matrix.scale(0.3, 0.3, 0.3);
  box.matrix.translate(-0.5, 0, -0.001);
  box.render();

  // Draw the tube
  var tube = new Cylinder();
  tube.color = [0.0, 1.0, 0.0, 1.0];
  tube.matrix = purpleCoordinatesMatrix;
  tube.matrix.scale(0.3, 0.3, 0.3);
  tube.matrix.rotate(90, 1, 0, 0);
  tube.matrix.translate(-0.5, 0.0, -2.0);
  tube.render();
  
}