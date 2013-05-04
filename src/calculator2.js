/*
filename: calculator2.js
usage:    mixed calculating, input like 1 + (2 - (3 * (-4)))
author:   Yanhe Liu (014126284)
          yanhe.liu@cs.helsinki.fi
history:  08.02.2013 first release 
*/

/*
usage:    basic request func, send get request to server
          this func can only process two numbers
input:    arg1, arg2, op
output:   null
*/
function make_request(arg1, arg2, op) {
  // convert +, -, *, / to add, sub, mul and div
  // func in func_lib.js 
  var url_op = replace_operation(op);
  if (!validate_input(arg1, arg2, url_op)) {
    // illegal input will fail to submit
    return;
  }

  var xmlHttp = get_xml_http(); /* func defined in func_lib.js */
  var url = "basic_calculator.php";
  url += "?arg1=" + arg1 + "&op=" + url_op + "&arg2=" + arg2;
  // url += "&sid=" + Math.random();

  // response handler
  xmlHttp.onreadystatechange = function() {
    if(xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
      handle_response(xmlHttp.responseText);
    }
  }

  // synchronous ajax request!
  xmlHttp.open("GET", url, false); 
  xmlHttp.send(null);
}

/*
usage:    handle func when ajax succeeds
input:    xmlHttp.responseText
output:   null
note:     this func will send new request to server several times if possible
          implemented by using some global variables
*/
function handle_response(response) {
  // add server reply to html table
  add_table_row(response, "resultBody");
  // record to cookie, used for display history
  add_table_row(response, "historyBody");
  add_to_cookie("calc2", response);
  
  last_cal = response; /* global variable */

  // rexp used for getting the result of last calculating
  var rexp = /=\s(\-?\d+\.?\d*)$/;
  var last_result;

  // sliced_args is a global variable
  while(sliced_args.length > 0 ) {
    last_result = last_cal.match(rexp);
    if (last_result) {
      // get arg2 and op from sliced_args, and calculate again
      arg1 = last_result[last_result.length - 1];
      op = sliced_args.shift();
      arg2 = sliced_args.shift();
      make_request(arg1, arg2, op);
    } else {
      alert("Calculating error!");
      return;
    }
  }
}

/*
usage:    first wrap for mixed calculating without parenthesis
          this func will be used by the 2nd wrap
input:    null, use global variable sliced_args
output:   false if find invalid input, or true
history:  edit after the 2nd wrap, and condition checking first
*/
function make_request_wrap1() {  
  // remove the parenthesis 
  // condition like this: (1 + 3), parenthesis is no use but at the first level
  if (sliced_args[0] == "(" && sliced_args[sliced_args.length - 1] == ")") {
    sliced_args.pop();
    sliced_args.shift();
  }

  // only one arg, no operation
  if (sliced_args.length == 1) {
    sliced_args.pop();
    alert("Only one arg, no calculation needed");
    return true;
  }

  // handle negetive number
  if (sliced_args.length == 2 && sliced_args[0] == "-") {
    last_cal = "= " + sliced_args[0] + sliced_args[1];
    return true;
  } else if ((sliced_args.length % 2) != 1) {
    return false;
  }

  // operator appears before arg1
  if (isNaN(sliced_args[0])) {
    return false;
  }

  // illegal order like "+ 1 +"
  for (var i = 1; i < sliced_args.length; i += 2) {
    if (!(isNaN(sliced_args[i]))) {
      return false;
    }
  }

  // get args for normal calculating
  var arg1 = sliced_args.shift();
  var op = sliced_args.shift();
  var arg2 = sliced_args.shift();

  make_request(arg1, arg2, op);
  return true;
}

/*
usage:    2nd wrap for handling parenthesis
input:    null
output:   null, use global variables with wrap1 and response_handler
*/
function make_request_wrap2() {
  var arg = document.getElementById("arg");
  
  // check args first
  args = input_parser(arg.value); /* args is a global variable */
  if (args == false) { 
    return;
  }

  // is there any parenthesis, pnum is the number of pairs of parentheses
  var pnum = 0;
  var i, j;
  for (i = 0; i < args.length; i++) {
    if (args[i] == "(") {
      pnum++;
    }
  }

  clear_table("resultBody");
  // no parenthesis, use wrap1 directly
  if (pnum == 0) {
    sliced_args = args;
    if (!make_request_wrap1()) {
      alert("Invalid order of args!");
    }
    return;
  }

  // parenthesis found
  // use stack-like idea to process parenthesis
  // if find ")", pop the middle part between closest "(" and ")"
  // set this part to global variable "sliced_args", then call wrap1
  var m, restr, inserting_value;
  while (pnum > 0) {
    for (i = 0; i < args.length; i++) {
      if (args[i] == ")") {
        for (j = (i - 1); j >= 0; j--) {
          if (args[j] == "(") {
            sliced_args = args.slice(j + 1, i);

            if (!make_request_wrap1()) {
              alert("Invalid order of args!");
              return;
            }
            
            // get result if wrap1 finished, instert result back to args
            restr = /=\s(\-?\d+\.?\d*)$/;
            m = last_cal.match(restr);
            if (m) {
              inserting_value = m[m.length - 1];
            } else {
              alert("Unknown error!");
              return;
            }
            
            args.splice(j, (i - j + 1), inserting_value);
            break;
          }
        }
        break;
      }
    }
    pnum--;
  }

  // the last args without parenthesis
  if (args.length > 0) {
    sliced_args = args;
    if (!make_request_wrap1()) {
      alert("Invalid order of args!");
    }
  }
}

/*
usage:    get the input args into an Array, 
          if invalid arg is found, return false
input:    arg string
output:   args array or false
*/
function input_parser(arg) {
  // the func is not very elegent, I can not find and use only one exact regexp
  // to handle all the conditions.

  // remove all the spaces
  var str = arg.replace(/\s+/g, "");

  // check illegal characters
  if (str.search(/[^\d\+\-\*\/\(\)\.]/g) != -1) {
    alert("Your inputs contain illegal characters!");
    return false;
  }
  
  // check parentheses number
  var regexp = /[\(]/g;
  var m1 = str.match(regexp);
  regexp = /[\)]/g;
  var m2 = str.match(regexp);
  if ((m1 && m2) && (m1.length == m2.length)) {
    // equal
  } else if (!m1 && !m2) {
    // no parenthesis
  } else {
    alert("The total number of parentheses is illegal!");
    return false;
  }

  // check continuous operators
  regexp = /[\+\-\*\/\.]{2,}/;
  match = str.match(regexp);
  if (match) {
    alert("Illegal order of operators");
    return false;
  }

  // check float number
  regexp = /^\s*\.\d+/;
  match = str.match(regexp);
  if (match) {
    alert("Invalid type of float number");
    return false;
  }

  // get all the args
  var args = Array();
  regexp = /([\+\-\*\/\(\)]{1}|\d+\.?\d+|\d+)+?/g;
  match = str.match(regexp);
  if (match) {
    for (var i = 0; i < match.length; i++) {
      args.push(match[i]);
    }
  } else {
    alert("Missing args!");
    return false;
  }

  if (!check_last_num(args)) {
    return false;
  }

  return args;
}

/*
usage:    check whether there is op on the right of last arg num
input:    args array
output:   true if no illegal order, else false
*/    
function check_last_num(args) {
  var last_num = -1;
  var last_op = -1;
  var re1 = /\d+/;
  var re2 = /[\+\-\*\/]/;
  for (var i = args.length - 1; i > 0; i--) {
    if (args[i].match(re1)) {
      last_num = i;
      break;
    } else if (args[i].match(re2)) {
      last_op = i;
    }
  }

  if ((last_op != -1 && last_num == -1) || (last_op > last_num && last_num > 0)) {
    alert("Illegal order of args!");
    return false;
  } else {
    return true;
  }
}