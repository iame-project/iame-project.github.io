<?php
// get the q parameter from URL
$q = $_REQUEST["q"];
$inputkey = substr($q,0,5);
$line=-1;
$i = 0;

//search for key
$myfile1 = fopen("data.txt", "r") or die("Unable to open file!");
while(!feof($myfile1)){
    $string = fgets($myfile1);
    $key = substr($string,0,5);
    if($key == $inputkey){
        $line = $i;
    }
    $i++;
}
fclose($myfile1);

//if key found
if($line >-1){
    //grab whole file
    $myfile = fopen("data.txt", "r") or die("Unable to open file!");
    $read = fread($myfile,filesize("data.txt"));
    $tempRead  = explode("\n",$read); //split by line
    fclose($myfile);
    
    $tempRead[$line] = $q;
    $newData = implode("\n",$tempRead);
    $myfile2 = fopen("data.txt", "w") or die("Unable to open file!");
    //$q = "\n".$q;
    fwrite($myfile2, $newData);
    fclose($myfile2);
}
//if key wasnt found
else{
    $myfile2 = fopen("data.txt", "a") or die("Unable to open file!");
    $q = "\n".$q;
    fwrite($myfile2, $q);
    fclose($myfile2);
}

echo $line;
