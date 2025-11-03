import React from "react";
import Button from "@atlaskit/button";
import { token } from "@atlaskit/tokens";
import { useUserStore } from "../store/userStore";

const JiraLogin: React.FC = () => {
  const { isLoggedIn, userInfo, logout } = useUserStore();

  const handleLogin = () => {
    const clientId = import.meta.env.VITE_JIRA_CLIENT_ID!;
    const redirectUri = import.meta.env.VITE_JIRA_REDIRECT_URI!;
    const scopes = import.meta.env.VITE_JIRA_SCOPES || "read:jira-work write:jira-work manage:jira-configuration read:jira-user offline_access";

    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${encodeURIComponent(
      scopes
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&prompt=consent&access_type=offline&state=random123`;

    window.location.href = authUrl;
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: token("color.background.discovery.bold", "#0747A6"),
        color: "white",
      }}
    >
      {!isLoggedIn ? (
        <>
          <h1>Welcome to Jira Sync Platform</h1>
          <Button appearance="primary" onClick={handleLogin}>Login with Jira</Button>
        </>
      ) : (
        <>
          <h2>Hello, {userInfo?.name}</h2>
          <Button appearance="danger" onClick={logout}>Logout</Button>
        </>
      )}
    </div>
  );
};

export default JiraLogin;
