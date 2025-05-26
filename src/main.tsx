import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import IPNLogo from "./assets/IPN Logo.png";
import EscudoESCOM from "./assets/EscudoESCOM.png";

Amplify.configure(outputs);

const Header = () => (
  <header className="app-header">
    <img src={IPNLogo} alt="Logo Izquierdo" style={{ height: '60px' }} />
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>ESCOM</div>
      <div style={{ fontSize: '1.2em' }}>Trabajo Terminal 2025 - A115</div>
      <div style={{ fontSize: '1.2em' }}>"Detección de tumores pulmonares en radiografias toracicas mediante inteligencia artificial"</div>
    </div>
    <img src={EscudoESCOM} alt="Logo Derecho" style={{ height: '60px' }} />
  </header>
);

const Footer = () => (
  <footer className="app-footer">
    <p>
      Aviso de Privacidad: Los datos recopilados en esta aplicación se utilizarán
      únicamente con fines académicos y de investigación. No se compartirán con
      terceros.
    </p>
  </footer>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Header />
    <main>
      <Authenticator>
        <App />
      </Authenticator>
    </main>
    <Footer />
  </React.StrictMode>
);