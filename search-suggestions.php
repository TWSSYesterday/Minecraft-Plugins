<?php

// The JSON files.
$files = array("/var/www/minecraft-plugins/bukkit-plugins.json", "/var/www/minecraft-plugins-dev/bukkit-plugins.json");

// Get the JSON file from BukGet.
$plugin_list = file_get_contents("http://api.bukget.org/3/plugins/bukkit?fields=plugin_name,slug&sort=plugin_name");

// Decode the JSON data.
$data = json_decode($plugin_list, true);

// Create a new array for storage.
$suggestions = array();

// Add data to the array, formatting so jQuery autocomplete can read it.
foreach ($data as $value) {
    $suggestions[] = array("value" => $value["plugin_name"], "data" => $value["slug"]);
}

// Write the JSON to the file.
foreach ($files as $file) {
    file_put_contents($file, json_encode(array("suggestions" => $suggestions)));
}
