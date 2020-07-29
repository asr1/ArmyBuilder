<?php
include('../../../src/config/sql_config.php');

$name = $_GET['name'];
$text = $_GET['text'];
 
$query =  $mysqli->prepare("insert into powers (name, text) values (?, ?)");
$query->bind_param("ssi", $name, $text);
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