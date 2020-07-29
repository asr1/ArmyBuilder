<?php
include('../../../src/config/sql_config.php');

$unitId = $_GET['unitId'];
$abilityId = $_GET['abilityId'];
 
$query =  $mysqli->prepare("insert into unit_to_ability (unitId, unitAbilityId) values (?, ?)");
$query->bind_param("ii", $unitId, $abilityId);
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