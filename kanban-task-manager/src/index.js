import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// базовый URL для всех запросов
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// если есть токен — автоматически приклеиваем его
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot
  ? ReactDOM.createRoot(container)
  : { render: (el) => ReactDOM.render(el, container) };

root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
);

reportWebVitals();
