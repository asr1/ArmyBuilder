<?php
include('../config/sql_config.php');

$modelId = $_GET['modelId'];
 
$query =  $mysqli->prepare("select * from model_to_addon left join addons on addonId = addons.id where modelId=?");
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