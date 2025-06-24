<?php
return [
    'host'      => getenv('DB_HOST') ?: 'localhost',
    'port'      => getenv('DB_PORT') ?: '5432',
    'dbname'    => getenv('DB_NAME') ?: 'DarkOrder',
    'user'      => getenv('DB_USER') ?: 'rxcode_dba',
    'pwd'       => getenv('DB_PASSWORD') ?: 'Srvty04.1234',
];