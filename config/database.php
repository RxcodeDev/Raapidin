<?php
return [
    'host'      => getenv('DB_HOST') ?: 'localhost',
    'port'      => getenv('DB_PORT') ?: '5432',
    'dbname'    => getenv('DB_NAME') ?: 'buensazon',
    'user'      => getenv('DB_USER') ?: 'postgres',
    'pwd'       => getenv('DB_PASSWORD') ?: '12345678',
];