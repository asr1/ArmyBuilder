<?php
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);
	$unit = $request->unit;
	
	$file = 'results.json';
	$current = file_get_contents($file);
	$current .= ',' . json_encode($unit, JSON_PRETTY_PRINT);
	file_put_contents($file, $current);
?> 