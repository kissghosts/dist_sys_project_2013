<?php
/*
usage:    server code for task 2, step 3
author:   Yanhe Liu (014126284)
          yanhe.liu@cs.helsinki.fi
*/  

  // php server code for plotting

  if (!isset($_GET["type"])) {
    echo "Your input parameters are illegal!";
    exit;
  }

  $type = $_GET["type"];

  if ($type == 'plot') {
    // plot by server
    if (!isset($_GET["func"])) {
      echo "Missing paramenter";
      exit;
    }

    $func = $_GET["func"];
    $sid = rand(0, 1000000); /* random num for concurrent requests*/
    $image = 'image-' . "$sid" . '.png'; /* image file name*/
    // shell cmd for calling gnuplot
    $cmd = 'echo "set terminal png; set xrange [-pi:pi]; set output '
      . "'$image'; set grid; " . 'plot ' . "$func" . '(x)"';
    $cmd .= ' | gnuplot';

    shell_exec($cmd);
    usleep(100); /* make sure the gnuplot has save the file */

    if (is_readable($image)) {
      // if image saved, send the image to client
      header("Content-type: image/png");
      $file = file_get_contents($image);
      echo base64_encode($file);
    } else {
      echo "Your request can not be processed now, please try it again later";
      exit;
    }

    // delete the file
    if (file_exists($image)) {
      unlink($image); 
    }
  } elseif ($type == 'calc') {
    // calculate by server, first get the args    
    if (!isset($_GET["arg1"]) || !isset($_GET["arg2"]) || !isset($_GET["op"])) {
      echo "Your input parameters are illegal!";
      exit;
    }

    $arg1 = $_GET["arg1"];
    $arg2 = $_GET["arg2"];
    $op = $_GET["op"];

    $arg1 = (float)$arg1;
    $arg2 = (float)$arg2;

    if ($op == 'add') {
      $result = $arg1 + $arg2;
    } elseif ($op == 'sub') {
      $result = $arg1 - $arg2;
    } elseif ($op == 'mul') {
      $result = $arg1 * $arg2;
    } else {
      $result = $arg1 / $arg2;
    }

    echo "$result";
  }
?>