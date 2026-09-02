uv self update
sleep 10
uv init my_project --python 3.12.6
cd my_proejct
source .venv/bin/activate.fish
sleep 10
uv pip install --upgrade pytemplate-uv pyforest fireducks duckdb plotly nixtla statsforecast neuralforecast mlforecast hierarchicalforecast utilsforecast
sleep 10
uv sync
uv lock
