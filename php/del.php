<?php
include './functions.php';

header('Access-Control-Allow-Origin:*'); 

$redis = new redis();
$redis->connect('redis',6379);


$mask = $_REQUEST['mask'];
$del = $_REQUEST['del'];
$t = $_REQUEST['t'];
if(!isset($mask)) die();
if(!isset($del)) die();
if(!isset($t)) die();

if($t < time() - 10000) die();


$addr = getAddress($mask, $redis);

$redis->hDel('session/dialog/'.$addr, $del);


echo json_encode($redis->hGetAll('session/dialog/'.$addr));

