<?php
	$data = json_decode($_POST['data']);

	$fichero = $data -> user . ".json";
	//Si existe un fichero para ese usuario lo borra
	if(file_exists($fichero)){ 
		unlink($fichero);
	}
	//Crea el fichero
	$fd = fopen($fichero,"a+"); 
	fputs($fd,json_encode($data));
	fclose($fd);   
?>