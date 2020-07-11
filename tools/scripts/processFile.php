<?php
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);
	$squads = $request->squads;
	$items = $request->items;
	$addons = $request->addons;
	$abilities = $request->abilities;
	$powers = $request->powers;
	
	if($items) {
		$file = '../../data/items.json';
		$fp = fopen($file, 'w');
		fwrite($fp, json_encode($items, JSON_PRETTY_PRINT));
		fclose($fp);
	}
	
	if($addons) {
		$file = '../../data/addons.json';
		$fp = fopen($file, 'w');
		fwrite($fp, json_encode($addons, JSON_PRETTY_PRINT));
		fclose($fp);
	}
	
	if($abilities) {
		$file = '../../data/abilities.json';
		$fp = fopen($file, 'w');
		fwrite($fp, json_encode($abilities, JSON_PRETTY_PRINT));
		fclose($fp);
	}
	
	if($powers) {
		$file = '../../data/powers.json';
		$fp = fopen($file, 'w');
		fwrite($fp, json_encode($powers, JSON_PRETTY_PRINT));
		fclose($fp);
	}
	
	if($squads){
		$file = '../../data/squads.json';
		$fp = fopen($file, 'w');
		fwrite($fp, json_encode($squads, JSON_PRETTY_PRINT));
		fclose($fp);
	}
?> 