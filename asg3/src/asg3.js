// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float; // new
  attribute vec4 a_Position;
  attribute vec2 a_UV; // new
  varying vec2 v_UV; // new
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GloablRotateMatrix;
  uniform mat4 u_ViewMatrix; // new
  uniform mat4 u_ProjectionMatrix; // new
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GloablRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV; // new
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float; // new
  varying vec2 v_UV; // new 
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                   // Use color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);          // Use UV debug color
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);   // use texture0
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);   // use texture1
    } else {
      gl_FragColor = vec4(1, .2, .2, 1);            // Error put redish
    }
  }`

// Gloabl Variables
let canvas;
let gl;
let a_Position;
let a_UV; // new
let u_FragColor;
let u_whichTexture; // new
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix; // new
let u_ViewMatrix; // new
let u_GloablRotateMatrix
let u_Sampler0;
let u_Sampler1;

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

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
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

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
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

function initTextures() {
  var image = new Image(); // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendImageToTEXTURE0(0, u_Sampler0, image); };
  // Tell the browser to load an image
  image.src = '../media/sky_cloud.jpg';


  /**
   * Second Texture
   */
  var image2 = new Image(); // Create the image object
  if (!image2) {
    console.log('Failed to create the image2 object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image2.onload = function(){ sendImageToTEXTURE1(0, u_Sampler1, image2); };
  // Tell the browser to load an image
  image2.src = '../media/dirt.jpg';

  return true;
}

function sendImageToTEXTURE0(n, u_Sampler, image) {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture paramters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, 0);

  //console.log('finished sendImageToTEXTURE0');
}

function sendImageToTEXTURE1(n, u_Sampler, image) {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable textuyre unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture paramters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler, 1);

  //console.log('finished sendImageToTEXTURE0');
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


  document.onkeydown = keydown;

  initTextures();

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

function keydown(ev) {
  // var forwardVector = g_at.sub(g_eye);
  // var sideVectorLeft = Vector3.cross(g_up, forwardVector); // side vector towards left
  // var sideVectorRight = Vector3.cross(forwardVector, g_up); // side vector towards right
  
  if (ev.keyCode == 68) { // moveRight
    //g_eye[0] += 0.2;
    var forwardVector = new Vector3()
    forwardVector.set(g_at.sub(g_eye));
    forwardVector.normalize();
    var sideVectorRight = Vector3.cross(forwardVector, g_up);
    sideVectorRight.normalize();
    sideVectorRight.mul(0.1);
    g_eye.add(sideVectorRight);
    g_at.add(sideVectorRight);
  } else if (ev.keyCode == 65) { // moveLeft
    //g_eye[0] -= 0.2;
    var forwardVector = new Vector3()
    forwardVector.set(g_at.sub(g_eye));
    forwardVector.normalize();
    var sideVectorLeft = Vector3.cross(g_up, forwardVector);
    sideVectorLeft.normalize();
    sideVectorLeft.mul(0.1);
    g_eye.add(sideVectorLeft);
    g_at.add(sideVectorLeft);
  } else if (ev.keyCode == 87) { // moveForward
    var forwardVector = new Vector3();
    forwardVector.set(g_at.sub(g_eye));
    //forwardVector.set(g_at);
    //forwardVector.sub(g_eye);
    forwardVector.normalize();
    forwardVector.mul(0.1);
    g_eye.add(forwardVector);
    g_at.add(forwardVector);
  } else if (ev.keyCode == 83) { // moveBackward
    var forwardVector = new Vector3();
    forwardVector.set(g_at.sub(g_eye));
    //forwardVector.set(g_at);
    //forwardVector.sub(g_eye);
    forwardVector.normalize();
    forwardVector.mul(0.1);
    g_eye.sub(forwardVector);
    g_at.sub(forwardVector);
  } else if (ev.keyCode == 81) { // panLeft
    // TODO: NOT WORKING
    var forwardVector = new Vector3();
    forwardVector.set(g_at.sub(g_eye));

    var rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(5, 
      g_up.elements[0],
      g_up.elements[1],
      g_up.elements[2],
    );

    var f_prime =  new Vector3([0,0,0]);
    f_prime = rotationMatrix.multiplyVector3(forwardVector);

    // idk why i was getting black screen when using gloabl g_eye
    var new_eye = new Vector3();
    new_eye.set(g_eye);
    g_at.set(new_eye.add(f_prime));
  } else if (ev.keyCode == 69) { // panRight
    var forwardVector = new Vector3();
    forwardVector.set(g_at.sub(g_eye));

    var rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(-5, 
      g_up.elements[0],
      g_up.elements[1],
      g_up.elements[2],
    );

    var f_prime =  new Vector3([0,0,0]);
    f_prime = rotationMatrix.multiplyVector3(forwardVector);

    // idk why i was getting black screen when using gloabl g_eye
    var new_eye = new Vector3();
    new_eye.set(g_eye);
    g_at.set(new_eye.add(f_prime));
  }

  renderAllShapes();
  console.log(ev.keyCode);
}

var g_eye = new Vector3([0, 0, 3]);
var g_at = new Vector3([0,0,-100]);
var g_up = new Vector3([0,1,0]);

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(50, canvas.width/canvas.height, 0.1, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = new Matrix4();
  //viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[0]); // (eye, at, up)
  viewMat.setLookAt(
    g_eye.elements[0], g_eye.elements[1], g_eye.elements[2], 
    g_at.elements[0], g_at.elements[1], g_at.elements[2], 
    g_up.elements[0], g_up.elements[1], g_up.elements[0]); // (eye, at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

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

  var floor = new Cube();
  floor.color = [0.3, 0.5, 0.35, 1.0];
  floor.textureNum = -2;
  floor.matrix.translate(0, -.75, 0.0);
  floor.matrix.scale(100, 0, 100);
  floor.matrix.translate(-.5, 0, -.5);
  floor.render();

  var sky = new Cube();
  sky.color = [0.5, 0.9, 1, 1.0];
  sky.textureNum = 0;
  sky.matrix.translate(0, -.751, 0.0);
  sky.matrix.scale(1000, 1000, 1000);
  sky.matrix.translate(-.5, 0, -.5);
  sky.render();
  
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.textureNum = 1;
  body.matrix.setTranslate(-0.25, -0.75, 0.0);
  body.matrix.rotate(-5, 1, 0, 0);
  body.matrix.scale(0.5, 0.3, 0.5);
  body.render();

  // Draw a left arm
  var leftArm = new Cube();
  leftArm.color = [1, 1, 0, 1];
  leftArm.textureNum = -1;
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
  box.textureNum = 0;
  box.matrix = yellowCoordinatesMatrix;
  box.matrix.translate(0, 0.65, 0);
  box.matrix.rotate(g_magentaAngle, 0, 0, 1);
  var purpleCoordinatesMatrix = new Matrix4(box.matrix);
  box.matrix.scale(0.3, 0.3, 0.3);
  box.matrix.translate(-0.5, 0, -0.001);
  box.render();

  // Draw the tube
  /*var tube = new Cylinder();
  tube.color = [0.0, 1.0, 0.0, 1.0];
  tube.matrix = purpleCoordinatesMatrix;
  tube.matrix.scale(0.3, 0.3, 0.3);
  tube.matrix.rotate(90, 1, 0, 0);
  tube.matrix.translate(-0.5, 0.0, -2.0);
  tube.render();*/
  
  // #######################################################################
  // BEGINNING OF BLOCKY ANIMAL
  // #######################################################################

  // #######################################################################
  // END OF BLOCKY ANIMAL
  // #######################################################################

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