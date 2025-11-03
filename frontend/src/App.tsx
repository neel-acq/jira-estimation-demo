import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JiraLogin from "./components/JiraLogin";
import OAuthCallback from "./components/OAuthCallback";
import "@atlaskit/css-reset";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JiraLogin />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;
