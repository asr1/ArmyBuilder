<?php
include('../../../src/config/sql_config.php');

$gearid = $_GET['gearid'];
$abilityId = $_GET['abilityid'];
 
$query =  $mysqli->prepare("insert into gear_to_abilities (gearId, abilityId) values (?, ?)");
$query->bind_param("ii", $gearid, $abilityId);
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