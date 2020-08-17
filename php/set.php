<?php
include './functions.php';

header('Access-Control-Allow-Origin:*');

$redis = new redis();
$redis->connect('redis',6379);


$mask = $_REQUEST['mask'];
$key = $_REQUEST['key'];
$val = $_REQUEST['val'];
$t = $_REQUEST['t'];
if(!isset($mask)) die();
if(!isset($key)) die();
if(!isset($val)) die();
if(!isset($t)) die();

if($t < time() - 10000) die();


$addr = getAddress($mask, $redis);

$redis->hSet('session/dialog/'.$addr, $key, $val);


echo json_encode($redis->hGetAll('session/dialog/'.$addr));

