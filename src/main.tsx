import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';


Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
    
  <React.StrictMode>
    <Authenticator>
      {({ signOut, user, isLoading }) => (
        isLoading ? (
          <div>Loading...</div>
        ) : (
          <div>
            <h1>Welcome, {user?.username}!</h1>
            <App />
            <button onClick={signOut}>Sign Out</button>
          </div>
        )
      )}
    </Authenticator>
  </React.StrictMode>
);
