<?php
include('../../../src/config/sql_config.php');

$unitId = $_GET['unitId'];
$modelId = $_GET['modelId'];
$modelCount = $_GET['modelCount'];
 
$query =  $mysqli->prepare("insert into unit_to_model (unitId, modelId, modelCount) values (?, ?, ?)");
$query->bind_param("iii", $unitId, $modelId, $modelCount);
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