<?php
include('../../src/config/sql_config.php');

$text           = $_GET['text'];
$cost           = $_GET['cost'];
$typeId         = $_GET['typeId'];
$levelId        = $_GET['levelId'];
$addItemId      = $_GET['addItemId'];
$removeItemId   = $_GET['removeItemId'];
$amount         = $_GET['amount'];
$times         = $_GET['times'];

 
$query =  $mysqli->prepare("insert into addons (text, cost, typeid, addonLevelId, itemIdToAdd, itemIdToRemove, amount, times) values (?, ?, ?, ?, ?, ?, ?, ?)");
$query->bind_param("siiiiiii", $text, $cost, $typeId, $levelId, $addItemId, $removeItemId, $amount, $times);
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