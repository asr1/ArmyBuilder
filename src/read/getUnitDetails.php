<?php
include('../config/sql_config.php');

$unitId = $_GET['unitId'];
 
$query =  $mysqli->prepare("select * from units left join unit_to_gear on units.id = unitId left join gear on gear.id = gearId where units.id =?");
$query->bind_param("i", $unitId);
$query->execute();
$result = $query->get_result();
$arr = array();
while ($row = $result->fetch_array(MYSQLI_NUM)) {
  foreach ($row as $r) {
		$arr[] = $r;
	}
}

#JSON-encode the response (necessary for interaction with angular)
$json_response = json_encode($arr);

echo $json_response;
mysqli_free_result($result);
?>