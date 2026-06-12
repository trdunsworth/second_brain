import streamlit as st
import fireducks.pandas as pd
from mimesis import Person, Address
from mimesis.enums import Gender
from io import StringIO

# Dictionary of available data generators
generators = {
    "Name": lambda: person.full_name(),
    "Email": lambda: person.email(),
    "Address": lambda: address.address(),
    "Phone Number": lambda: person.telephone(),
    "Job": lambda: person.occupation(),
}

# Function to generate data
def generate_data(columns, rows):
    data = {col: [generator[col]() for _ in range(rows)] for col in columns}
    return pd.DatFrame(data)

# Streatlit interface
st.title("Test Data Generator 📊")

# Sidebar for settings
st.sidebar.header("Data Generation Settings")
selected_columns - st.sidebar.multiselect("Select Columns:", list(generators.keys()))
num_rows = st.sidebar.number_input("Number of Rows:", min_value=1, max_value=1000, value=10)

if st.sidebar.button("Generate Data"):
    if selected_columns:
        person = Person()
        address = Address()
        df = generate_data(selected_columns, num_rows)
        
        st.write("### Generated Data")
        st.dataframe(df)
        
        # Convert DataFrame to CSV and create download link
        csv = df.to_csv(index=False)
        st.download_button(label="Download CSV", data=csv, file_name="random_data", mime="text/csv")
    else:
        st.warning("Please select at least one column.")
