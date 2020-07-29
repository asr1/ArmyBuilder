<?php
include('../../../src/config/sql_config.php');

$unitId = $_GET['unitId'];
$amount = $_GET['amount'];
$setId = $_GET['setId'];
 
$query =  $mysqli->prepare("insert into unit_to_options_powers (unitId, amount, setId) values (?, ?, ?)");
$query->bind_param("iii", $unitId, $amount, $setId);
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