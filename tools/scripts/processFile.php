<?php
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata);
	$unit = $request->unit;
	$items = $request->items;
	$addons = $request->addons;
	$abilities = $request->abilities;
	$powers = $request->powers;
	
	if($items) {
		$file = 'items.json';
		$fp = fopen($file, 'w');
		fwrite($fp, json_encode($items, JSON_PRETTY_PRINT));
		fclose($fp);
	}
	
	if($addons) {
		$file = 'addons.json';
		$fp = fopen($file, 'w');
		fwrite($fp, json_encode($addons, JSON_PRETTY_PRINT));
		fclose($fp);
	}
	
	if($abilities) {
		$file = 'abilities.json';
		$fp = fopen($file, 'w');
		fwrite($fp, json_encode($abilities, JSON_PRETTY_PRINT));
		fclose($fp);
	}
	
	if($powers) {
		$file = 'powers.json';
		$fp = fopen($file, 'w');
		fwrite($fp, json_encode($powers, JSON_PRETTY_PRINT));
		fclose($fp);
	}
	
	//TODO make sure squads / factions get put in the right place.
	if($unit){
		$file = 'results.json';
		$fp = fopen($file, 'w');
		fwrite($fp, json_encode($unit, JSON_PRETTY_PRINT));
		fclose($fp);
	}
?> 