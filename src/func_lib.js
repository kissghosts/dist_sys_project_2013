/*
filename: func_lib.js
usage:    public func for other js file
author:   Yanhe Liu (014126284)
          yanhe.liu@cs.helsinki.fi
history:  04.02.2013 first release 
*/

/*
usage:    initial XMLHttpRequest object, this func will be used by all the ajax
          method
input:    null
output:   xmlHttp object
*/
function get_xml_http() {
  var xmlHttp

  try {
    //Firefox, Opera 8.0+, Safari
    xmlHttp = new XMLHttpRequest();
  } catch(e) {
    //Internet Explorer
    try {
      xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch(e) {
      try {
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
      } catch(e) {
        alert("Your browser does not support AJAX!")
        return false;
      }
    }
  }
  return xmlHttp;
}

/*
usage:    change the operation for generate url
input:    operation string
output:   +, -, *, / --> add, sub, mul, div
*/
function replace_operation(op) {
  var url_op;
  if (op == '+') {
    url_op = 'add';
  } else if (op == '-') {
    url_op = 'sub';
  } else if (op == '*') {
    url_op = 'mul';
  } else {
    url_op = 'div';
  }
  return url_op;
}

/*
usage:    chech the input parameters from the form
input:    arg1, arg2, op
output:   true for valid input, false for invalid
*/
function validate_input(arg1, arg2, op) {
  var flag = true;
  if (isNaN(arg1) || isNaN(arg2)) {
    // check whether arg1 and arg2 contain character other than number
    alert("Illegal characters or invalid inputs!");
    flag = false;
  } else if (arg2 == 0 && op == 'div') {
    // check divisor
    alert("Aborted, the divisor should not be zero!")
    flag = false;
  }
  return flag;
}

/*
usage:    add new row to the table in html dynamically
input:    string to add, html table id
output:   null
*/
function add_table_row(text, id) {
  var row = document.createElement("tr");
  var cell = document.createElement("td");
  var text_node = document.createTextNode(text);
  cell.appendChild(text_node);
  row.appendChild(cell);
  document.getElementById(id).appendChild(row);
}

/*
usage:    remove all the table elements
input:    html table id
output:   null
*/
function clear_table(id) {
  var table_body = document.getElementById(id);
  while (table_body.childNodes.length > 0) {
    table_body.removeChild(table_body.childNodes[0]);
  }
}

/*
usage:    set cookie for recording history
input:    cookie's name, value
output:   null
*/
function set_cookie(c_name, value) {
  document.cookie = c_name + "=" + value;
}

/*
usage:    get certain key's cookie content
input:    cookie's name
output:   string recorded in cookie or null
*/
function get_cookie(c_name) {
  if (document.cookie.length > 0) {
    // get start location of the cookie string
    var c_start = document.cookie.indexOf(c_name + "=");
    
    if (c_start != -1) {
      // if existing
      c_start = c_start + c_name.length + 1; 
      var c_end = document.cookie.indexOf(";", c_start);
      if (c_end == -1) 
        c_end = document.cookie.length;
      
      // get the string
      return unescape(document.cookie.substring(c_start, c_end));
    }
  } else
    // no corresponding entry
    return null;
}

/*
usage:    add new element to the original cookie string
input:    cookie's name, new value
output:   null
*/
function add_to_cookie(c_name, value) {
  var old_value = get_cookie(c_name);
  if (old_value == null || old_value == "") {
    // entry not exist, create it
    set_cookie(c_name, value);
  } else {
    // entry exists, add new value to the end
    set_cookie(c_name, old_value + "," + value);
  }
}

/*
usage:    read cookie content and display them on the html table
input:    cookie's name
output:   null
*/
function show_history(c_name) {
  var history = get_cookie(c_name);
  if (history != null && history != "") {
    var calculator = history.split(",");
    for (var i = 0; i < calculator.length; i++) {
      // add to html table, func in func_lib.js
      add_table_row(calculator[i], "historyBody");
    }
  }
}