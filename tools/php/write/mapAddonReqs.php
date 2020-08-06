<?php
include('../../src/config/sql_config.php');

$addonId           = $_GET['addonId'];
$requirementType   = $_GET['requirementType'];
$prereqAddonId     = $_GET['prereqAddonId'];
$min               = $_GET['min'];
$max               = $_GET['max'];
 
$query =  $mysqli->prepare("insert into addon_requires (addonId, requireType, requiresAddonId, min, max) values (?, ?, ?, ?, ?)");
$query->bind_param("iiiii", $addonId, $requirementType, $prereqAddonId, $prereqAddonId, $min, $max);
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