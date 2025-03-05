// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float; // new
  attribute vec4 a_Position;
  attribute vec2 a_UV; // new
  attribute vec3 a_Normal; // new asg4
  varying vec2 v_UV; // new
  varying vec3 v_Normal; // new asg4
  varying vec4 v_VertPos; // new asg4
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix; // new asg4
  uniform mat4 u_GloablRotateMatrix;
  uniform mat4 u_ViewMatrix; // new
  uniform mat4 u_ProjectionMatrix; // new
  uniform vec3 u_AmbientLightColor; // new asg4
  uniform vec3 u_SpotLightPosition; // new asg4
  uniform vec3 u_SpotLightDirection; //new asg4
  uniform float u_SpotLightCutoff; // new asg4
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GloablRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV; // new
    //v_Normal = a_Normal;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1))); // new asg4
    v_VertPos = u_ModelMatrix * a_Position; // new asg4
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float; // new
  varying vec2 v_UV; // new 
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos; // new asg4
  uniform vec3 u_cameraPos; // new asg4
  uniform bool u_lightOn; // new asg4
  varying vec4 v_VertPos; // new asg4
  uniform vec3 u_AmbientLightColor; // new asg4
  uniform vec3 u_SpotLightPosition; // new asg4
  uniform vec3 u_SpotLightDirection; //new asg4
  uniform float u_SpotLightCutoff; // new asg4
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0); // use normal direction
    } else if (u_whichTexture == -2) {
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

    // -------------------- Point Light
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    // Red/Green DIstance Visualization
    // if (r < 1.0) {
    //   gl_FragColor = vec4(1,0,0,1);
    // } else if (r < 2.0) {
    //   gl_FragColor = vec4(0,1,0,1); 
    // }

    // Light Falloff Visualization 1/r^2
    // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    // Reflection
    vec3 R = reflect(-L, N);

    // eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    // Specular
    float specular = pow(max(dot(E,R), 0.0), 100.0);

    vec3 diffuse = vec3(gl_FragColor) * nDotL;
    vec3 ambient = vec3(gl_FragColor) * 0.3 * u_AmbientLightColor;

    if (u_lightOn) {
      if (u_whichTexture >= 0) {
        gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
      } else {
        gl_FragColor = vec4(diffuse+ambient, 1.0);
      }
    }

    // -------------------- Spotlight
    vec3 spotlightVector = u_SpotLightPosition - vec3(v_VertPos);
    float r2 = length(spotlightVector);

    // N dot L
    vec3 L2 = normalize(spotlightVector);
    vec3 N2 = normalize(v_Normal);

    float theta = dot(L2, normalize(u_SpotLightDirection));
    float epsilon = u_SpotLightCutoff - 0.1; // new asg4
    float spotLightEffect = 0.0;
    if (theta > 0.707) {
      spotLightEffect = 1.0;
    }
    float nDotL2 = max(dot(N2,L2), 0.0);

    // Reflection
    vec3 R2 = reflect(-L2, N2);

    // eye
    vec3 E2 = normalize(u_cameraPos - vec3(v_VertPos));

    // Specular
    float specular2 = pow(max(dot(E2,R2), 0.0), 100.0);

    vec3 diffuse2 = vec3(gl_FragColor) * nDotL2 * spotLightEffect;
    vec3 ambient2 = vec3(gl_FragColor) * 0.3;

    if (u_lightOn) {
      if (u_whichTexture >= 0) {
        gl_FragColor = vec4(specular2+diffuse2+ambient2, 1.0);
      } else {
        gl_FragColor = vec4(diffuse2+ambient2, 1.0);
      }
    }
  }`

// Gloabl Variables
let canvas;
let gl;
let a_Position;
let a_UV; // new
let a_Normal; // new asg4
let u_FragColor;
let u_whichTexture; // new
let u_Size;
let u_ModelMatrix;
let u_NormalMatrix; // new asg4
let u_ProjectionMatrix; // new
let u_ViewMatrix; // new
let u_GloablRotateMatrix
let u_Sampler0;
let u_Sampler1;
let u_lightPos; // new asg4
let u_cameraPos; // new asg4
let u_lightOn; // new asg4
let u_AmbientLightColor; // new asg4
let u_SpotLightPosition; // new asg4
let u_SpotLightDirection; // new asg4
//let u_SpotLightCutoff; // new asg4

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

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_FragColor
  u_AmbientLightColor = gl.getUniformLocation(gl.program, 'u_AmbientLightColor');
  if (!u_AmbientLightColor) {
    console.log('Failed to get the storage location of u_AmbientLightColor');
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

  // Get the storage location of u_NormalMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
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

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_SpotLightPosition
  u_SpotLightPosition = gl.getUniformLocation(gl.program, 'u_SpotLightPosition');
  if (!u_SpotLightPosition) {
    console.log('Failed to get the storage location of u_SpotLightPosition');
    return;
  }

  // Get the storage location of u_SpotLightDirection
  u_SpotLightDirection = gl.getUniformLocation(gl.program, 'u_SpotLightDirection');
  if (!u_SpotLightDirection) {
    console.log('Failed to get the storage location of u_SpotLightDirection');
    return;
  }

  // Get the storage location of u_SpotLightCutoff
  //u_SpotLightCutoff = gl.getUniformLocation(gl.program, 'u_SpotLightCutoff');
  //if (!u_SpotLightCutoff) {
  //  console.log('Failed to get the storage location of u_SpotLightCutoff');
  //  return;
  //}

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
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
let g_regularAnimation = true;
let g_pokeAnimation = false;
let g_isMouseDown = false;
// let g_selectedSegments = 10;

let g_normalOn = false;
let g_lightPos = [0, 1, -2];
let g_lightOn = true;
let g_lightMove = true;
let g_AmbientLightColor = [1.0, 1.0, 1.0];

let g_SpotLightPosition = [0, 1, -2]; // new asg4
let g_SpotLightDirection = [0.0, 1.0, 0.0]; // new asg4
//let g_SpotLightCutoff = 1; // new asg4


// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

  // Button Events
  document.getElementById('normalOn').onclick = function() {g_normalOn=true;};
  document.getElementById('normalOff').onclick = function() {g_normalOn=false;};
  document.getElementById('lightOn').onclick = function() {g_lightOn=true;};
  document.getElementById('lightOff').onclick = function() {g_lightOn=false;};
  document.getElementById('lightMove').onclick = function() {g_lightMove=true;};

  // Light Sliders
  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightMove = false; g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightPos[2] = this.value/100; renderAllShapes();}});

  // SpotLight Sliders
  document.getElementById('spotlightSlideX').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightMove = false; g_SpotLightPosition[0] = this.value/100; renderAllShapes();}});
  document.getElementById('spotlightSlideY').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_SpotLightPosition[1] = this.value/100; renderAllShapes();}});
  document.getElementById('spotlightSlideZ').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_SpotLightPosition[2] = this.value/100; renderAllShapes();}});

  // Ambient Light Controls
  document.getElementById("redSlide").addEventListener('mouseup', function() { g_AmbientLightColor[0] = this.value/100; });
  document.getElementById("greenSlide").addEventListener('mouseup', function() { g_AmbientLightColor[1] = this.value/100; });
  document.getElementById("blueSlide").addEventListener('mouseup', function() { g_AmbientLightColor[2] = this.value/100; });

  // Stop menu from opening up
  document.addEventListener("contextmenu", function(event) { event.preventDefault(); });

  // Mouse Control
  document.getElementById("webgl").addEventListener('mousedown', function(ev) {
    g_mouseDown = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;

    //console.log("g", g_eye.elemnts[0]);
    //g_map[g_eye.elements[0]][g_eye.elements[1]] = 1;
  });

  document.getElementById("webgl").addEventListener('mousemove', function(ev) {
    if (!g_mouseDown) {
      return;
    };

    let dx = ev.clientX - g_lastMouseX;
    //let dy = ev.clientY - g_lastMouseY;

    //g_globalAngleX -= dx * 0.5; // 0.5 too fast?
    //g_globalAngleY -= dy * 0.5;

    var forwardVector = new Vector3();
    forwardVector.set(g_at);
    forwardVector.sub(g_eye);
    //forwardVector.set(g_at.sub(g_eye));

    var rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(-dx * .7, 
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

    

    g_lastMouseX = ev.clientX;
    //g_lastMouseY = ev.clientY;

    //renderAllShapes();
  });

  // Edit g_map if user click to add block.
  document.getElementById("webgl").addEventListener('mousedown', function(ev) {
    if (ev.button === 0) { // 0 indicates the left mouse button
      console.log("Left mouse button is down");

      /*var forwardVector = new Vector3();
      forwardVector.set(g_at);
      forwardVector.sub(g_eye);
      forwardVector.normalize();
      forwardVector.mul(1);
      var temp_eye = new Vector3();
      temp_eye.set(g_eye);
      temp_eye.add(forwardVector);*/

      g_map[Math.round(g_eye.elements[0]) + 8][Math.round(g_eye.elements[2]) + 8] = 1;
    } else if (ev.button === 2) {
      console.log("Right mouse button is down");

      /*var forwardVector = new Vector3();
      forwardVector.set(g_at);
      forwardVector.sub(g_eye);
      forwardVector.normalize();
      forwardVector.mul(1);
      var temp_eye = new Vector3();
      temp_eye.set(g_eye);
      temp_eye.add(forwardVector);*/

      g_map[Math.round(g_eye.elements[0]) + 8][Math.round(g_eye.elements[2]) + 8] = 0;
    }
  });

  document.getElementById("webgl").addEventListener('mouseup', function(ev) {
    //g_mouseDown = false;
  });

  // Shift click control
  /*document.getElementById("webgl").addEventListener('click', function(ev) {
    if (ev.shiftKey) {
      g_pokeAnimation = true;
    }
    renderAllShapes(); 
  });*/



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
  //canvas.onmousedown = click;
  //canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };


  // document.onkeydown = keydown;
  document.addEventListener("keydown", keydown);

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
  //console.log(g_seconds);

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
  // let [x, y] = convertCoordinatesEventToGL(ev);
  
  // Create and store the new point
  /*let point;
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
  g_shapesList.push(point);*/
  
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
  //drawMap();
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

  if (g_lightMove) {
    g_lightPos[0] = 5* Math.cos(g_seconds);
  }
}

function keydown(ev) {
  //debugger;
  // var forwardVector = g_at.sub(g_eye);
  // var sideVectorLeft = Vector3.cross(g_up, forwardVector); // side vector towards left
  // var sideVectorRight = Vector3.cross(forwardVector, g_up); // side vector towards right

  /*
  0 velocity vector outside
  modify velocitiy in conditionals
  add eye and after conditionals
  */
  // forwardvector
  var forwardVector = new Vector3()
  forwardVector.set(g_at);
  forwardVector.sub(g_eye);
  forwardVector.normalize();
  forwardVector.mul(0.1);
  var sideVectorRight = new Vector3();
  sideVectorRight.set(Vector3.cross(forwardVector, g_up));
  sideVectorRight.normalize();
  sideVectorRight.mul(0.1);

  //var velocityVector = new Vector3((0, 0, 0))
  
  if (ev.keyCode == 68) { // moveRight
    //g_eye[0] += 0.2;
    /*var forwardVector = new Vector3()
    forwardVector.set(g_at.sub(g_eye));
    forwardVector.normalize();*/
    /*var sideVectorRight = Vector3.cross(forwardVector, g_up);
    sideVectorRight.normalize();
    sideVectorRight.mul(0.1);*/
    g_eye.add(sideVectorRight);
    g_at.add(sideVectorRight);
    //velocityVector.elements[0] = .1
  }
  if (ev.keyCode == 65) { // moveLeft
    //g_eye[0] -= 0.2;
    /*var forwardVector = new Vector3()
    forwardVector.set(g_at.sub(g_eye));
    forwardVector.normalize();*/
    /*var sideVectorLeft = Vector3.cross(g_up, forwardVector);
    sideVectorLeft.normalize();
    sideVectorLeft.mul(0.1);*/
    //g_eye.add(sideVectorLeft);
    //g_at.add(sideVectorLeft);
    g_eye.sub(sideVectorRight);
    g_at.sub(sideVectorRight);
    //velocityVector.elements[0] = -.1
  }
  if (ev.keyCode == 87) { // moveForward
    /*var forwardVector = new Vector3();
    forwardVector.set(g_at.sub(g_eye));
    //forwardVector.set(g_at);
    //forwardVector.sub(g_eye);
    forwardVector.normalize();*/
    //forwardVector.mul(0.1);
    g_eye.add(forwardVector);
    g_at.add(forwardVector);
    //velocityVector.elements[2] = -.1
  }
  if (ev.keyCode == 83) { // moveBackward
    /*var forwardVector = new Vector3();
    forwardVector.set(g_at.sub(g_eye));
    //forwardVector.set(g_at);
    //forwardVector.sub(g_eye);
    forwardVector.normalize();*/
    //forwardVector.mul(0.1);
    g_eye.sub(forwardVector);
    g_at.sub(forwardVector);
    //velocityVector.elements[2] = .1
  }
  //g_eye.add(velocityVector);
  //g_at.add(velocityVector);
  if (ev.keyCode == 81) { // panLeft
    //var forwardVector = new Vector3();
    //forwardVector.set(g_at.sub(g_eye));

    var rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(5, 
      g_up.elements[0],
      g_up.elements[1],
      g_up.elements[2],
    );
    //rotationMatrix.setRotate(5, g_up);

    var f_prime =  new Vector3([0,0,0]);
    f_prime = rotationMatrix.multiplyVector3(forwardVector);

    // idk why i was getting black screen when using gloabl g_eye
    var new_eye = new Vector3();
    new_eye.set(g_eye);
    g_at.set(new_eye.add(f_prime));
  }
  if (ev.keyCode == 69) { // panRight
    //var forwardVector = new Vector3();
    //forwardVector.set(g_at.sub(g_eye));

    var rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(-5, 
      g_up.elements[0],
      g_up.elements[1],
      g_up.elements[2],
    );
    //rotationMatrix.setRotate(-5, g_up);

    var f_prime =  new Vector3([0,0,0]);
    f_prime = rotationMatrix.multiplyVector3(forwardVector);

    // idk why i was getting black screen when using gloabl g_eye
    var new_eye = new Vector3();
    new_eye.set(g_eye);
    g_at.set(new_eye.add(f_prime));
  }

  //renderAllShapes();
  //console.log(ev.keyCode);
}

var g_eye = new Vector3([0, 2, 3]);
var g_at = new Vector3([0,0,-100]);
var g_up = new Vector3([0,1,0]);

/*let g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 2, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];*/

let g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

function drawWholeMap() {
  // debugger;
  var body = new Cube();
  body.color = [1.0, 1.0, 1.0, 1.0];
  body.textureNum = 1;
  //body.color = [1.0, 1.0, 1.0, 1.0];
  //body.textureNum = 1;
  for (x = 0; x < g_map.length; x++) {
    for (y = 0; y < g_map[0].length; y++) {
      if (g_map[x][y] > 0) {
        //var body = new Cube();

        //console.log(x, y);
        //body.matrix.setIdentity();
        if (g_map[x][y] >= 3) {
          /*var body = new Cube();
          body.color = [1.0, 1.0, 1.0, 1.0];
          body.textureNum = 1;*/
          body.matrix.setTranslate(x-8, 1.25, y-8);
          //body.render();
        } else if (g_map[x][y] >= 2) {
          /*var body = new Cube();
          body.color = [1.0, 1.0, 1.0, 1.0];
          body.textureNum = 1;*/
          body.matrix.setTranslate(x-8, 0.25, y-8);
          //body.render();
        } else if (g_map[x][y] >= 1) {
          /*var body = new Cube();
          body.color = [1.0, 1.0, 1.0, 1.0];
          body.textureNum = 1;*/
          body.matrix.setTranslate(x-8, -.75, y-8);
          //body.render();
        }

        body.render();
      }
    }
  }
}

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



  // Pass the light position for GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  // Pass the spotlight position for GLSL
  gl.uniform3f(u_SpotLightPosition, g_SpotLightPosition[0], g_SpotLightPosition[1], g_SpotLightPosition[2]);

  // Pass the spotlight position for GLSL
  gl.uniform3f(u_SpotLightDirection, g_SpotLightDirection[0], g_SpotLightDirection[1], g_SpotLightDirection[2]);

  // Pass the light status for GLSL
  //gl.uniform1i(u_SpotLightCutoff, g_SpotLightCutoff);

  // Pass the camera position for GLSL
  gl.uniform3f(u_cameraPos, g_eye.elements[0], g_eye.elements[1], g_eye.elements[2]);

  // Pass the light status for GLSL
  gl.uniform1i(u_lightOn, g_lightOn);

  // Pass the Ambient Light Color
  gl.uniform3f(u_AmbientLightColor, g_AmbientLightColor[0], g_AmbientLightColor[1], g_AmbientLightColor[2]);

  // Draw the light
  var light = new Cube();
  light.color = [2,2,0,1];
  light.textureNum = -2;
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(-.5,-.5,-.5);
  light.render();

  // Draw the light
  var spotlight = new Cube();
  spotlight.color = [2,2,0,1];
  spotlight.textureNum = -2;
  spotlight.matrix.translate(g_SpotLightPosition[0], g_SpotLightPosition[1], g_SpotLightPosition[2]);
  spotlight.matrix.scale(-.1,-.1,-.1);
  spotlight.matrix.translate(-.5,-.5,-.5);
  spotlight.render();

  // Draw the body cube
  var floor = new Cube();
  floor.color = [0.3, 0.5, 0.35, 1.0];
  floor.textureNum = -2;
  if (g_normalOn) floor.textureNum = -3;
  floor.matrix.translate(0, -.75, 0.0);
  floor.matrix.scale(100, 0, 100);
  floor.matrix.translate(-.5, 0, -.5);
  floor.render();

  var sky = new Cube();
  sky.color = [0.5, 0.9, 1, 1.0];
  sky.textureNum = -2;
  if (g_normalOn) sky.textureNum = -3;
  sky.matrix.translate(0, -1, 0.0);
  sky.matrix.scale(-20, -20, -20);
  sky.matrix.translate(-.5, -1, -.5);
  sky.render();

  var box = new Sphere();
  //box.color = [0.5, 0.9, 1, 1.0];
  box.textureNum = 1;
  if (g_normalOn) box.textureNum = -3;
  //box.matrix.translate(0, -1, 0.0);
  box.matrix.scale(1, 1, 1);
  box.matrix.translate(-2, 0, -4);
  box.normalMatrix.setInverseOf(box.matrix).transpose();
  box.render();

  var box = new Cube();
  //box.color = [0.5, 0.9, 1, 1.0];
  box.textureNum = 1;
  if (g_normalOn) box.textureNum = -3;
  //box.matrix.translate(0, -1, 0.0);
  box.matrix.scale(1, 1, 1);
  box.matrix.translate(2, 0, -4);
  box.normalMatrix.setInverseOf(box.matrix).transpose();
  box.render();

  // drawMap();
  //drawWholeMap();

  drawBlockyAnimal();
  
  /*var body = new Cube();
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
  box.render();*/

  // Draw the tube
  /*var tube = new Cylinder();
  tube.color = [0.0, 1.0, 0.0, 1.0];
  tube.matrix = purpleCoordinatesMatrix;
  tube.matrix.scale(0.3, 0.3, 0.3);
  tube.matrix.rotate(90, 1, 0, 0);
  tube.matrix.translate(-0.5, 0.0, -2.0);
  tube.render();*/

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

function drawBlockyAnimal() {
  // #######################################################################
  // BEGINNING OF BLOCKY ANIMAL
  // #######################################################################

  // #######################################################################
  // FRONT BODY A
  // #######################################################################

  /**
   *  Draw Front Body
   */
  var bodyA = new Cube();
  bodyA.color = [1, 0.733, 0, 1];
  bodyA.textureNum = -2;
  if (g_normalOn) bodyA.textureNum = -3;
  //bodyA.matrix.setTranslate(-0.6 - 0, -.2, 0);
  bodyA.matrix.setTranslate(0, 0, -4);
  var bodyACoordinatesMatrix = new Matrix4(bodyA.matrix);
  var bodyA2CoordinatesMatrix = new Matrix4(bodyA.matrix);
  var bodyA3CoordinatesMatrix = new Matrix4(bodyA.matrix);
  bodyA.matrix.scale(0.3, 0.3, 0.3);
  bodyA.normalMatrix.setInverseOf(bodyA.matrix).transpose();
  bodyA.render();

  /**
   *  Draw Upper Leg BodyA
   */
  var upLegA = new Cube();
  upLegA.color = [0.443, 0.459, 0, 1];
  upLegA.textureNum = -2;
  if (g_normalOn) upLegA.textureNum = -3;
  upLegA.matrix = bodyACoordinatesMatrix;
  upLegA.matrix.translate(0.1, 0.15, -0.1);
  upLegA.matrix.rotate(g_upLegAAngle, 0, 0, 1);
  var upLegACoordinatesMatrix = new Matrix4(upLegA.matrix);
  upLegA.matrix.scale(0.1, -0.3, 0.1);
  upLegA.normalMatrix.setInverseOf(upLegA.matrix).transpose();
  upLegA.render();

  /**
   *  Draw Lower Leg BodyA
   */
  var loLegA = new Cube();
  loLegA.color = [0.443, 0.459, 0, 1];
  loLegA.textureNum = -2;
  if (g_normalOn) loLegA.textureNum = -3;
  loLegA.matrix = upLegACoordinatesMatrix;
  loLegA.matrix.translate(0.0, -0.3, 0.0);
  loLegA.matrix.rotate(g_loLegAAngle, 0, 0, 1);
  var loLegACoordinatesMatrix = new Matrix4(loLegA.matrix);
  loLegA.matrix.scale(0.1, -0.3, 0.1);
  loLegA.normalMatrix.setInverseOf(loLegA.matrix).transpose();
  loLegA.render();

  /**
   *  Draw Foot BodyA
   */
  var footA = new Cube();
  footA.color = [0.443, 0.459, 0, 1];
  footA.textureNum = -2;
  if (g_normalOn) footA.textureNum = -3;
  footA.matrix = loLegACoordinatesMatrix;
  footA.matrix.translate(0.1, -0.4, 0.0);
  footA.matrix.rotate(g_footAAngle, 0, 0, 1);
  footA.matrix.scale(-0.3, 0.1, 0.1);
  footA.normalMatrix.setInverseOf(footA.matrix).transpose();
  footA.render();

  /**
   *  Draw Upper RIGHT Leg BodyA
   */
  var upLegA2 = new Cube();
  upLegA2.color = [0.443, 0.459, 0, 1];
  upLegA2.textureNum = -2;
  if (g_normalOn) upLegA2.textureNum = -3;
  upLegA2.matrix = bodyA2CoordinatesMatrix;
  upLegA2.matrix.translate(0.1, 0.15, 0.3);
  upLegA2.matrix.rotate(g_upLegA2Angle, 0, 0, 1);
  var upLegA2CoordinatesMatrix = new Matrix4(upLegA2.matrix);
  upLegA2.matrix.scale(0.1, -0.3, 0.1);
  upLegA2.normalMatrix.setInverseOf(upLegA2.matrix).transpose();
  upLegA2.render();

  
  /**
   *  Draw Lower RIGHT Leg BodyA
   */
  var loLegA2 = new Cube();
  loLegA2.color = [0.443, 0.459, 0, 1];
  loLegA2.textureNum = -2;
  if (g_normalOn) loLegA2.textureNum = -3;
  loLegA2.matrix = upLegA2CoordinatesMatrix;
  loLegA2.matrix.translate(0.0, -0.3, 0.0);
  loLegA2.matrix.rotate(g_loLegA2Angle, 0, 0, 1);
  var loLegA2CoordinatesMatrix = new Matrix4(loLegA2.matrix);
  loLegA2.matrix.scale(0.1, -0.3, 0.1);
  loLegA2.normalMatrix.setInverseOf(loLegA2.matrix).transpose();
  loLegA2.render();
  
  /**
   *  Draw Foot RIGHT BodyA
   */
  var footA2 = new Cube();
  footA2.color = [0.443, 0.459, 0, 1];
  footA2.textureNum = -2;
  if (g_normalOn) footA2.textureNum = -3;
  footA2.matrix = loLegA2CoordinatesMatrix;
  footA2.matrix.translate(0.1, -0.4, 0.0);
  footA2.matrix.rotate(g_footA2Angle, 0, 0, 1);
  footA2.matrix.scale(-0.3, 0.1, 0.1);
  footA2.normalMatrix.setInverseOf(footA2.matrix).transpose();
  footA2.render();

  // #######################################################################
  // MIDDLE BODY B
  // #######################################################################

  /**
   *  Draw Front Cylinder Body B
   */
  var bodyB = new Cube();
  bodyB.color = [0.443, 0.459, 0, 1];
  bodyB.textureNum = -2;
  if (g_normalOn) bodyB.textureNum = -3;
  bodyB.matrix = bodyA3CoordinatesMatrix;
  bodyB.matrix.translate(0.25, 0.05, 0.25);
  bodyB.matrix.rotate(90, 0, 1, 0);
  bodyB.matrix.rotate(g_bodyBAngle, 0, 1, 0);
  var bodyBCoordinatesMatrix = new Matrix4(bodyB.matrix);
  var bodyB2CoordinatesMatrix = new Matrix4(bodyB.matrix);
  bodyB.matrix.scale(0.2, 0.2, 0.2);
  bodyB.normalMatrix.setInverseOf(bodyB.matrix).transpose();
  bodyB.render();

  /**
   *  Draw Middle Body C
   */
  var bodyC = new Cube();
  bodyC.color = [1, 0.733, 0, 1];
  bodyC.textureNum = -2;
  if (g_normalOn) bodyC.textureNum = -3;
  bodyC.matrix = bodyBCoordinatesMatrix;
  bodyC.matrix.translate(-0.05, -0.05, 0.2);
  var bodyCCoordinatesMatrix = new Matrix4(bodyC.matrix);
  var bodyC2CoordinatesMatrix = new Matrix4(bodyC.matrix);
  //bodyC.matrix.rotate(90, 0, 1, 0);
  //bodyC.matrix.rotate(g_magentaAngle, 0, 1, 0);
  bodyC.matrix.scale(0.3, 0.3, 0.3);
  bodyC.normalMatrix.setInverseOf(bodyC.matrix).transpose();
  bodyC.render();

  /**
   *  Draw Back Cylinder Body D
   */
  var bodyD = new Cube();
  bodyD.color = [0.443, 0.459, 0, 1];
  bodyD.textureNum = -2;
  if (g_normalOn) bodyD.textureNum = -3;
  bodyD.matrix = bodyCCoordinatesMatrix;
  bodyD.matrix.translate(0.05, 0.05, 0.25);
  //bodyD.matrix.rotate(90, 0, 1, 0);
  bodyD.matrix.rotate(g_bodyDAngle, 0, 1, 0);
  var bodyDCoordinatesMatrix = new Matrix4(bodyD.matrix);
  var bodyD2CoordinatesMatrix = new Matrix4(bodyD.matrix);
  bodyD.matrix.scale(0.2, 0.2, 0.2);
  bodyD.normalMatrix.setInverseOf(bodyD.matrix).transpose();
  bodyD.render();

  // #######################################################################
  // Back BODY E
  // #######################################################################

  /**
   *  Draw Back Body E
   */
  var bodyE = new Cube();
  bodyE.color = [1, 0.733, 0, 1];
  bodyE.textureNum = -2;
  if (g_normalOn) bodyE.textureNum = -3;
  bodyE.matrix = bodyDCoordinatesMatrix;
  bodyE.matrix.translate(-0.05, -0.05, 0.2);
  //bodyE.matrix.rotate(90, 0, 1, 0);
  bodyE.matrix.rotate(g_bodyEAngle, 0, 1, 0);
  var bodyECoordinatesMatrix = new Matrix4(bodyE.matrix);
  var bodyE2CoordinatesMatrix = new Matrix4(bodyE.matrix);
  var bodyE3CoordinatesMatrix = new Matrix4(bodyE.matrix);
  bodyE.matrix.scale(0.3, 0.3, 0.3);
  bodyE.normalMatrix.setInverseOf(bodyE.matrix).transpose();
  bodyE.render();

  /**
   *  Draw Upper Leg BodyE
   */
  var upLegE = new Cube();
  upLegE.color = [0.443, 0.459, 0, 1];
  upLegE.textureNum = -2;
  if (g_normalOn) upLegE.textureNum = -3;
  upLegE.matrix = bodyECoordinatesMatrix;
  upLegE.matrix.translate(0.0, 0.15, 0.1);
  upLegE.matrix.rotate(-90, 0, 1, 0);
  upLegE.matrix.rotate(g_upLegEAngle, 0, 0, 1);
  var upLegECoordinatesMatrix = new Matrix4(upLegE.matrix);
  upLegE.matrix.scale(0.1, -0.3, 0.1);
  upLegE.normalMatrix.setInverseOf(upLegE.matrix).transpose();
  upLegE.render();

  /**
   *  Draw Lower Leg BodyE
   */
  var loLegE = new Cube();
  loLegE.color = [0.443, 0.459, 0, 1];
  loLegE.textureNum = -2;
  if (g_normalOn) loLegE.textureNum = -3;
  loLegE.matrix = upLegECoordinatesMatrix;
  loLegE.matrix.translate(0.0, -0.3, 0.0);
  loLegE.matrix.rotate(g_loLegEAngle, 0, 0, 1);
  var loLegECoordinatesMatrix = new Matrix4(loLegE.matrix);
  loLegE.matrix.scale(0.1, -0.3, 0.1);
  loLegE.normalMatrix.setInverseOf(loLegE.matrix).transpose();
  loLegE.render();

  /**
   *  Draw Foot BodyA
   */
  var footE = new Cube();
  footE.color = [0.443, 0.459, 0, 1];
  footE.textureNum = -2;
  if (g_normalOn) footE.textureNum = -3;
  footE.matrix = loLegECoordinatesMatrix;
  footE.matrix.translate(0.1, -0.4, 0.0);
  footE.matrix.rotate(g_footEAngle, 0, 0, 1);
  footE.matrix.scale(-0.3, 0.1, 0.1);
  footE.normalMatrix.setInverseOf(footE.matrix).transpose();
  footE.render();

  /**
   *  Draw Upper RIGHT Leg BodyA
   */
  var upLegE2 = new Cube();
  upLegE2.color = [0.443, 0.459, 0, 1];
  upLegE2.textureNum = -2;
  if (g_normalOn) upLegE2.textureNum = -3;
  upLegE2.matrix = bodyE2CoordinatesMatrix;
  upLegE2.matrix.translate(0.4, 0.15, 0.1);
  upLegE2.matrix.rotate(-90, 0, 1, 0);
  upLegE2.matrix.rotate(g_upLegE2Angle, 0, 0, 1);
  var upLegE2CoordinatesMatrix = new Matrix4(upLegE2.matrix);
  upLegE2.matrix.scale(0.1, -0.3, 0.1);
  upLegE2.normalMatrix.setInverseOf(upLegE2.matrix).transpose();
  upLegE2.render();

  /**
   *  Draw Lower RIGHT Leg BodyE
   */
  var loLegE2 = new Cube();
  loLegE2.color = [0.443, 0.459, 0, 1];
  loLegE2.textureNum = -2;
  if (g_normalOn) loLegE2.textureNum = -3;
  loLegE2.matrix = upLegE2CoordinatesMatrix;
  loLegE2.matrix.translate(0.0, -0.3, 0.0);
  loLegE2.matrix.rotate(g_loLegE2Angle, 0, 0, 1);
  var loLegE2CoordinatesMatrix = new Matrix4(loLegE2.matrix);
  loLegE2.matrix.scale(0.1, -0.3, 0.1);
  loLegE2.normalMatrix.setInverseOf(loLegE2.matrix).transpose();
  loLegE2.render();

  /**
   *  Draw Foot RIGHT BodyE
   */
  var footE2 = new Cube();
  footE2.color = [0.443, 0.459, 0, 1];
  footE2.textureNum = -2;
  if (g_normalOn) footE2.textureNum = -3;
  footE2.matrix = loLegE2CoordinatesMatrix;
  footE2.matrix.translate(0.1, -0.4, 0.0);
  footE2.matrix.rotate(g_footE2Angle, 0, 0, 1);
  footE2.matrix.scale(-0.3, 0.1, 0.1);
  footE2.normalMatrix.setInverseOf(footE2.matrix).transpose();
  footE2.render();

  // #######################################################################
  // Back BODY E Turret
  // #######################################################################

  /**
   *  Draw Body Turret Cylinder turrF
   */
  var turrF = new Cube();
  turrF.color = [.729, 0, 0, 1];
  turrF.textureNum = -2;
  if (g_normalOn) turrF.textureNum = -3;
  turrF.matrix = bodyE3CoordinatesMatrix;
  turrF.matrix.translate(0.05, 0.3, 0.25);
  turrF.matrix.rotate(-90, 1, 0, 0);
  // turrF.matrix.rotate(g_magentaAngle, 0, 0, 1);
  var turrFCoordinatesMatrix = new Matrix4(turrF.matrix);
  turrF.matrix.scale(0.2, 0.2, 0.2);
  turrF.normalMatrix.setInverseOf(turrF.matrix).transpose();
  turrF.render();

  /**
   *  Draw Body Barrel Cylinder barrF
   */
  var barrF = new Cube();
  barrF.color = [0.82, .294, 0.349, 1];
  barrF.textureNum = -2;
  if (g_normalOn) barrF.textureNum = -3;
  barrF.matrix = turrFCoordinatesMatrix;
  barrF.matrix.translate(0.05, 0.15, 0.15);
  barrF.matrix.rotate(-90, 1, 0, 0);
  barrF.matrix.rotate(g_turrAngle, 0, 1, 0);
  var barrFCoordinatesMatrix = new Matrix4(barrF.matrix);
  barrF.matrix.scale(0.1, 0.1, 0.5);
  barrF.normalMatrix.setInverseOf(barrF.matrix).transpose();
  barrF.render();

  // #######################################################################
  // END OF BLOCKY ANIMAL
  // #######################################################################
}