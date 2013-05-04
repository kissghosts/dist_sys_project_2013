/*
filename: calculator1.js
usage:    js file for basic calculating
author:   Yanhe Liu (014126284)
          yanhe.liu@cs.helsinki.fi
history:  04.02.2013 first release 
*/

/*
usage:    use ajax to send the request
input:    null
output:   null, show result
*/
function make_request() {
  var arg1 = document.getElementById("arg1");
  var arg2 = document.getElementById("arg2");
  var op = document.getElementById("op");

  if (!arg1.value || !arg2.value || !op.value) {
    alert("Missing args!");
    return false;
  }

  // convert +, -, *, / to add, sub, mul and div
  // func in func_lib.js 
  var url_op = replace_operation(op.value);
  if (!validate_input(arg1.value, arg2.value, url_op)) {
    // illegal input will fail to submit
    // validate_input() in func_lib.js
    return;
  }

  var xmlHttp = get_xml_http(); /* get_xml_http() is defined in func_lib.js */
  var url = "basic_calculator.php";
  url += "?arg1=" + arg1.value + "&op=" + url_op + "&arg2=" + arg2.value;
  
  // response handler
  xmlHttp.onreadystatechange = function() {
    if(xmlHttp.readyState == 4 || xmlHttp.readyState == "complete") {
      handle_response(xmlHttp.responseText);
    }
  }

  xmlHttp.open("GET", url, true); 
  xmlHttp.send(null);
}

/*
usage:    handle func when ajax succeeds and return reply
input:    xmlHttp.responseText
output:   null, show result
*/
function handle_response(response) {
  document.getElementById('responseDiv').innerHTML = response;
  // record every entry
  add_to_cookie("calc1", response);
  
  // show result, add_table_row() in func_lib.js
  add_table_row(response, "historyBody");
}