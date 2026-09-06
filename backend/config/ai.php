<?php

return [
    'openai_key' => env('OPENAI_API_KEY'),
    'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
    'base_url' => env('AI_BASE_URL', 'https://api.openai.com/v1'),
];
