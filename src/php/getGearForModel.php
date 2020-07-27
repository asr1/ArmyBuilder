<?php
include('../config/sql_config.php');

$modelId = $_GET['modelId'];
$query =  $mysqli->prepare("select model_to_gear.*, gear.*, gear_abilities.* from model_to_gear left join gear on gear.id = model_to_gear.gearId left join gear_to_abilities on gear.id = gear_to_abilities.gearId left join gear_abilities on gear_abilities.id=abilityId where modelId=?");
$query->bind_param("i", $modelId);
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