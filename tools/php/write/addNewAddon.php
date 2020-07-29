<?php
include('../../src/config/sql_config.php');

$text           = $_GET['text'];
$cost           = $_GET['cost'];
$typeId         = $_GET['typeId'];
$addItemId      = $_GET['addItemId'];
$removeItemId   = $_GET['removeItemId'];
$amount         = $_GET['amount'];
$times         = $_GET['times'];
$modelId         = $_GET['modelId'];

 
$query =  $mysqli->prepare("insert into addons (text, cost, typeid, itemIdToAdd, itemIdToRemove, amount, times, modelIdToAdd) values (?, ?, ?, ?, ?, ?, ?, ?)");
$query->bind_param("siiiiiiii", $text, $cost, $typeId, $addItemId, $removeItemId, $amount, $times, $modelId);
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