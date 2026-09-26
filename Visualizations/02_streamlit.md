# Streamlit Learning Guide

## Overview
Streamlit is an open-source Python library that makes it easy to create and share beautiful, custom web apps for machine learning and data science. It turns data scripts into shareable web apps in minutes, with hot-reloading, automatic UI generation, and seamless integration with the Python data ecosystem.

## Quick Template

```python
# app.py - Minimal Streamlit App
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px

st.set_page_config(page_title="My App", layout="wide")

st.title("📊 My First Streamlit App")

# Sidebar
with st.sidebar:
    st.header("Controls")
    n_points = st.slider("Number of points", 10, 1000, 100)
    chart_type = st.selectbox("Chart type", ["Scatter", "Line", "Histogram"])

# Main content
col1, col2 = st.columns([2, 1])

with col1:
    # Generate data
    df = pd.DataFrame({
        'x': np.random.randn(n_points),
        'y': np.random.randn(n_points),
        'category': np.random.choice(['A', 'B', 'C'], n_points)
    })
    
    # Dynamic chart
    if chart_type == "Scatter":
        fig = px.scatter(df, x='x', y='y', color='category', 
                         title=f"{chart_type} Plot ({n_points} points)")
    elif chart_type == "Line":
        df_sorted = df.sort_values('x')
        fig = px.line(df_sorted, x='x', y='y', color='category',
                      title=f"{chart_type} Plot ({n_points} points)")
    else:
        fig = px.histogram(df, x='x', color='category', nbins=30,
                           title=f"{chart_type} ({n_points} points)")
    
    st.plotly_chart(fig, use_container_width=True)

with col2:
    st.subheader("Statistics")
    st.metric("Mean X", f"{df['x'].mean():.3f}")
    st.metric("Mean Y", f"{df['y'].mean():.3f}")
    st.metric("Std X", f"{df['x'].std():.3f}")
    
    st.subheader("Data Preview")
    st.dataframe(df.head(10), use_container_width=True)
    
    # Download
    csv = df.to_csv(index=False).encode('utf-8')
    st.download_button("📥 Download CSV", csv, "data.csv", "text/csv")
```

## Core Syntax Cheatsheet

| Element | Syntax | Example |
|---------|--------|---------|
| Page Config | `st.set_page_config(...)` | `st.set_page_config(layout="wide")` |
| Title | `st.title()`, `st.header()`, `st.subheader()` | `st.title("My App")` |
| Text | `st.write()`, `st.markdown()`, `st.text()` | `st.markdown("**Bold**")` |
| Sidebar | `st.sidebar.*` | `st.sidebar.slider("x", 0, 100)` |
| Columns | `st.columns(spec)` | `col1, col2 = st.columns([2, 1])` |
| Tabs | `st.tabs(list)` | `tab1, tab2 = st.tabs(["A", "B"])` |
| Expander | `st.expander(label)` | `with st.expander("Details"): ...` |
| Container | `st.container()` | `with st.container(): ...` |
| Empty | `st.empty()` | `placeholder = st.empty()` |
| Button | `st.button(label)` | `if st.button("Run"): ...` |
| Slider | `st.slider(label, min, max, val)` | `st.slider("N", 1, 100, 50)` |
| Selectbox | `st.selectbox(label, options)` | `st.selectbox("Type", ["A", "B"])` |
| Multiselect | `st.multiselect(label, options)` | `st.multiselect("Cols", df.columns)` |
| Text Input | `st.text_input(label)` | `st.text_input("Name")` |
| Number Input | `st.number_input(label)` | `st.number_input("Age", 0, 120)` |
| File Upload | `st.file_uploader(label)` | `st.file_uploader("CSV", type="csv")` |
| Date Input | `st.date_input(label)` | `st.date_input("Date")` |
| Color Picker | `st.color_picker(label)` | `st.color_picker("Color")` |
| Checkbox | `st.checkbox(label)` | `st.checkbox("Show advanced")` |
| Radio | `st.radio(label, options)` | `st.radio("Mode", ["A", "B"])` |
| Data Display | `st.dataframe()`, `st.table()` | `st.dataframe(df, use_container_width=True)` |
| Metrics | `st.metric(label, value, delta)` | `st.metric("Revenue", "$1.2M", "+5%")` |
| JSON | `st.json(obj)` | `st.json({"a": 1})` |
| Code | `st.code(code, language)` | `st.code("print('hi')", "python")` |
| Charts | `st.line_chart()`, `st.bar_chart()` | `st.line_chart(df.set_index('x'))` |
| Plotly | `st.plotly_chart(fig)` | `st.plotly_chart(fig, use_container_width=True)` |
| Altair | `st.altair_chart(chart)` | `st.altair_chart(chart, use_container_width=True)` |
| Pyplot | `st.pyplot(fig)` | `st.pyplot(plt.gcf())` |
| Map | `st.map(df)` | `st.map(df[['lat', 'lon']])` |
| Image | `st.image(img)` | `st.image("plot.png")` |
| Audio/Video | `st.audio()`, `st.video()` | `st.video("demo.mp4")` |
| Cache Data | `@st.cache_data` | `@st.cache_data def load(): ...` |
| Cache Resource | `@st.cache_resource` | `@st.cache_resource def get_model(): ...` |
| Session State | `st.session_state.key` | `st.session_state.counter += 1` |
| Form | `with st.form(key): ...` | `with st.form("my_form"): ...` |
| Fragment | `@st.fragment` | `@st.fragment def chart(): ...` |
| Dialog | `@st.dialog` | `@st.dialog("Title") def modal(): ...` |

## Practical Examples

### 1. Multi-Page App with Navigation

```python
# Home.py (main page)
import streamlit as st

st.set_page_config(page_title="Multi-Page App", page_icon="🏠", layout="wide")

st.title("Welcome to the App")
st.write("Select a page from the sidebar.")

# pages/1_📊_Dashboard.py
import streamlit as st
import plotly.express as px

st.title("📊 Dashboard")
# ... dashboard content

# pages/2_🔬_Analysis.py
import streamlit as st

st.title("🔬 Analysis")
# ... analysis content
```

### 2. Caching for Performance

```python
import streamlit as st
import pandas as pd
import duckdb

# Cache data loading (serializable)
@st.cache_data(ttl=3600, show_spinner="Loading data...")
def load_data(path: str) -> pd.DataFrame:
    return pd.read_parquet(path)

# Cache expensive computation
@st.cache_data(max_entries=10)
def compute_aggregations(df: pd.DataFrame, group_cols: list) -> pd.DataFrame:
    return df.groupby(group_cols).agg({
        'value': ['mean', 'sum', 'count'],
        'cost': 'sum'
    }).reset_index()

# Cache resources (non-serializable: DB connections, ML models)
@st.cache_resource
def get_db_connection():
    return duckdb.connect("data.duckdb")

@st.cache_resource
def load_model(model_path: str):
    import joblib
    return joblib.load(model_path)

# Usage
conn = get_db_connection()
df = load_data("data.parquet")
model = load_model("model.pkl")
```

### 3. Session State for Complex Interactions

```python
import streamlit as st

# Initialize session state
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "user_name" not in st.session_state:
    st.session_state.user_name = ""

# Callback functions
def add_message(role: str, content: str):
    st.session_state.chat_history.append({"role": role, "content": content})

def clear_chat():
    st.session_state.chat_history = []

# UI
st.title("💬 Chat App")

with st.sidebar:
    st.text_input("Your name", key="user_name", on_change=lambda: None)
    st.button("Clear Chat", on_click=clear_chat)

# Display chat
for msg in st.session_state.chat_history:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])

# Chat input (Streamlit 1.24+)
if prompt := st.chat_input("Type a message..."):
    add_message("user", prompt)
    with st.chat_message("assistant"):
        response = f"Echo: {prompt}"  # Replace with LLM call
        st.write(response)
        add_message("assistant", response)
```

### 4. Forms for Batch Input

```python
import streamlit as st

with st.form("model_config", clear_on_submit=False):
    st.subheader("Model Configuration")
    
    col1, col2 = st.columns(2)
    with col1:
        model_type = st.selectbox("Model", ["RandomForest", "XGBoost", "LightGBM"])
        n_estimators = st.number_input("N Estimators", 10, 1000, 100)
        max_depth = st.number_input("Max Depth", 1, 50, 10)
    
    with col2:
        learning_rate = st.number_input("Learning Rate", 0.001, 1.0, 0.1, format="%.3f")
        subsample = st.slider("Subsample", 0.1, 1.0, 0.8)
        random_state = st.number_input("Random State", 0, 9999, 42)
    
    submitted = st.form_submit_button("🚀 Train Model", type="primary")
    
    if submitted:
        with st.spinner("Training..."):
            # Train model
            metrics = train_model(model_type, n_estimators, max_depth, 
                                learning_rate, subsample, random_state)
            
            st.success("Training complete!")
            st.json(metrics)
```

### 5. Fragments for Partial Reruns (Streamlit 1.33+)

```python
import streamlit as st
import pandas as pd
import time

@st.fragment(run_every="5s")
def live_metrics():
    """This fragment reruns every 5 seconds independently."""
    data = fetch_live_data()
    col1, col2, col3 = st.columns(3)
    col1.metric("CPU", f"{data['cpu']}%")
    col2.metric("Memory", f"{data['mem']}%")
    col3.metric("Requests/s", data['rps'])

@st.fragment
def interactive_chart():
    """Only reruns when its inputs change."""
    symbol = st.selectbox("Symbol", ["AAPL", "GOOGL", "MSFT"], key="symbol_frag")
    period = st.select_slider("Period", ["1D", "1W", "1M", "1Y"], key="period_frag")
    chart = create_chart(symbol, period)
    st.plotly_chart(chart, use_container_width=True)

def main():
    st.title("📈 Trading Dashboard")
    live_metrics()  # Auto-refreshes
    st.divider()
    interactive_chart()  # Only updates on interaction

if __name__ == "__main__":
    main()
```

### 6. Dialogs/Modals (Streamlit 1.34+)

```python
import streamlit as st

@st.dialog("⚙️ Settings")
def settings_modal():
    st.write("Configure your preferences:")
    theme = st.radio("Theme", ["Light", "Dark", "Auto"])
    notifications = st.checkbox("Enable notifications", True)
    language = st.selectbox("Language", ["English", "Spanish", "French"])
    
    if st.button("Save", type="primary"):
        st.session_state.settings = {
            "theme": theme, "notifications": notifications, "language": language
        }
        st.rerun()

# Trigger modal
if st.button("Open Settings"):
    settings_modal()

# Confirmation dialog
@st.dialog("Confirm Delete")
def confirm_delete(item_name: str):
    st.write(f"Are you sure you want to delete **{item_name}**?")
    col1, col2 = st.columns(2)
    if col1.button("Yes, delete", type="primary"):
        delete_item(item_name)
        st.rerun()
    if col2.button("Cancel"):
        st.rerun()
```

### 7. Custom Components with `streamlit.components.v1`

```python
# components/my_component/frontend/index.html
<div id="root"></div>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="./my_component.js"></script>

# components/my_component/my_component.py
import streamlit.components.v1 as components

_component_func = components.declare_component(
    "my_component",
    path="frontend"
)

def my_component(name: str, default: int = 0, key=None):
    return _component_func(name=name, default=default, key=key)

# Usage in app
value = my_component("counter", default=0, key="counter1")
st.write(f"Counter value: {value}")
```

### 8. Authentication with `streamlit-authenticator`

```python
# auth.py
import streamlit as st
import streamlit_authenticator as stauth
import yaml
from yaml.loader import SafeLoader

with open("config.yaml") as f:
    config = yaml.load(f, Loader=SafeLoader)

authenticator = stauth.Authenticate(
    config['credentials'],
    config['cookie']['name'],
    config['cookie']['key'],
    config['cookie']['expiry_days'],
    config['preauthorized']
)

def login():
    authenticator.login(location="main")
    
    if st.session_state["authentication_status"]:
        authenticator.logout("Logout", "sidebar")
        st.sidebar.write(f"Welcome *{st.session_state['name']}*")
        return True
    elif st.session_state["authentication_status"] is False:
        st.error("Username/password is incorrect")
        return False
    else:
        st.warning("Please enter your username and password")
        return False
```

### 9. Deployment Config

```toml
# .streamlit/config.toml
[server]
headless = true
port = 8501
enableCORS = false
enableXsrfProtection = true
maxUploadSize = 200

[browser]
gatherUsageStats = false
serverAddress = "your-domain.com"

[theme]
primaryColor = "#FF6B6B"
backgroundColor = "#FFFFFF"
secondaryBackgroundColor = "#F0F2F6"
textColor = "#262730"
font = "sans serif"

[runner]
magicEnabled = true
installTracer = false
fixMatplotlib = true

[logger]
level = "info"
messageFormat = "%(asctime)s %(levelname)s: %(message)s"
```

```yaml
# .github/workflows/deploy.yml
name: Deploy to Streamlit Cloud
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: streamlit/streamlit-cloud-deploy-action@v1
        with:
          app-path: "app.py"
          github-token: ${{ secrets.GITHUB_TOKEN }}
          streamlit-api-token: ${{ secrets.STREAMLIT_API_TOKEN }}
```

## Common Streamlit Uses

- **ML Model Demos** - Interactive model inference, hyperparameter tuning
- **Data Exploration** - EDA dashboards, data quality reports
- **Internal Tools** - Admin panels, annotation interfaces, data entry
- **Reporting** - Automated business reports with parameterized inputs
- **Prototyping** - Rapid UI for data science workflows
- **Education** - Interactive tutorials, coding exercises

## Streamlit Advantages

- **Pure Python** - No HTML/CSS/JS required
- **Hot Reloading** - Instant feedback during development
- **Automatic UI** - Widgets generated from type hints
- **Rich Ecosystem** - Integrates with pandas, plotly, altair, pydeck, etc.
- **Free Hosting** - Streamlit Community Cloud
- **Session State** - Built-in state management
- **Caching** - Smart caching with `@st.cache_data`/`@st.cache_resource`
- **Fragments** - Partial reruns for real-time dashboards

## Streamlit Pitfalls

- **Rerun Model** - Entire script reruns on interaction; use caching/fragments
- **Large Data** - Memory limits; use `st.dataframe` with `height`, pagination
- **State Persistence** - Session state resets on browser refresh
- **Custom Styling** - Limited CSS; use `st.html()` or custom components
- **Authentication** - Not built-in; use `streamlit-authenticator` or OAuth
- **Mobile** - Not mobile-optimized by default
- **Real-time** - Fragments help but not true WebSockets

## Awesome Streamlit Resources

- **[Streamlit Docs](https://docs.streamlit.io)** - Comprehensive documentation
- **[Streamlit Gallery](https://streamlit.io/gallery)** - Example apps
- **[awesome-streamlit](https://github.com/streamlit/awesome-streamlit)** - Curated resources
- **[Streamlit Components](https://github.com/streamlit/components)** - Custom components
- **[Streamlit Extras](https://github.com/arnaudmiribel/streamlit-extras)** - Extra components
- **[streamlit-option-menu](https://github.com/victoryhb/streamlit-option-menu)** - Nav menus
- **[streamlit-elements](https://github.com/okld/streamlit-elements)** - MUI components
- **[st-pages](https://github.com/blackary/st_pages)** - Multi-page navigation
- **[streamlit-aggrid](https://github.com/PablocFonseca/streamlit-aggrid)** - AG Grid wrapper
- **[streamlit-drawable-canvas](https://github.com/andfanilo/streamlit-drawable-canvas)** - Canvas
- **[streamlit-folium](https://github.com/randyzwitch/streamlit-folium)** - Folium maps
- **[streamlit-geospatial](https://github.com/thangqd/streamlit-geospatial)** - Geospatial apps
- **[streamlit-lightweight-charts](https://github.com/whitphx/streamlit-lightweight-charts)** - Financial charts
- **[streamlit-ace](https://github.com/okld/streamlit-ace)** - Code editor
- **[streamlit-chat](https://github.com/ai-yash/st-chat)** - Chat interface

## Streamlit vs Other Tools

| Feature | Streamlit | Shiny | Dash | Panel | Gradio |
|---------|-----------|-------|------|-------|--------|
| Language | Python | R | Python | Python | Python |
| Reactivity | Script rerun | Reactive | Callbacks | Reactive | Event-based |
| Learning Curve | Low | Medium | Medium | Medium | Low |
| ML Focus | High | Medium | High | Medium | Very High |
| Deployment | Cloud/Container | Connect/Container | Container | Container | HuggingFace/Container |
| Custom Components | React/HTML | React/HTML | React | Bokeh/React | Python/JS |
| Best For | ML demos, quick apps | Complex dashboards | Production dashboards | HoloViz stack | LLM/ML demos |

## Streamlit Quick Checklist

1. **Structure** - Use multi-page apps (`pages/` folder) for organization
2. **Caching** - `@st.cache_data` for data, `@st.cache_resource` for models/connections
3. **Session State** - Initialize in `if "key" not in st.session_state` blocks
4. **Forms** - Batch inputs with `st.form` to prevent partial reruns
5. **Fragments** - Use `@st.fragment` for auto-refreshing or independent sections
6. **Layout** - `st.columns`, `st.tabs`, `st.expander` for organization
7. **Performance** - Limit dataframe rows displayed; use `height` parameter
8. **Types** - Add type hints for better widget inference
9. **Secrets** - Use `.streamlit/secrets.toml` for API keys
10. **Testing** - `streamlit test` for snapshot testing; pytest for logic

---

*Last updated: 2024 | Streamlit 1.36+ compatible*