<?php
include('../config/sql_config.php');

$id = $_GET['id'];
 
$query =  $mysqli->prepare("select * from gear = gearId where id=?");
$query->bind_param("i", $id);
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