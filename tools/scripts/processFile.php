<?php
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);
	$abacus = $request->a;
	$a = $_REQUEST['a'];
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	$fp = fopen('results.json', 'w');
	fwrite($fp, json_encode($_REQUEST));
	fwrite($fp, json_encode($_POST));
	fwrite($fp, "test");
	fwrite($fp, json_encode($abacus, JSON_PRETTY_PRINT));
	//fwrite($fp, $data);
	fclose($fp);
	echo $a;
?> 