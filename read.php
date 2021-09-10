<?php
// get the q parameter from URL
$q = $_REQUEST["q"];
$found = false;

$myfile = fopen("data.txt", "r") or die("Unable to open file!");

//search for key
while(!feof($myfile)){
    //check key
    $string = fgets($myfile);
    $key = substr($string,0,5);
    
    if($key === $q){
        $info = substr($string,6);
        echo $info;
        $found = true;
    }
}
if(!$found){
    echo "key not found";
}

fclose($myfile);
