<?php
include('../../src/config/sql_config.php');

$modelId = $_GET['modelId'];
$addonId = $_GET['addonId'];
 
$query =  $mysqli->prepare("insert into model_to_addon (modelId, addonId) values (?, ?)");
$query->bind_param("ii", $modelId, $addonId);
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