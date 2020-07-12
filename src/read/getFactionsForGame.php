<?php
include('../config/sql_config.php');

$gameId = $_GET['gameId'];

$query =  $mysqli->prepare("select * from factions where gameId =?");
$query->bind_param("i", $gameId);
$query->execute();
$result = $query->get_result();
$arr = array();
 while ($obj=mysqli_fetch_object($result)){
      $arr[] = $obj;
   }

#JSON-encode the response (necessary for interaction with angular)
$json_response = json_encode($arr);

echo $json_response;
mysqli_free_result($result);
?>