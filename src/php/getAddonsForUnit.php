<?php
include('../config/sql_config.php');

$unitId = $_GET['unitId'];
 
$query =  $mysqli->prepare("select u2o.*, addons.*, levels.name as level from unit_to_addon as u2o left join addons on addonId = addons.id left join addon_level levels on levels.id = addonLevelId where unitId=?");
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