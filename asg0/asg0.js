// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  // ctx.fillStyle = 'rgba(0, 0, 255, 1.0)'; // Set color to blue
  // ctx.fillRect(120, 10, 150, 150);        // Fill a rectangle with the color
  
  // 2.a
  ctx.fillRect(0, 0, 400, 400);
  const v1 = new Vector3([2.25, 2.25, 0]);

  // 2.c
  drawVector(ctx, v1, "red");
}

// 2.b
function drawVector(ctx, v, color) {
  const origin = [200, 200];
  const scale  = 20;

  ctx.beginPath();
  ctx.moveTo(origin[0], origin[1]);
  ctx.lineTo(origin[0] + (v.elements[0] * scale), origin[1] - (v.elements[1] * scale));
  ctx.strokeStyle = color;
  ctx.stroke();
}

// 3.b
function handleDrawEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 400, 400);
  ctx.fillRect(0, 0, 400, 400);

  const v1 = new Vector3([
    document.getElementById("v1xCord").value, 
    document.getElementById("v1yCord").value, 
    0
  ]);
  // 4.b
  const v2 = new Vector3([
    document.getElementById("v2xCord").value, 
    document.getElementById("v2yCord").value, 
    0
  ]);

  drawVector(ctx, v1, "red");
  drawVector(ctx, v2, "blue");
}

// 5.c
function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 400, 400);
  ctx.fillRect(0, 0, 400, 400);

  const v1 = new Vector3([
    document.getElementById("v1xCord").value, 
    document.getElementById("v1yCord").value, 
    0
  ]);
  const v2 = new Vector3([
    document.getElementById("v2xCord").value, 
    document.getElementById("v2yCord").value, 
    0
  ]);

  drawVector(ctx, v1, "red");
  drawVector(ctx, v2, "blue");

  if (document.getElementById("operation").value == "add") {
    const v3 = v1.add(v2);
    drawVector(ctx, v3, "green");
  } else if (document.getElementById("operation").value == "sub") {
    const v3 = v1.sub(v2);
    drawVector(ctx, v3, "green");
  } else if (document.getElementById("operation").value == "divide") {
    const v3 = v1.div(document.getElementById("scalar").value);
    const v4 = v2.div(document.getElementById("scalar").value);
    drawVector(ctx, v3, "green");
    drawVector(ctx, v4, "green");
  } else if (document.getElementById("operation").value == "multiply") {
    const v3 = v1.mul(document.getElementById("scalar").value);
    const v4 = v2.mul(document.getElementById("scalar").value);
    drawVector(ctx, v3, "green");
    drawVector(ctx, v4, "green");
  } else if (document.getElementById("operation").value == "magnitude") {
    console.log('Magnitude v1: ', v1.magnitude());
    console.log('Magnitude v2: ', v2.magnitude());
  } else if (document.getElementById("operation").value == "normalize") {
    const v3 = v1.normalize();
    const v4 = v2.normalize();
    drawVector(ctx, v3, "green");
    drawVector(ctx, v4, "green");
  } else if (document.getElementById("operation").value == "angle-between") {
    console.log('Angle: ', angleBetween(v1, v2));
  } else if (document.getElementById("operation").value == "area") {
    console.log('Area of the triangle: ', areaTriangle(v1, v2));
  }
}

function angleBetween(v1, v2) {
  let angle = Math.acos((Vector3.dot(v1, v2) / (v1.magnitude()  + v2.magnitude()))) / (Math.PI / 180);

  return angle;
}

function areaTriangle(v1, v2) {
  let area = Vector3.cross(v1, v2).magnitude() / 2;

  return area;
}