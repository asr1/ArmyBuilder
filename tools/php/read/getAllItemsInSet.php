<?php
include('../../../src/config/sql_config.php');

$setId = $_GET['setId'];

$query =  $mysqli->prepare(" select * from item_to_set left join gear on gear.id=item_to_set.itemId where item_to_set.setId = ?");
$query->bind_param("i", $setId);
$query->execute();
$result = $query->get_result();
$arr = array();
 while ($obj=mysqli_fetch_object($result)){
      $arr[] = $obj;
   }

#JSON-encode the response (necessary for interaction with angular)
$json_response = json_encode($arr);

echo $json_response;
mysqli_free_result($result);
?>