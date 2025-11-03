import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./OAuthCallback.css";

interface JiraProject {
  id: string;
  key: string;
  name: string;
}
interface JiraIssueType {
  id: number | string;
  name: string;
  description?: string | null;
}

const OAuthCallback: React.FC = () => {
  const baseUrl = false
    ? "https://multifaced-fawn-plushily.ngrok-free.dev"
    : "http://localhost:5000";
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string | null>(
    null
  );
  const [issueTypes, setIssueTypes] = useState<JiraIssueType[]>([]);
  const [error, setError] = useState<string | null>(null);

  // estimate data
  // Removed separate estimate data; use summaryData from unified endpoint
  // ADD: summaryData for new summary API
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // edit hours mode and staged changes
  const [editHoursEnabled, setEditHoursEnabled] = useState<boolean>(false);
  const [editedHoursByType, setEditedHoursByType] = useState<Record<string, string>>({});

  // UI state for add/edit
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [codeExchanged, setCodeExchanged] = useState(false);

  useEffect(() => {
    // Try to restore token from storage first so refresh keeps session
    const storedToken = localStorage.getItem("jira_access_token");
    if (storedToken) {
      setAccessToken(storedToken);
      setError(null);
      // fetch initial data using stored token
      fetchJiraProjects(storedToken);
      fetchJiraCloudID(storedToken);
      // estimates fetched via unified summary endpoint
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const returnedCode = params.get("code");
    if (returnedCode && !codeExchanged) {
      setCodeExchanged(true); // prevent further exchanges
      exchangeCodeForToken(returnedCode);
    }
  }, [codeExchanged]);

  const exchangeCodeForToken = async (authCode: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/jira/exchange-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: authCode }),
      });
      const data = await res.json();
      if (data.access_token) {
        setAccessToken(data.access_token);
        // persist token so a refresh retains access
        try {
          localStorage.setItem("jira_access_token", data.access_token);
        } catch (e) {
          console.warn("Could not persist access token", e);
        }
        // fetch initial data
        fetchJiraProjects(data.access_token);
        // fetchJiraIssueTypes(data.access_token);
        fetchJiraCloudID(data.access_token);
        // estimates fetched via unified summary endpoint
      } else {
        setError("Failed to get access token.");
      }
    } catch (err) {
      console.error(err);
      setError("Error exchanging code.");
    }
  };

  const fetchJiraProjects = async (token: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/jira/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setProjects(list);
      // default to first project (index 0) when available
      if (list.length > 0 && !selectedProjectKey) {
        setSelectedProjectKey(list[0].key);
        // unified load for issue types + summary
        fetchIssueTypesAndSummary(token, list[0].key, String(list[0].id));
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching projects.");
    }
  };

  // Removed old fetchJiraIssueTypes; unified endpoint populates issueTypes

  // Create a new issue type
  const addJiraIssueType = async (
    token: string,
    payload: { name: string; description?: string },
    projectKey?: string | null
  ) => {
    try {
      const url = new URL(`${baseUrl}/api/jira/issuetypes`);
      // include projectID so backend assigns the scheme to the correct project
      if (projectKey) {
        const proj = projects.find((p) => p.key === projectKey);
        if (proj?.id) url.searchParams.append("projectID", String(proj.id));
      }
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const response = await res.json();
      if (res.ok && response.success) {
        toast.success("Issue type added and assigned to scheme.");
        // unified refresh
        const proj = projects.find(
          (p) => p.key === selectedProjectKey
        );
        fetchIssueTypesAndSummary(token, selectedProjectKey || "", String(proj?.id || ""));
        setNewName("");
        setNewDescription("");
      } else {
        const errMsg = response?.error ||
          (response?.data && typeof response.data === "string" ? response.data : null) ||
          "Failed to add issue type.";
        toast.error(errMsg);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding issue type.");
    }
  };

  // Update issue type by id
  const updateJiraIssueType = async (
    id: number | string,
    token: string,
    payload: { name?: string; description?: string },
    projectKey?: string | null
  ) => {
    try {
      const url = new URL(`${baseUrl}/api/jira/issuetypes/${id}`);
      if (projectKey) url.searchParams.append("projectKey", projectKey);
      const res = await fetch(url.toString(), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setIssueTypes((prev) =>
          prev.map((it) =>
            String(it.id) === String(id) ? { ...it, ...payload } : it
          )
        );
        setEditingId(null);
        toast.success("Issue type updated successfully!");
      } else {
        console.error("Update issue type error", data);
        toast.error(data?.error || "Failed to update issue type.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating issue type.");
    }
  };

  // Delete issue type
  const deleteJiraIssueType = async (
    id: number | string,
    token: string,
    projectKey?: string | null
  ) => {
    try {
      const url = new URL(`${baseUrl}/api/jira/issuetypes/${id}`);
      if (projectKey) url.searchParams.append("projectKey", projectKey);
      const res = await fetch(url.toString(), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // some backends return empty body on delete
      let data: any = null;
      try {
        data = await res.json();
      } catch (_) {
        data = null;
      }

      if (res.ok) {
        setIssueTypes((prev) =>
          prev.filter((issue) => String(issue.id) !== String(id))
        );
        toast.success("Issue type deleted successfully!");
      } else {
        console.error("Error deleting issue type:", data);
        toast.error(data?.error || "Failed to delete issue type.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting issue type.");
    }
  };

  const fetchJiraCloudID = async (token: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/jira/get_cloud_id`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(data, "data fetchJiraCloudID");

      // We don't currently use cloud id here, but we keep the call for completeness
    } catch (error: any) {
      console.error(error);
      setError("Error fetching Cloud ID.");
    }
  };

  // UI handlers
  const handleAdd = async () => {
    if (!accessToken) return setError("No access token.");
    if (!newName.trim()) return setError("Name is required.");
    await addJiraIssueType(
      accessToken,
      { name: newName.trim(), description: newDescription.trim() },
      selectedProjectKey
    );
  };

  const signOut = () => {
    try {
      localStorage.removeItem("jira_access_token");
    } catch (e) {
      console.warn("Could not remove access token", e);
    }
    setAccessToken(null);
    setProjects([]);
    setIssueTypes([]);
    setError(null);
    toast.info("Signed out successfully.");
  };

  const startEdit = (item: JiraIssueType) => {
    setEditingId(item.id);
    setEditName(item.name || "");
    setEditDescription(item.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleSaveEdit = async (id: number | string) => {
    if (!accessToken) return setError("No access token.");
    if (!editName.trim()) return setError("Name is required.");
    await updateJiraIssueType(
      id,
      accessToken,
      { name: editName.trim(), description: editDescription.trim() },
      selectedProjectKey
    );
  };

  // Removed separate estimates fetching; unified endpoint provides summaryData

  // Fetch estimates summary by issue type for current project
  const fetchIssueTypesAndSummary = async (
    token: string,
    projectKey: string,
    projectID: string | null
  ) => {
    if (!token || !projectID) {
      toast.error("No access token or project ID found.");
      return;
    }
    setSummaryLoading(true);
    try {
      const url = new URL(`${baseUrl}/api/jira/issuetypes-summary`);
      if (projectKey) url.searchParams.append("projectKey", projectKey);
      url.searchParams.append("projectID", projectID);
      console.log(url.toString(), "url");
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(data, "data fetchIssueTypesAndSummary");
      
      if (!res.ok) {
        const msg = data?.error || data?.errorMessages?.[0] || "Failed to fetch issue types and summary.";
        toast.error(msg);
        return;
      }
      // Expecting { issueTypes, summary }
      if (Array.isArray(data?.issueTypes)) {
        setIssueTypes(
          data.issueTypes.filter((it: any) => it && typeof it.name === "string")
        );
      }
      setSummaryData(Array.isArray(data?.summary) ? data.summary : []);
    } catch (err) {
      console.error("Error fetching issue types and summary:", err);
      toast.error("Error fetching issue types and summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Update hours for all issues of a given issue type in the selected project
  const updateHoursForIssueType = async (
    issueTypeName: string,
    hoursStr: string
  ) => {
    if (!accessToken) {
      toast.error("No access token.");
      return;
    }
    if (!selectedProjectKey) {
      toast.error("Select a project first.");
      return;
    }
    const hours = Number(hoursStr);
    if (Number.isNaN(hours) || hours < 0) {
      toast.error("Enter a valid non-negative number of hours.");
      return;
    }
    try {
      const seconds = Math.max(0, Math.round(hours * 3600));
      const res = await fetch(`${baseUrl}/api/jira/estimate-by-type`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectKey: selectedProjectKey,
          issueTypeName,
          hours,
          seconds,
        }),
      });
      const data = await res.json();
      console.log(data, "data updateHoursForIssueType");
      
      if (!res.ok) {
        const msg = data?.error || "Failed to update hours.";
        toast.error(msg);
        return;
      }
      toast.success(`Hours updated for ${issueTypeName}.`);
      // refresh summary after update
      const proj = projects.find((p) => p.key === selectedProjectKey);
      if (proj?.id && accessToken) {
        fetchIssueTypesAndSummary(accessToken, selectedProjectKey, String(proj.id));
      }
    } catch (err) {
      console.error("Error updating hours:", err);
      toast.error("Error updating hours.");
    }
  };

  // Helper to format numbers with max 2 decimals, but skip trailing zeros
  const formatNumber = (num: number) =>
    Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  return (
    <div className="oauth-callback-container">
      <section className="section">
        <h2>Processing Jira Login...</h2>
        {accessToken ? (
          <p className="success-message">
            Access token received! {accessToken}
          </p>
        ) : (
          error && <p className="error-message">{error}</p>
        )}
      </section>

      <section className="section">
        <h3>Projects</h3>
        <div className="input-group">
          <label htmlFor="project-select">Project:</label>
          <select
            id="project-select"
            value={selectedProjectKey ?? ""}
            onChange={async (e) => {
              const key = e.target.value || null;
              setSelectedProjectKey(key);
              if (accessToken && key) {
                const proj = projects.find((p) => p.key === key);
                const projectID = proj?.id || null;
                if (projectID) {
                  fetchIssueTypesAndSummary(accessToken, key, String(projectID));
                } else {
                  toast.error("No project ID found for selected project.");
                }
              } else if (!accessToken) {
                toast.error("No access token.");
              }
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.key}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>
        </div>
        <ul className="list">
          {projects?.map((p) => (
            <li key={p.id} className="list-item">
              {p.name} ({p.key})
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h3>Issue Types</h3>
        <br />
        {accessToken && (
          <div style={{ marginBottom: 12 }}>
            <button className="button button-secondary" onClick={signOut}>
              Sign out
            </button>
          </div>
        )}

        {/* Add form */}
        <div className="input-group">
          <input
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            placeholder="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <button
            className="button button-primary"
            onClick={handleAdd}
            disabled={!accessToken}
          >
            Add Issue Type
          </button>
        </div>

        <ul className="list">
          {issueTypes
            .filter((it) => it && typeof it.name === "string")
            .map((i) => (
              <li key={i.id} className="list-item">
                {editingId && String(editingId) === String(i.id) ? (
                  <div className="edit-form">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <input
                      value={editDescription ?? ""}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                    <button
                      className="button button-primary"
                      onClick={() => handleSaveEdit(i.id)}
                      disabled={!accessToken}
                    >
                      Save
                    </button>
                    <button
                      className="button button-secondary"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>{i.name}</strong>
                      {i.description ? <span> — {i.description}</span> : null}
                    </div>
                    <div>
                      <button
                        className="button button-secondary"
                        onClick={() => startEdit(i)}
                      >
                        Edit
                      </button>
                      <button
                        className="button button-danger"
                        onClick={() =>
                          accessToken &&
                          deleteJiraIssueType(
                            i.id,
                            accessToken,
                            selectedProjectKey
                          )
                        }
                        disabled={!accessToken}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
        </ul>
      </section>

      <section className="section">
        <h3>Estimates by Issue Type (Summary)</h3>
        <br />
        <div style={{ marginBottom: 12 }}>
          <button
            className="button button-primary"
            onClick={() =>
              accessToken &&
              selectedProjectKey &&
              (() => {
                const proj = projects.find(
                  (p) => p.key === selectedProjectKey
                );
                 fetchIssueTypesAndSummary(
                   accessToken,
                   selectedProjectKey,
                   String(proj?.id || "")
                 );
              })()
            }
            disabled={!accessToken || summaryLoading}
          >
            Refresh Summary
          </button>
          <button
            className="button button-secondary"
            style={{ marginLeft: 8 }}
            onClick={() => setEditHoursEnabled((prev) => !prev)}
            disabled={!accessToken || summaryLoading}
          >
            {editHoursEnabled ? "Done Editing" : "Edit Hours"}
          </button>
        </div>
        {summaryLoading ? (
          <div className="loading">
            <p>Loading summary...</p>
          </div>
        ) : summaryData.length === 0 ? (
          <p>No summary data available.</p>
        ) : (
          <div className="estimates-table-container">
            <table className="estimates-table">
              <thead>
                <tr>
                  <th>Issue Type</th>
                  <th>Total Issues</th>
                  <th>Estimated Hours</th>
                  <th>Price Per Hour ($)</th>
                  <th>Total Cost ($)</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.map((row: any, idx: number) => {
                  const keyName = row.name || row.issueType;
                  const totalIssues = Number(row.totalIssues || 0);
                  const canEdit = editHoursEnabled && totalIssues > 0;
                  return (
                    <tr key={row.id ?? idx}>
                      <td>{keyName || "N/A"}</td>
                      <td>{totalIssues}</td>
                      <td>
                        {canEdit ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="number"
                              step="0.25"
                              min="0"
                              style={{ width: 100 }}
                              value={
                                editedHoursByType[keyName] ?? String(row.totalEstimateHours || 0)
                              }
                              onChange={(e) => {
                                const v = e.target.value;
                                setEditedHoursByType((prev) => ({ ...prev, [keyName]: v }));
                              }}
                            />
                            <button
                              className="button button-primary"
                              onClick={() =>
                                updateHoursForIssueType(
                                  keyName,
                                  editedHoursByType[keyName] ?? String(row.totalEstimateHours || 0)
                                )
                              }
                              disabled={!accessToken}
                            >
                              Update
                            </button>
                          </div>
                        ) : (
                          <span title={editHoursEnabled && totalIssues <= 0 ? "No issues to update" : undefined}>
                            {formatNumber(row.totalEstimateHours || 0)} hr
                          </span>
                        )}
                      </td>
                      <td>$ {Number(row.pricePerHour).toFixed(2) || 0}</td>
                      <td>$ {Number(row.totalPrice).toFixed(2) || 0}</td>
                      <td>{row.percentageOfTotal || 0}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="section">
        <h3>Quote Calculation</h3>
        <br />
        <div className="estimates-table-container">
          {/* manage Total Hours , Total Cost,Avg. Rate with in different cards design with border and padding with text center and font size 20px manage proper design of cards */}
          <div className="card-container">
            {" "}
            {/* manage proper design of cards */}
            <div className="card">
              <div className="card-header">Total Hours</div>
              <div className="card-body">
                <p className="text-center font-size-20px">
                  {formatNumber(
                  summaryData.reduce(
                    (acc, curr) => acc + parseFloat(curr.totalEstimateHours),
                    0
                  )
                )}{" "}
                  hr
                </p>
              </div>
            </div>
          </div>
          <div className="card-container">
            <div className="card">
              <div className="card-header">Total Cost</div>
              <div className="card-body">
                <p className="text-center font-size-20px">
                  $
                  {formatNumber(
                  summaryData.reduce(
                    (acc, curr) => acc + parseFloat(curr.totalPrice),
                    0
                  )
                )}
                </p>
              </div>
            </div>
          </div>
          <div className="card-container">
            <div className="card">
              <div className="card-header">Avg. Rate</div>
              <div className="card-body">
                <p className="text-center font-size-20px">
                  $
                  {formatNumber(
                  summaryData.reduce(
                    (acc, curr) => acc + parseFloat(curr.totalPrice),
                    0
                  ) /
                    summaryData.reduce(
                      (acc, curr) =>
                        acc + parseFloat(curr.totalEstimateHours),
                      0
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OAuthCallback;
