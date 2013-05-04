<?php
/*
filename: basic_calculator.php
usage:    server code for task 1 and task 2, step 1 and 2
author:   Yanhe Liu (014126284)
          yanhe.liu@cs.helsinki.fi
*/

  $arg1 = $_GET["arg1"];
  $arg2 = $_GET["arg2"];
  $op = $_GET["op"];
  
  if (!strlen($arg1) || !strlen($arg2) || !strlen($op)) {
    echo "Your input parameters are illegal!";
    exit;
  }

  $arg1 = (float)$arg1;
  $arg2 = (float)$arg2;

  // change the op back to normal format, and calculate
  if ($op == 'add') {
    $result = $arg1 + $arg2;
    $op = '+';
  } elseif ($op == 'sub') {
    $result = $arg1 - $arg2;
    $op = '-';
  } elseif ($op == 'mul') {
    $result = $arg1 * $arg2;
    $op = '*';
  } else {
    $result = $arg1 / $arg2;
    $op = '/';
  }

  echo "$arg1 $op $arg2 = $result";
?>