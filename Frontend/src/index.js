import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { ProSidebarProvider } from 'react-pro-sidebar';
import { AuthContextProvider } from './contexts/AuthContext.jsx';
// import { BalContextProvider } from './contexts/BalContext';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        {/* <BalContextProvider> */}
        <ProSidebarProvider>
          <App />
        </ProSidebarProvider>
        {/* </BalContextProvider> */}
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
