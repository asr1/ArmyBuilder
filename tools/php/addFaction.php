<?php
include('../../src/config/sql_config.php');

$gameId = $_GET['gameId'];
$name = $_GET['name'];
 
$query =  $mysqli->prepare("insert into factions (name, gameId) values (?, ?)");
$query->bind_param("ss", $name, $gameId);
$query->execute();
$result = $query->get_result();
$arr = array();
 while ($obj=mysqli_fetch_object($result)){
      $arr[] = $obj;
}
$query->close();

#JSON-encode the response (necessary for interaction with angular)
$json_response = json_encode($arr);

echo $json_response;
mysqli_free_result($result);
?>