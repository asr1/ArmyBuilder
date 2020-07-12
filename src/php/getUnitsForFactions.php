<?php
include('../config/sql_config.php');

$factionIds = $_GET['factionIds'];
// // It feels like there should be an easier way to take in an array of parameters. This is hedge magic and I'm deeply resentful that it works.
$ids = implode(",",$factionIds); // Array to comma-delimted string
$newIdsArr = explode(",", $ids);

$params = implode(",", array_fill(0, count($newIdsArr), "?")); // Build a string with the right number of ?s
$query =  $mysqli->prepare("select * from units where factionId in ($params)");

$types = str_repeat("i", count($newIdsArr));			// "iii", roughly

$args = array_merge(array($types), $newIdsArr); 		// ["iii", 1,2,3]

call_user_func_array(array($query, 'bind_param'), $args); // See above re: hedge magic. This is equivalent to $query->bind_param("iii", 1,2,3) that we would normally call if we knew our argument count.
$query->execute();
$result = $query->get_result();
$query->close();
$arr = array();
 while ($obj=mysqli_fetch_object($result)){
      $arr[] = $obj;
   }
#JSON-encode the response (necessary for interaction with angular)
$json_response = json_encode($arr);

mysqli_free_result($result);
echo $json_response;
?>