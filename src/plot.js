/*
filename: plot.js
usage:    js file for plotting
author:   Yanhe Liu (014126284)
          yanhe.liu@cs.helsinki.fi
history:  13.02.2013 first release
          18.02.2013 modify the third variant of plotting
*/ 

/*
usage:    use ajax to send the request
input:    url string, response func handler
output:   null, show the image if successful
*/
function make_request(url, handler) {
  var xmlHttp = get_xml_http();

  // response handler
  xmlHttp.onreadystatechange = function() {
    if(xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
      handler(xmlHttp.responseText);
    }
  }

  xmlHttp.open("GET", url, true); 
  xmlHttp.send(null);
}

/*
usage:    handler func for server plotting
input:    xmlHttp.responseText
output:   null, show the image if successful
*/
function handle_response1(response) {
  var img = new Image();
  // the image
  img.src = "data:image/png;base64," + response;

  var canvas = document.getElementById("plot");
  if (!canvas.getContext) {
    // undefined canvas
    alert("Your browser does not support plotting!");
    return;
  }

  var context = canvas.getContext("2d");
  img.onload = function () {
    // add image to canvas
    context.drawImage(img, 0, 0);
    document.getElementById('responseDiv').innerHTML = "";
  }
  img.onerror = function () {
    alert("Sorry, server failed to plot!");
  }
}

/*
usage:    main func for remote plotting from server
input:    null
output:   null
*/
function remote_plot() {
  var arg = document.getElementById("func");
  var url = "plot.php?func=" + arg.value + "&type=plot";

  // ajax request func, use handle_response1() as the handler
  make_request(url, handle_response1);
}

/*
usage:    main func for local plotting by use js and canvas
input:    null
output:   null, show the plotting
*/
function local_plot() {
  var type = document.getElementById("func");
  var canvas = document.getElementById("plot");
  document.getElementById('responseDiv').innerHTML = "";
  
  
  if (canvas.getContext) {
    var context = canvas.getContext('2d');
    
    // get points for sin(x) or cos(x) and plot
    var points = calc_plot_point(type.value, 0.05);
    plot(context, canvas.width, canvas.height, points, type.value, "red");
    
    // title
    context.fillText(type.value + "(x)", canvas.width - 60, 20);
    context.beginPath();
    context.moveTo(canvas.width - 110, 16);
    context.lineTo(canvas.width - 75, 16);
    context.strokeStyle = "red";
    context.stroke();
  } else {
    alert("Your browser does not support this func!");
    return;
  }
}

/*
usage:    this func is used to draw the backgroud
          including the x and y axis, step sizes and names
input:    type(sin/cos), step size
output:   2-d array, every element is an array of x and sin(x)
          range: -pi -> pi
note:     the point(x, y) used to draw x and y axis maybe need to modify,
          now they are designed for canvas of 640x480 size
*/
function draw_backgroud(context, width, height) {
  var x, y;

  // draw backgroud lines  
  for (x = 0.5; x < width; x += 10) {
    context.moveTo(x, 0);
    context.lineTo(x, height);
  }
  for (y = 0.5; y < height; y += 10) {
    context.moveTo(0, y);
    context.lineTo(width, y);
  }
  context.strokeStyle = "#eee";
  context.stroke();

  // draw x axis and y axis
  context.beginPath();
  context.moveTo(0, height/2);
  context.lineTo(width, height/2);
  context.moveTo(width-5, height/2-5);
  context.lineTo(width, height/2);
  context.moveTo(width, height/2);
  context.lineTo(width-5, height/2+5);
  context.moveTo(width/2, height);
  context.lineTo(width/2, 0);
  context.moveTo(width/2-5, 5);
  context.lineTo(width/2, 0);
  context.moveTo(width/2, 0);
  context.lineTo(width/2+5, 5);
  context.strokeStyle = "#000";
  context.stroke();

  // mark the step sizes
  for (x = 20.5; x < width; x += 100) {
    context.moveTo(x, height/2-4);
    context.lineTo(x, height/2+4);
  }
  for (y = 40.5; y < height; y += 40) {
    context.moveTo(width/2-4, y);
    context.lineTo(width/2+4, y);
  }
  context.strokeStyle = "#000";
  context.stroke();

  // write the name of step sizes on x axis
  context.font = "bold 14px sans-serif";
  context.fillText("x", 0, height/2-5);
  context.fillText("y", width/2-22, 20);
  for (var i = 0; i < 7; i++) {
    if (i == 3) {
      continue;
    }
    var num = -3;
    context.fillText(num + i, 100 * i + 15, height/2+20);  
  }

  // write the name of step sizes on x axis
  context.fillText("1.0", width/2-30, 45);
  context.fillText("0.8", width/2-30, 85);
  context.fillText("0.6", width/2-30, 125);
  context.fillText("0.4", width/2-30, 165);
  context.fillText("0.2", width/2-30, 205);
  context.fillText("-0.2", width/2-36, 285);
  context.fillText("-0.4", width/2-36, 325);
  context.fillText("-0.6", width/2-36, 365);
  context.fillText("-0.8", width/2-36, 405);
  context.fillText("-1.0", width/2-36, 445);
}

/*
usage:    func for plotting locally
input:    context of canvas, canvas.width, canvas.height
          points array, type(sin/cos), color string
output:   null, plot on the canvas
*/
function plot(context, width, height, points, type, color) {
  // clear the canvas for redrawing
  context.clearRect(0, 0, width, height);

  // draw basic element on canvas
  draw_backgroud(context, width, height);

  // plotting
  var start_x, start_y, end_x, end_y;
  start_x = 100 * points[0][0] + 320;
  start_y = -200 * points[0][1] + 240;
  context.beginPath();
  for (var i = 1; i < points.length; i++) {
    end_x = 100 * points[i][0] + 320.5;
    end_y = -200 * points[i][1] + 240.5;
    
    // the float number will cause some inaccuracy error at last
    if (type == 'sin' && i == points.length - 1) {
      end_x += 3;
      end_y += 5;
    }

    context.moveTo(start_x, start_y);
    context.lineTo(end_x, end_y);
    start_x = end_x;
    start_y = end_y;  
  }
  context.strokeStyle = color;
  context.stroke();
}

/*
usage:    calculate sin(x) and cos(x) locally
input:    type(sin/cos), step size
output:   2-d array, every element is an array of x and sin(x)
          range: -pi -> pi
*/
function calc_plot_point(type, stepsize) {
  var start = -Math.PI;
  var end = Math.PI;
  var output = new Array();
  var x, y;

  for (x = start; x < end; x += stepsize) {
    if (type == 'sin') {
      y = Math.sin(x);
    } else {
      y = Math.cos(x);
    }
    output.push([x, y]);
  }

  // the inaccuracy error of stepsize may cause missing the lastadd point: pi
  var i = output.length - 1;
  if (output[i][0] < end && type == 'sin') {
    output.push[Math.PI + stepsize, 0];
  } else if (output[i][0] < end && type == 'cos') {
    output.push[Math.PI + stepsize, -1];
  }

  return output;
}

/*
usage:    main func for mixed plotting
input:    null
output:   null
*/
function mixed_plot() {
  var type = document.getElementById("func");
  var order = document.getElementById("order");
  var canvas = document.getElementById("plot");
  
  if (canvas.getContext) {
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    alert("Your browser does not support this func!");
    return;
  }

  document.getElementById('responseDiv').innerHTML = "Your image will be "
    + "shown here after calculating. As you choose mixed type, you need "
    + "to wait a very long time >_<.";

  // calculating the points by server
  var points = maclaurin(order.value, 0.05, type.value);
  if (!points) {
    alert("Fail to calculate the points, please try it later");
    return;
  }

  // plot
  document.getElementById('responseDiv').innerHTML = "";
  plot(context, canvas.width, canvas.height, points, type.value, "blue");
  
  // write title
  context.fillText(type.value + "(x)", canvas.width - 60, 20);
  context.beginPath();
  context.moveTo(canvas.width - 110, 16);
  context.lineTo(canvas.width - 75, 16);
  context.strokeStyle = "blue";
  context.stroke();
}

/*
usage:    use ajax to send the atomic request
input:    arg1, arg2, op
          op must be string of add, sub, mul or div
output:   null, but use global variant result
*/
function atomic_request(arg1, arg2, op) {
  var xmlHttp = get_xml_http();
  var url = "plot.php?type=calc";
  url += "&arg1=" + arg1 + "&op=" + op + "&arg2=" + arg2;
  
  // response handler
  xmlHttp.onreadystatechange = function() {
    if(xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
      result = xmlHttp.responseText;
    }
  }

  // synchronous ajax request!
  xmlHttp.open("GET", url, false); 
  xmlHttp.send(null);
}

/*
usage:    use Maclaurin Series to calc sine or cosine
input:    order n, stepsize size, type(sin/cos)
output:   2-d array, every element is an array of x and sin(x)/cos(x)
          range: -pi -> pi
*/
function maclaurin(order, stepsize, type) {
  var pi = Math.PI;
  output = new Array(); /* global variable */
  
  result = ""; /* global variable used for server calculating */
  var i, j, n, exp1, exp2, fac;
  for (i = -pi; i < pi; i += stepsize) {
    var sum = 0;
    for (j = 0; j < order; j++) {
      // check type, sine or cosine
      if (type == 'sin') {
        // 2 * j
        atomic_request(2, j, 'mul');
        if (isNaN(result)) {
          alert("calculating error!");
          return false;
        }
        // 2 * j + 1
        atomic_request(result, 1, 'add');
        if (isNaN(result)) {
          alert("calculating error!");
          return false;
        }
        n = result;
      } else if (type == 'cos') {
        // 2 * j
        atomic_request(2, j, 'mul');
        if (isNaN(result)) {
          alert("calculating error!");
          return false;
        }
        n = result;
      }

      exp1 = exponentiation(-1, j); /* (-1)^j */
      exp2 = exponentiation(i, n); /* i^n */
      fac = factorial(n); /* n! */
      if (exp1 == false || exp2 == false || fac == false) {
        alert("calculating error!");
        return false;
      }

      atomic_request(exp1, exp2, 'mul'); /* exp1 * exp2 */
      if (isNaN(result)) {
        alert("calculating error!");
        return false;
      }

      atomic_request(result, fac, 'div'); /* exp1 * exp2 / fac */
      if (isNaN(result)) {
        alert("calculating error!");
        return false;
      }

      atomic_request(sum, result, 'add'); /* sum of the series*/
      if (isNaN(result)) {
        alert("calculating error!");
        return false;
      }
      
      sum = result;
    }
    output.push([i, sum]);  
  }

  return output;
}

/*
usage:    calc factorial of n
input:    integer n (should not be negetive num)
output:   integer n!
*/
function factorial(n) {
  var product = 1;
  while (n > 0) {
    // calculating n! by server
    atomic_request(product, n, 'mul');
    if (isNaN(result)) {
      alert("calculating error!");
      return false;
    }
    product = result;
    n--;
  }

  return product;
}

/*
usage:    exponentiation
input:    base, exponent
output:   (base)^(exponent)
note:     (1) this func only calc integer exponent, if it is not integer, it 
          will be treated as an interger
          (2) can not work for minus exponent
*/
function exponentiation(base, exponent) {
  var product = 1;
  if (exponent > 0) {
    for (var i = 0; i < exponent; i++) { 
      // calculating base^exponent by server
      atomic_request(product, base, 'mul');
      if (isNaN(result)) {
        alert("calculating error!");
        return false;
      }
      product = result;
    }
  }
  return product;
}