import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Game from './components/Game';
import Rules from "./components/Rules";
import NavBar from "./components/NavBar";
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Game />} />
          <Route path="/rules" element={<Rules />} />
        </Routes>
      </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
