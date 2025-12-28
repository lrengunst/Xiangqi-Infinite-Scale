import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as Tribunal from './tests/suite';

// --- A.R.E.S BOOT SEQUENCE ---

// 1. Hardware Check (Placeholder)
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element missing. System failure.");
}

// 2. Performance Tribunal (Mandatory Audit)
// If this fails, it throws an error and halts rendering.
try {
  Tribunal.run();
} catch (e) {
  // The Tribunal has already logged the JSON Evidence to console.error.
  // We now render the Blue Screen of Death (Black in this case).
  document.body.innerHTML = `
    <div style="
      background:#000; 
      color:#ef4444; 
      font-family:'Courier New', monospace; 
      padding:2rem; 
      height:100vh; 
      display:flex; 
      flex-direction:column; 
      justify-content:center;
      align-items:center;
      text-align:center;
    ">
      <h1 style="font-size: 4rem; margin-bottom: 1rem;">SYSTEM HALTED</h1>
      <h2 style="color: #fca5a5;">PERFORMANCE TRIBUNAL VERDICT: GUILTY</h2>
      <p style="max-width: 600px; line-height: 1.5;">
        The code failed to meet the rigorous O(1) latency requirements mandated by the War Protocol.
        <br/><br/>
        <strong>STEEL EVIDENCE</strong> has been logged to the Developer Console (F12).
      </p>
    </div>
  `;
  throw e;
}

// 3. Render (Only if Tribunal passes)
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);