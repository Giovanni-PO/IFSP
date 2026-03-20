import React from 'react';
import ReactDOM from 'react-dom/client';  // ← ESTAVA FALTANDO ISSO!
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './components/Home.jsx';
import EstoqueG from './components/EstoqueG.jsx';
import EstoqueLocal from './components/EstoqueLocal.jsx';

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/estoque", element: <EstoqueG /> },
  { path: "/estoque/:codigo", element: <EstoqueLocal /> }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
