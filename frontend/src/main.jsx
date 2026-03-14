import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Page1 from './components/Page1.jsx';
import Page2 from './components/Page2.jsx';

const router = createBrowserRouter([
  { path: "/", element: <Page1 /> },
  { path: "/estoque", element: <Page2 /> }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
