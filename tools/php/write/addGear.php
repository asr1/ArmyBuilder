<?php
include('../../src/config/sql_config.php');

$name = $_GET['name'];
$cost = $_GET['cost'];
$rangeId = $_GET['rangeId'];
 
$query =  $mysqli->prepare("insert into gear (name, cost, gearRangeId) values (?, ?, ?)");
$query->bind_param("sii", $name, $cost, $rangeId);
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