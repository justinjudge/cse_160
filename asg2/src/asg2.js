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

let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_globalAngleZ = 0;
let g_mouseDown = false;
let g_lastMouseX = null;
let g_lastMouseY = null;

// front legs
let g_upLegAAngle = 0;
let g_loLegAAngle = 0;
let g_footAAngle = 0;
let g_upLegA2Angle = 0;
let g_loLegA2Angle = 0;
let g_footA2Angle = 0;
// middle body
let g_bodyBAngle = 0;
let g_bodyDAngle = 0;
// back body
let g_bodyEAngle = 0;
// back legs
let g_upLegEAngle = 0;
let g_loLegEAngle = 0;
let g_footEAngle = 0;
let g_upLegE2Angle = 0;
let g_loLegE2Angle = 0;
let g_footE2Angle = 0;
// turret
let g_turrAngle = 0;


let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_regularAnimation = false;
let g_pokeAnimation = false;
let g_isMouseDown = false;
// let g_selectedSegments = 10;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // Button Events for Picture
  // document.getElementById('pictureButton').onclick = function() {beyondTheBasics();};

  // Button Events (Shapy Type)
  // document.getElementById('green').onclick = function() {g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  // document.getElementById('red').onclick = function() {g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  // document.getElementById('clearButton').onclick = function() {g_shapesList = []; renderAllShapes();};

  // document.getElementById('pointButton').onclick = function() {g_selectedType = POINT};
  // document.getElementById('triButton').onclick = function() {g_selectedType = TRIANGLE};
  // document.getElementById('circleButton').onclick = function() {g_selectedType = CIRCLE};

  // Slider Events
  // document.getElementById("redSlide").addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  // document.getElementById("greenSlide").addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  // document.getElementById("blueSlide").addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  // Transparency
  // document.getElementById("transSlide").addEventListener('mouseup', function() { g_selectedColor[3] = this.value/100; });

  // Button events
  document.getElementById('animationPokeOffButton').onclick = function() {g_pokeAnimation = false;};
  document.getElementById('animationPokeOnButton').onclick = function() {g_pokeAnimation = true;};
  document.getElementById('animationRegularOffButton').onclick = function() {g_regularAnimation = false;};
  document.getElementById('animationRegularOnButton').onclick = function() {g_regularAnimation = true;};

  // Angle Slider
  document.getElementById("angleXSlide").addEventListener('mousemove', function() { g_globalAngleX = this.value; renderAllShapes(); });
  document.getElementById("angleYSlide").addEventListener('mousemove', function() { g_globalAngleY = this.value; renderAllShapes(); });
  document.getElementById("angleZSlide").addEventListener('mousemove', function() { g_globalAngleZ = this.value; renderAllShapes(); });

  // Animal Joint Angle Sliders
  document.getElementById("upLegASlide").addEventListener('mousemove', function() { g_upLegAAngle = this.value; renderAllShapes(); });
  document.getElementById("loLegASlide").addEventListener('mousemove', function() { g_loLegAAngle = this.value; renderAllShapes(); });
  document.getElementById("footASlide").addEventListener('mousemove', function() { g_footAAngle = this.value; renderAllShapes(); });
  document.getElementById("upLegA2Slide").addEventListener('mousemove', function() { g_upLegA2Angle = this.value; renderAllShapes(); });
  document.getElementById("loLegA2Slide").addEventListener('mousemove', function() { g_loLegA2Angle = this.value; renderAllShapes(); });
  document.getElementById("gootA2Slide").addEventListener('mousemove', function() { g_footA2Angle = this.value; renderAllShapes(); });

  document.getElementById("bodyBSlide").addEventListener('mousemove', function() { g_bodyBAngle = this.value; renderAllShapes(); });
  document.getElementById("bodyDSlide").addEventListener('mousemove', function() { g_bodyDAngle = this.value; renderAllShapes(); });

  document.getElementById("bodyESlide").addEventListener('mousemove', function() { g_bodyEAngle = this.value; renderAllShapes(); });

  document.getElementById("upLegESlide").addEventListener('mousemove', function() { g_upLegEAngle = this.value; renderAllShapes(); });
  document.getElementById("loLegESlide").addEventListener('mousemove', function() { g_loLegEAngle = this.value; renderAllShapes(); });
  document.getElementById("footESlide").addEventListener('mousemove', function() { g_footEAngle = this.value; renderAllShapes(); });
  document.getElementById("upLegE2Slide").addEventListener('mousemove', function() { g_upLegE2Angle = this.value; renderAllShapes(); });
  document.getElementById("loLegE2Slide").addEventListener('mousemove', function() { g_loLegE2Angle = this.value; renderAllShapes(); });
  document.getElementById("gootE2Slide").addEventListener('mousemove', function() { g_footE2Angle = this.value; renderAllShapes(); });

  document.getElementById("turrSlide").addEventListener('mousemove', function() { g_turrAngle = this.value; renderAllShapes(); });


  // Yellow Slider
  // document.getElementById("yellowSlide").addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });

  // Magenta Slider
  // document.getElementById("magentaSlide").addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); });

  // Mouse Control
  document.getElementById("webgl").addEventListener('mousedown', function(ev) {
    g_mouseDown = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  });

  document.getElementById("webgl").addEventListener('mousemove', function(ev) {
    if (!g_mouseDown) {
      return;
    };

    let dx = ev.clientX - g_lastMouseX;
    let dy = ev.clientY - g_lastMouseY;

    g_globalAngleX -= dx * 0.5; // 0.5 too fast?
    g_globalAngleY -= dy * 0.5;

    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;

    renderAllShapes();
  });

  document.getElementById("webgl").addEventListener('mouseup', function(ev) {
    g_mouseDown = false;
  });

  // Shift click control
  document.getElementById("webgl").addEventListener('click', function(ev) {
    if (ev.shiftKey) {
      g_pokeAnimation = true;
    }
    renderAllShapes(); 
  });



  // Size Slider Events
  // document.getElementById("sizeSlide").addEventListener('mouseup', function() { g_selectedSize = this.value; });
  // document.getElementById("segmentSlide").addEventListener('mouseup', function() { g_selectedSegments = this.value; });
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
  if (g_pokeAnimation) {
    // g_yellowAngle = (45*Math.sin(g_seconds));
    // turret
    g_turrAngle = (360*Math.sin(3*g_seconds));

  }
  if (g_regularAnimation) {
    //g_magentaAngle = (45*Math.sin(3*g_seconds));

    g_upLegAAngle = 0.75*(90*Math.sin(3*g_seconds));
    g_loLegAAngle = 0.75*(-90*Math.sin(3*g_seconds));
    g_footAAngle = (0.5*(45*Math.cos(3*g_seconds)));
    g_upLegA2Angle = 0.75*(-90*Math.sin(3*g_seconds));
    g_loLegA2Angle = 0.75*(90*Math.sin(3*g_seconds));
    g_footA2Angle = -(0.5*45*Math.cos(3*g_seconds));
    // middle body
    g_bodyBAngle = 0.3*(45*Math.sin(3*g_seconds));
    g_bodyDAngle = 0.5*(45*Math.sin(3*g_seconds));
    // back body
    g_bodyEAngle = 0.1*(45*Math.sin(3*g_seconds));
    // back legs
    g_upLegEAngle = 0.75*(90*Math.sin(3*g_seconds));
    g_loLegEAngle = 0.75*(-90*Math.sin(3*g_seconds));
    g_footEAngle = 0.5*(45*Math.cos(3*g_seconds));
    g_upLegE2Angle = 0.75*(-90*Math.sin(3*g_seconds));
    g_loLegE2Angle = 0.75*(90*Math.sin(3*g_seconds));
    g_footE2Angle = -0.5*(45*Math.cos(3*g_seconds));
    // turret
    g_turrAngle = (45*Math.sin(3*g_seconds));
  }
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var gloablRotMat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0);
  gloablRotMat.rotate(g_globalAngleY, 1, 0, 0);
  gloablRotMat.rotate(g_globalAngleZ, 0, 0, 1);

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
  /*
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
  */

  // #######################################################################
  // FRONT BODY A
  // #######################################################################

  /**
   *  Draw Front Body
   */
  var bodyA = new Cube();
  bodyA.color = [1, 0.733, 0, 1];
  bodyA.matrix.setTranslate(-0.6, 0, 0);
  var bodyACoordinatesMatrix = new Matrix4(bodyA.matrix);
  var bodyA2CoordinatesMatrix = new Matrix4(bodyA.matrix);
  var bodyA3CoordinatesMatrix = new Matrix4(bodyA.matrix);
  bodyA.matrix.scale(0.3, 0.3, 0.3);
  bodyA.render();

  /**
   *  Draw Upper Leg BodyA
   */
  var upLegA = new Cube();
  upLegA.color = [0.443, 0.459, 0, 1];
  upLegA.matrix = bodyACoordinatesMatrix;
  upLegA.matrix.translate(0.1, 0.15, -0.1);
  upLegA.matrix.rotate(g_upLegAAngle, 0, 0, 1);
  var upLegACoordinatesMatrix = new Matrix4(upLegA.matrix);
  upLegA.matrix.scale(0.1, -0.3, 0.1);
  upLegA.render();

  /**
   *  Draw Lower Leg BodyA
   */
  var loLegA = new Cube();
  loLegA.color = [0.443, 0.459, 0, 1];
  loLegA.matrix = upLegACoordinatesMatrix;
  loLegA.matrix.translate(0.0, -0.3, 0.0);
  loLegA.matrix.rotate(g_loLegAAngle, 0, 0, 1);
  var loLegACoordinatesMatrix = new Matrix4(loLegA.matrix);
  loLegA.matrix.scale(0.1, -0.3, 0.1);
  loLegA.render();

  /**
   *  Draw Foot BodyA
   */
  var footA = new Cube();
  footA.color = [0.443, 0.459, 0, 1];
  footA.matrix = loLegACoordinatesMatrix;
  footA.matrix.translate(0.1, -0.4, 0.0);
  footA.matrix.rotate(g_footAAngle, 0, 0, 1);
  footA.matrix.scale(-0.3, 0.1, 0.1);
  footA.render();

  /**
   *  Draw Upper RIGHT Leg BodyA
   */
  var upLegA2 = new Cube();
  upLegA2.color = [0.443, 0.459, 0, 1];
  upLegA2.matrix = bodyA2CoordinatesMatrix;
  upLegA2.matrix.translate(0.1, 0.15, 0.3);
  upLegA2.matrix.rotate(g_upLegA2Angle, 0, 0, 1);
  var upLegA2CoordinatesMatrix = new Matrix4(upLegA2.matrix);
  upLegA2.matrix.scale(0.1, -0.3, 0.1);
  upLegA2.render();

  
  /**
   *  Draw Lower RIGHT Leg BodyA
   */
  var loLegA2 = new Cube();
  loLegA2.color = [0.443, 0.459, 0, 1];
  loLegA2.matrix = upLegA2CoordinatesMatrix;
  loLegA2.matrix.translate(0.0, -0.3, 0.0);
  loLegA2.matrix.rotate(g_loLegA2Angle, 0, 0, 1);
  var loLegA2CoordinatesMatrix = new Matrix4(loLegA2.matrix);
  loLegA2.matrix.scale(0.1, -0.3, 0.1);
  loLegA2.render();
  
  /**
   *  Draw Foot RIGHT BodyA
   */
  var footA2 = new Cube();
  footA2.color = [0.443, 0.459, 0, 1];
  footA2.matrix = loLegA2CoordinatesMatrix;
  footA2.matrix.translate(0.1, -0.4, 0.0);
  footA2.matrix.rotate(g_footA2Angle, 0, 0, 1);
  footA2.matrix.scale(-0.3, 0.1, 0.1);
  footA2.render();

  // #######################################################################
  // MIDDLE BODY B
  // #######################################################################

  /**
   *  Draw Front Cylinder Body B
   */
  var bodyB = new Cylinder();
  bodyB.color = [0.443, 0.459, 0, 1];
  bodyB.matrix = bodyA3CoordinatesMatrix;
  bodyB.matrix.translate(0.25, 0.05, 0.25);
  bodyB.matrix.rotate(90, 0, 1, 0);
  bodyB.matrix.rotate(g_bodyBAngle, 0, 1, 0);
  var bodyBCoordinatesMatrix = new Matrix4(bodyB.matrix);
  var bodyB2CoordinatesMatrix = new Matrix4(bodyB.matrix);
  bodyB.matrix.scale(0.2, 0.2, 0.2);
  bodyB.render();

  /**
   *  Draw Middle Body C
   */
  var bodyC = new Cube();
  bodyC.color = [1, 0.733, 0, 1];
  bodyC.matrix = bodyBCoordinatesMatrix;
  bodyC.matrix.translate(-0.05, -0.05, 0.2);
  var bodyCCoordinatesMatrix = new Matrix4(bodyC.matrix);
  var bodyC2CoordinatesMatrix = new Matrix4(bodyC.matrix);
  //bodyC.matrix.rotate(90, 0, 1, 0);
  //bodyC.matrix.rotate(g_magentaAngle, 0, 1, 0);
  bodyC.matrix.scale(0.3, 0.3, 0.3);
  bodyC.render();

  /**
   *  Draw Back Cylinder Body D
   */
  var bodyD = new Cylinder();
  bodyD.color = [0.443, 0.459, 0, 1];
  bodyD.matrix = bodyCCoordinatesMatrix;
  bodyD.matrix.translate(0.05, 0.05, 0.25);
  //bodyD.matrix.rotate(90, 0, 1, 0);
  bodyD.matrix.rotate(g_bodyDAngle, 0, 1, 0);
  var bodyDCoordinatesMatrix = new Matrix4(bodyD.matrix);
  var bodyD2CoordinatesMatrix = new Matrix4(bodyD.matrix);
  bodyD.matrix.scale(0.2, 0.2, 0.2);
  bodyD.render();

  // #######################################################################
  // Back BODY E
  // #######################################################################

  /**
   *  Draw Back Body E
   */
  var bodyE = new Cube();
  bodyE.color = [1, 0.733, 0, 1];
  bodyE.matrix = bodyDCoordinatesMatrix;
  bodyE.matrix.translate(-0.05, -0.05, 0.2);
  //bodyE.matrix.rotate(90, 0, 1, 0);
  bodyE.matrix.rotate(g_bodyEAngle, 0, 1, 0);
  var bodyECoordinatesMatrix = new Matrix4(bodyE.matrix);
  var bodyE2CoordinatesMatrix = new Matrix4(bodyE.matrix);
  var bodyE3CoordinatesMatrix = new Matrix4(bodyE.matrix);
  bodyE.matrix.scale(0.3, 0.3, 0.3);
  bodyE.render();

  /**
   *  Draw Upper Leg BodyE
   */
  var upLegE = new Cube();
  upLegE.color = [0.443, 0.459, 0, 1];
  upLegE.matrix = bodyECoordinatesMatrix;
  upLegE.matrix.translate(0.0, 0.15, 0.1);
  upLegE.matrix.rotate(-90, 0, 1, 0);
  upLegE.matrix.rotate(g_upLegEAngle, 0, 0, 1);
  var upLegECoordinatesMatrix = new Matrix4(upLegE.matrix);
  upLegE.matrix.scale(0.1, -0.3, 0.1);
  upLegE.render();

  /**
   *  Draw Lower Leg BodyE
   */
  var loLegE = new Cube();
  loLegE.color = [0.443, 0.459, 0, 1];
  loLegE.matrix = upLegECoordinatesMatrix;
  loLegE.matrix.translate(0.0, -0.3, 0.0);
  loLegE.matrix.rotate(g_loLegEAngle, 0, 0, 1);
  var loLegECoordinatesMatrix = new Matrix4(loLegE.matrix);
  loLegE.matrix.scale(0.1, -0.3, 0.1);
  loLegE.render();

  /**
   *  Draw Foot BodyA
   */
  var footE = new Cube();
  footE.color = [0.443, 0.459, 0, 1];
  footE.matrix = loLegECoordinatesMatrix;
  footE.matrix.translate(0.1, -0.4, 0.0);
  footE.matrix.rotate(g_footEAngle, 0, 0, 1);
  footE.matrix.scale(-0.3, 0.1, 0.1);
  footE.render();

  /**
   *  Draw Upper RIGHT Leg BodyA
   */
  var upLegE2 = new Cube();
  upLegE2.color = [0.443, 0.459, 0, 1];
  upLegE2.matrix = bodyE2CoordinatesMatrix;
  upLegE2.matrix.translate(0.4, 0.15, 0.1);
  upLegE2.matrix.rotate(-90, 0, 1, 0);
  upLegE2.matrix.rotate(g_upLegE2Angle, 0, 0, 1);
  var upLegE2CoordinatesMatrix = new Matrix4(upLegE2.matrix);
  upLegE2.matrix.scale(0.1, -0.3, 0.1);
  upLegE2.render();

  /**
   *  Draw Lower RIGHT Leg BodyE
   */
  var loLegE2 = new Cube();
  loLegE2.color = [0.443, 0.459, 0, 1];
  loLegE2.matrix = upLegE2CoordinatesMatrix;
  loLegE2.matrix.translate(0.0, -0.3, 0.0);
  loLegE2.matrix.rotate(g_loLegE2Angle, 0, 0, 1);
  var loLegE2CoordinatesMatrix = new Matrix4(loLegE2.matrix);
  loLegE2.matrix.scale(0.1, -0.3, 0.1);
  loLegE2.render();

  /**
   *  Draw Foot RIGHT BodyE
   */
  var footE2 = new Cube();
  footE2.color = [0.443, 0.459, 0, 1];
  footE2.matrix = loLegE2CoordinatesMatrix;
  footE2.matrix.translate(0.1, -0.4, 0.0);
  footE2.matrix.rotate(g_footE2Angle, 0, 0, 1);
  footE2.matrix.scale(-0.3, 0.1, 0.1);
  footE2.render();

  // #######################################################################
  // Back BODY E Turret
  // #######################################################################

  /**
   *  Draw Body Turret Cylinder turrF
   */
  var turrF = new Cylinder();
  turrF.color = [.729, 0, 0, 1];
  turrF.matrix = bodyE3CoordinatesMatrix;
  turrF.matrix.translate(0.05, 0.3, 0.25);
  turrF.matrix.rotate(-90, 1, 0, 0);
  // turrF.matrix.rotate(g_magentaAngle, 0, 0, 1);
  var turrFCoordinatesMatrix = new Matrix4(turrF.matrix);
  turrF.matrix.scale(0.2, 0.2, 0.2);
  turrF.render();

  /**
   *  Draw Body Barrel Cylinder barrF
   */
  var barrF = new Cylinder();
  barrF.color = [0.82, .294, 0.349, 1];
  barrF.matrix = turrFCoordinatesMatrix;
  barrF.matrix.translate(0.05, 0.15, 0.15);
  barrF.matrix.rotate(-90, 1, 0, 0);
  barrF.matrix.rotate(g_turrAngle, 0, 1, 0);
  var barrFCoordinatesMatrix = new Matrix4(barrF.matrix);
  barrF.matrix.scale(0.1, 0.1, 0.5);
  barrF.render();

  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration)/10, "performance");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}