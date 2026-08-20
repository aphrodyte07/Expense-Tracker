import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime

st.set_page_config(page_title='Expense Tracker', layout='wide')

# Initialize data
if 'expenses' not in st.session_state:
    st.session_state.expenses = pd.DataFrame(columns=['Date', 'Category', 'Amount', 'Note'])

st.title('💵 Modern Expense Tracker')

# Sidebar Input
with st.sidebar:
    st.header('Add Transaction')
    date = st.date_input('Date', datetime.now())
    cat = st.selectbox('Category', ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Other'])
    amt = st.number_input('Amount ($)', min_value=0.0, step=0.01)
    note = st.text_input('Note')
    if st.button('Add Expense'):
        new_row = pd.DataFrame([[date, cat, amt, note]], columns=['Date', 'Category', 'Amount', 'Note'])
        st.session_state.expenses = pd.concat([st.session_state.expenses, new_row], ignore_index=True)
        st.success('Transaction added!')

# Dashboard
col1, col2 = st.columns([2, 1])

with col1:
    st.subheader('Transaction History')
    st.dataframe(st.session_state.expenses, use_container_width=True)

with col2:
    st.subheader('Summary')
    total = st.session_state.expenses['Amount'].sum()
    st.metric('Total Spent', f'${total:,.2f}')
    
    if not st.session_state.expenses.empty:
        fig = px.pie(st.session_state.expenses, values='Amount', names='Category', title='Spending by Category')
        st.plotly_chart(fig, use_container_width=True)