<?php
include('../../src/config/sql_config.php');


$name           = $_GET['name'];
$numModels      = $_GET['numModels'];
$cost           = $_GET['cost'];
$factionId      = $_GET['factionId'];

 
$query =  $mysqli->prepare("insert into units (name, numberOfModels, costPerModel, factionId) values (?, ?, ?, ?)");
$query->bind_param("siii", $name, $numModels, $cost, $factionId);
$query->execute();
$result = $query->get_result();
$arr = array();
 while ($obj=mysqli_fetch_object($result)){
      $arr[] = $obj;
}
$query->close();

#JSON-encode the response (necessary for interaction with angular)
#Return the id of the recently created unit
$last_id = $mysqli->insert_id;
$json_response = json_encode($last_id);
echo $json_response;
mysqli_free_result($result);
?>