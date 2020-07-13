<?php
include('../config/sql_config.php');

$unitId = $_GET['unitId'];
 
$query =  $mysqli->prepare("select * from unit_to_gear left join gear on gear.id = gearId where unitId=?");
$query->bind_param("i", $unitId);
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