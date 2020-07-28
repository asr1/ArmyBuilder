<?php
include('../config/sql_config.php');

$modelId = $_GET['modelId'];
 
$query =  $mysqli->prepare("select * from models where id=?");
$query->bind_param("i", $modelId);
$query->execute();
$result = $query->get_result();
$arr = array();
$obj=mysqli_fetch_object($result);
$query->close();

#JSON-encode the response (necessary for interaction with angular)
$json_response = json_encode($obj);

echo $json_response;
mysqli_free_result($result);
?>