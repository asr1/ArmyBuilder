<?php
include('../../src/config/sql_config.php');


$addonId           = $_GET['addonId'];
$requiresId      = $_GET['requiresId'];

 
$query =  $mysqli->prepare("insert into addon_requires_addon (addonId, requiresAddonId) values (?, ?)");
$query->bind_param("ii", $addonId, $requiresId);
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