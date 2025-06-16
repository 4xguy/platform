#!/bin/sh
# Filter out communication packages from rush.json using sed/awk
# This is more reliable than trying to parse JSONC in Node.js

echo "Filtering communication packages from rush.json..."

# Create a backup
cp rush.json rush.json.backup

# Use awk to filter out project blocks containing "communication"
awk '
BEGIN { 
    in_project = 0
    bracket_count = 0
    skip_project = 0
    buffer = ""
}
{
    # Detect start of a project block
    if ($0 ~ /"packageName":.*communication/) {
        skip_project = 1
    }
    
    # Track brackets to know when we are in/out of a project object
    if ($0 ~ /{/) {
        bracket_count++
        if (bracket_count == 1 && prev_line ~ /"projects":/) {
            in_projects_array = 1
        }
        if (in_projects_array && bracket_count == 2) {
            in_project = 1
            buffer = ""
        }
    }
    
    # Accumulate lines in buffer when in a project
    if (in_project) {
        buffer = buffer $0 "\n"
    } else {
        print $0
    }
    
    # Track closing brackets
    if ($0 ~ /}/) {
        bracket_count--
        if (in_project && bracket_count == 1) {
            # End of project object
            if (!skip_project) {
                # Print the buffered project
                printf "%s", buffer
            }
            in_project = 0
            skip_project = 0
            buffer = ""
        }
    }
    
    prev_line = $0
}
' rush.json > rush.json.filtered

# Check if filtering worked
if [ -s rush.json.filtered ]; then
    mv rush.json.filtered rush.json
    echo "Successfully filtered rush.json"
else
    echo "Filtering failed, restoring backup"
    mv rush.json.backup rush.json
    exit 1
fi