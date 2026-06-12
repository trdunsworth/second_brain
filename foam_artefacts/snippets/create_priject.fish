#!/bin/fish

# Function to check if a directory exists
function dir_exists
    set -l dir (ls -d "$argv") 2>/dev/null
    return $status
end

# Function to create a project directory
function create_project_dir
    if test (dir_exists "$argv")
        echo "Project directory '$argv' already exists."
        return 1
    end
    mkdir -p "$argv"
    cd "$argv"
end

# Project name argument
set -l project_name (commandline -p 1)

# Check if project name is provided
if test -z "$project_name"
    echo "Please provide a project name."
    exit 1
end

# Create project directory
create_project_dir $project_name

# Initialize uv environment with virtualenv
uv init -e python@3.12

# Install required libraries
uv install pytemplate-uv
uv install pyforest
uv install fitter
uv install Faker
uv install plotly
uv install fireducks
uv install duckdb
uv install statsmodels
uv install nixtla[all] 

# Install time series forecasting libraries
uv install gluonts
uv install kats
uv install prophet
uv install orbit-ml 

# Install zero-shot forecasting libraries
# (Note: Specific zero-shot libraries may vary, research and add accordingly)
# Example:
# uv install zeroshots 

# Install time series analysis and classification libraries
uv install pmdarima 
uv install sktime

# Create project structure
mkdir -p data models utils

# Create template files (replace with your preferred content)
touch __init__.py requirements.txt README.md .gitignore

# Example __init__.py
echo "# Project initialization file" >> __init__.py

# Example requirements.txt (add specific libraries here)
echo "# List of required libraries" >> requirements.txt

# Example README.md
echo "# Project: $project_name" >> README.md
echo "This project is for time series forecasting." >> README.md

# Example .gitignore (customize as needed)
echo "# Ignore virtual environment" >> .gitignore
echo "venv/" >> .gitignore

# Print success message
echo "Project '$project_name' created successfully with virtual environment and recommended structure."
echo "Happy coding!"
