<?php
include './functions.php';

header('Access-Control-Allow-Origin:*');

$redis = new redis();
$redis->connect('redis',6379);


$mask = $_REQUEST['mask'];
if(!isset($mask)) die();



$addr = getAddress($mask, $redis);


echo json_encode($redis->hGetAll('session/dialog/'.$addr));

