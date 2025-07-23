#!/bin/bash
CONFIG_FILE="/app/dist/config.js"
PUBLIC_CONFIG_FILE="/app/public/config.js"

# Function to replace placeholders with actual env values
replace_env_vars() {
    local file=$1
    
    # Replace all VITE_ variables
    sed -i "s|__VITE_COLOR_1__|${VITE_COLOR_1}|g" "$file"
    sed -i "s|__VITE_COLOR_2__|${VITE_COLOR_2}|g" "$file"
    sed -i "s|__VITE_COLOR_3__|${VITE_COLOR_3}|g" "$file"
    sed -i "s|__VITE_COLOR_4__|${VITE_COLOR_4}|g" "$file"
    sed -i "s|__VITE_COLOR_5__|${VITE_COLOR_5}|g" "$file"
    sed -i "s|__VITE_COLOR_SUCCESS__|${VITE_COLOR_SUCCESS}|g" "$file"
    sed -i "s|__VITE_COLOR_WARNING__|${VITE_COLOR_WARNING}|g" "$file"
    sed -i "s|__VITE_COLOR_ERROR__|${VITE_COLOR_ERROR}|g" "$file"
    sed -i "s|__VITE_APP_PAGE_TITLE__|${VITE_APP_PAGE_TITLE}|g" "$file"
    sed -i "s|__VITE_APP_PAGE_DESC__|${VITE_APP_PAGE_DESC}|g" "$file"
    sed -i "s|__VITE_PROJECT_URL__|${VITE_PROJECT_URL}|g" "$file"
}

# For development - replace in public folder
if [ -f "$PUBLIC_CONFIG_FILE" ]; then
    replace_env_vars "$PUBLIC_CONFIG_FILE"
fi

# For production - replace in dist folder  
if [ -f "$CONFIG_FILE" ]; then
    replace_env_vars "$CONFIG_FILE"
fi