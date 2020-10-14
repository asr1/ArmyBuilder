<?php
include('../config/sql_config.php');

$setId = $_GET['setId'];
 
$query =  $mysqli->prepare(" select * from item_sets left join item_to_set i2s on i2s.setId=item_sets.id left join gear on gear.id=itemId where setId=?");
$query->bind_param("i", $setId);
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