<?php
include('../config/sql_config.php');

$unitId = $_GET['unitId'];
 
$query =  $mysqli->prepare(" select * from model_to_options_powers m2op left join power_to_set p2s on p2s.setId= m2op.setId left join powers on powers.id=powerId where unitId=?");
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