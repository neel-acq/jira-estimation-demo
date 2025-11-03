import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(
  cors({
    origin: [
      "http://localhost:5173", // your frontend
      "https://multifaced-fawn-plushily.ngrok-free.dev", // your backend public url
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// app.options('*', cors());

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
const CLOUD_ID = process.env.JIRA_CLOUD_ID;
const Token =
  "eyJraWQiOiJhdXRoLmF0bGFzc2lhbi5jb20tQUNDRVNTLTk0ZTczYTkwLTUxYWQtNGFjMS1hOWFjLWU4NGUwNDVjNDU3ZCIsImFsZyI6IlJTMjU2In0.eyJqdGkiOiI5YzRkN2FhZi00MGU3LTQ2YjEtOTkyNC02MmJkNDRlNDJlYjEiLCJzdWIiOiI3MTIwMjA6MTZkMzUyYmUtNjQ1MC00M2RmLTgxNGEtNTA2MmM1NTg0NWU5IiwibmJmIjoxNzYyMTYzMDQ0LCJpc3MiOiJodHRwczovL2F1dGguYXRsYXNzaWFuLmNvbSIsImlhdCI6MTc2MjE2MzA0NCwiZXhwIjoxNzYyMTY2NjQ0LCJhdWQiOiIxSEc1OHh1Y0QzTVM5ckh4ZlQ0U0NRU2VMNGZzNVRxUiIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiJjZTM1NGRjZi0zZTY0LTQxYjUtYjAyMi1iNWI3NDUyYWEzYzMiLCJzY29wZSI6Im1hbmFnZTpqaXJhLWNvbmZpZ3VyYXRpb24gbWFuYWdlOmppcmEtcHJvamVjdCBtYW5hZ2U6amlyYS13ZWJob29rIG9mZmxpbmVfYWNjZXNzIHJlYWQ6amlyYS11c2VyIHJlYWQ6amlyYS13b3JrIHdyaXRlOmppcmEtd29yayIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9hdXRoUHJvZmlsZSI6Im9hdXRoLmVjb3N5c3RlbS5vYXV0aEludGVncmF0aW9uIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL2F0bF90b2tlbl90eXBlIjoiQUNDRVNTIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL2ZpcnN0UGFydHkiOmZhbHNlLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudElkIjoiNzEyMDIwOjNkMGExZTVjLWM4ODMtNDI1MC04MDFlLTNkNjIyN2Q3YmM1MiIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS92ZXJpZmllZCI6dHJ1ZSwiY2xpZW50X2lkIjoiMUhHNTh4dWNEM01TOXJIeGZUNFNDUVNlTDRmczVUcVIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vcHJvY2Vzc1JlZ2lvbiI6InVzLWVhc3QtMSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9lbWFpbERvbWFpbiI6ImdtYWlsLmNvbSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS8zbG8iOnRydWUsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS92ZXJpZmllZCI6dHJ1ZSwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL29hdXRoQ2xpZW50SWQiOiIxSEc1OHh1Y0QzTVM5ckh4ZlQ0U0NRU2VMNGZzNVRxUiIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9zeXN0ZW1BY2NvdW50RW1haWwiOiI3ZGJmNjZkYi05NGNlLTQzZDMtODViMi0yOGFkOTM3M2JkMTBAY29ubmVjdC5hdGxhc3NpYW4uY29tIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3J0aSI6IjY4YzNjNTQ3LTg2ZWYtNGQ5Zi04NDU5LWUwODlhN2Q5ZjBmYyIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9yZWZyZXNoX2NoYWluX2lkIjoiMUhHNTh4dWNEM01TOXJIeGZUNFNDUVNlTDRmczVUcVItNzEyMDIwOjE2ZDM1MmJlLTY0NTAtNDNkZi04MTRhLTUwNjJjNTU4NDVlOS0yYTljNjlmOS1kNGRmLTQzNGUtYTQwMi00Mjc2MDYzNTFmNTEiLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudEVtYWlsRG9tYWluIjoiY29ubmVjdC5hdGxhc3NpYW4uY29tIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3Nlc3Npb25faWQiOiI0Y2NlY2Y4Yi0wYjg4LTQ0ZWItOTdiMy1iYzYzYWVhYTk4OGUifQ.HeeNUfyoQtGQSmOSNz3CsaubBfLiwPFp-lpjBNevRunjeW5Sjwc9pqmnziSx1Exv-rJGgZI4-PlbhMC1STZ0PBDYUuphuNTdwEv2HfK0j-s2HxQy-EKZRyvtOzx35JzrjrDx6gmq5M62c0KP3V755Gd_gK4H1OJAwnw6hnW_BsfTCTvnkIOlv8kpmL6Ntyrxc8lPv-8-JPYRE16XTdb85p8RT1P_c3ftVNfRhaB36P4ZiNII1pVJt1iBa3G0F2BSuKWWDCcP1-znx9_fnnXCQKiEcMs7Lv5Z4j21DNXM9qM_xHCEEtVeK8PmvF9Ma7a2ljXLSEi5ktLWHE9uDgv4fQ";
const cloudID = "69353611-e108-4ba7-968b-c2a2c026bc15";

// Get route logs
app.use((req, res, next) => {
  console.log(req.headers.host, "req.headers.host");
  console.log(`${req.method} ${req.url}`);
  next();
});

// Exchange authorization code for access token
app.post("/api/jira/exchange-code", async (req, res) => {
  const { code } = req.body;
  try {
    const tokenRes = await fetch("https://auth.atlassian.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: process.env.JIRA_CLIENT_ID,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        code, // <-- must be the fresh code
        redirect_uri: process.env.JIRA_REDIRECT_URI, // must match exactly
      }),
    });

    const data = await tokenRes.json();
    res.json(data); // contains access_token, refresh_token, expires_in
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to exchange code" });
  }
});

// Get CLOUD_ID
app.get("/api/jira/get_cloud_id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ error: "Missing token" });
  try {
    const cloudId = await fetch(
      `https://api.atlassian.com/oauth/token/accessible-resources`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    const data = await cloudId.json();
    res.json(data?.[0]?.id || "");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cloud ID" });
  }
});

// Utility to fetch cloud id for a given access token.
// Returns the cloud id string or throws an Error on failure.
async function getCloudId(token) {
  if (!token) throw new Error("Missing token");
  const resp = await fetch(
    `https://api.atlassian.com/oauth/token/accessible-resources`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const text = await resp.text();
  let data;
  try {
    data = text ? JSON.parse(text) : [];
  } catch (err) {
    throw new Error(`Failed to parse accessible-resources response: ${text}`);
  }

  if (!resp.ok) {
    throw new Error(
      `Failed to fetch cloud id: ${resp.status} ${
        resp.statusText
      } - ${JSON.stringify(data)}`
    );
  }

  return data?.[0]?.id || "";
}

// const cloudId= await getCloudId(Token);
// console.log(cloudId,"cloudId");

async function manageIssueTypeAndScheme(
  token,
  cloudId,
  name,
  description,
  type = "standard",
  projectId
) {
  if (!token || !cloudId) throw new Error("Missing token or cloudId");
  if (!name) throw new Error("Missing issue type name");
  if (!projectId) throw new Error("Missing target projectId");

  // --- Step 1: Create a new issue type ---
  console.log("🔹 Creating a new issue type...");
  const issueTypeRes = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issuetype`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description: description || "Created via API",
        type,
      }),
    }
  );

  const issueTypeData = await issueTypeRes.json();
  if (!issueTypeRes.ok)
    throw new Error(
      `❌ Failed to create issue type: ${JSON.stringify(issueTypeData)}`
    );

  console.log(
    `✅ Issue type created: ${issueTypeData.name} (${issueTypeData.id})`
  );

  // --- Step 2: Fetch current issue type scheme for project ---
  console.log("🔹 Fetching project's current issue type scheme...");
  const schemeRes = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issuetypescheme/project?projectId=${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const schemeData = await schemeRes.json();

  if (!schemeRes.ok) {
    console.error("❌ Failed to fetch project scheme:", schemeData);
    throw new Error(`Cannot fetch project scheme for project ${projectId}`);
  }

  const currentScheme = schemeData.values?.[0];
  const oldSchemeId = currentScheme?.issueTypeSchemeId || currentScheme?.id;
  // --- Step 3: Create a new issue type scheme that preserves existing project issue types ---
  console.log("🔹 Collecting existing project issue types to preserve them...");
  const projectIssueTypesRes = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );
  const projectIssueTypesData = await projectIssueTypesRes.json();
  if (!projectIssueTypesRes.ok) {
    console.warn(
      "⚠️ Failed to fetch project issue types, proceeding with only the new one:",
      projectIssueTypesData
    );
  }
  const existingIssueTypeIds = Array.from(
    new Set(
      (projectIssueTypesData.issueTypes || []).map((t) => t?.id).filter(Boolean)
    )
  );
  const mergedIssueTypeIds = Array.from(
    new Set([...(existingIssueTypeIds || []), issueTypeData.id])
  );

  // --- Step 4: Create a new issue type scheme (merged) ---
  console.log("🔹 Creating a new issue type scheme with merged issue types...");
  const newSchemeRes = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issuetypescheme`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `Scheme for ${name} (${Date.now()})`,
        description: `Auto-created scheme for issue type ${name}`,
        issueTypeIds: mergedIssueTypeIds,
      }),
    }
  );

  const newSchemeData = await newSchemeRes.json();
  if (!newSchemeRes.ok)
    throw new Error(
      `❌ Failed to create new scheme: ${JSON.stringify(newSchemeData)}`
    );

  const newSchemeId = newSchemeData.issueTypeSchemeId;
  console.log(`✅ New issue type scheme created: ${newSchemeId}`);

  // --- Step 5: Assign new scheme to project ---
  console.log(
    `🔹 Assigning new scheme ${newSchemeId} to project ${projectId}...`
  );
  const assignRes = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issuetypescheme/project`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        issueTypeSchemeId: newSchemeId,
        projectId,
      }),
    }
  );

  const assignText = await assignRes.text();
  if (!assignRes.ok)
    throw new Error(
      `❌ Failed to assign new scheme: ${assignRes.status} - ${assignText}`
    );

  console.log(`✅ New scheme ${newSchemeId} assigned to project ${projectId}`);

  // --- Step 6: Fetch updated project issue types ---
  const projectIssueTypesRes2 = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const projectIssueTypesData2 = await projectIssueTypesRes2.json();

  return {
    createdIssueType: issueTypeData,
    removedOldScheme: false,
    newSchemeId,
    projectIssueTypes: projectIssueTypesData2.issueTypes || [],
  };
}

// await manageIssueTypeAndScheme(Token, cloudID);

// Get projects
app.get("/api/jira/projects", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ error: "Missing token" });

  try {
    const projectsRes = await fetch(
      `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/project/search`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    const data = await projectsRes.json();
    const projects = data.values || [];

    // Fetch issue count for each project (parallel)
    const projectsWithCount = await Promise.all(
      projects.map(async (proj) => {
        try {
          const searchRes = await fetch(
            `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/search/jql`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                jql: `project = ${proj.key}`,
                maxResults: 0,
                fields: [],
              }),
            }
          );
          const searchData = await searchRes.json();
          const total =
            typeof searchData.total === "number" ? searchData.total : 0;
          return { ...proj, issueCount: total };
        } catch (err) {
          console.error(
            `Failed to fetch issue count for project ${proj.key}:`,
            err
          );
          return { ...proj, issueCount: null };
        }
      })
    );
    res.json(projectsWithCount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Health endpoint for quick status checks
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/api/jira/issuetypes-summary", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ error: "Missing token" });

  let projectKey = req.query.projectKey;
  let projectID = req.query.projectID;
  console.log("[issuetypes-summary] query:", { projectKey, projectID });

  if (!projectKey && !projectID)
    return res.status(400).json({ error: "Missing projectKey or projectID" });

  try {
    // // If we have only projectKey, derive projectID; if only projectID, derive projectKey for completeness
    // if (projectKey && !projectID) {
    //   const byKeyRes = await fetch(
    //     `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/project/${encodeURIComponent(projectKey)}`,
    //     { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
    //   );
    //   const byKeyData = await byKeyRes.json();
    //   if (!byKeyRes.ok) return res.status(byKeyRes.status).json(byKeyData);
    //   projectID = byKeyData.id;
    //   console.log("[issuetypes-summary] derived projectID from key:", projectID);
    // } else if (!projectKey && projectID) {
    //   const byIdRes = await fetch(
    //     `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/project/${encodeURIComponent(projectID)}`,
    //     { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
    //   );
    //   const byIdData = await byIdRes.json();
    //   if (!byIdRes.ok) return res.status(byIdRes.status).json(byIdData);
    //   projectKey = byIdData.key;
    //   console.log("[issuetypes-summary] derived projectKey from id:", projectKey);
    // }

    const byIdRes = await fetch(
      `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/project/${projectID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    const byIdData = await byIdRes.json();
    if (!byIdRes.ok) return res.status(byIdRes.status).json(byIdData);
    // projectKey = byIdData.key;
    // console.log("[issuetypes-summary] derived projectKey from id:", projectKey);
    // --- Step 1: Fetch project issue types ---
    const projectRes = await fetch(
      `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/project/${projectID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const projectData = await projectRes.json();
    if (!projectRes.ok) return res.status(projectRes.status).json(projectData);

    const issueTypes = (projectData.issueTypes || []).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description || "",
    }));

    const issueTypeMap = new Map();
    issueTypes.forEach((t) => {
      issueTypeMap.set(String(t.id), {
        id: t.id,
        name: t.name,
        description: t.description || "",
        totalIssues: 0,
        totalEstimateHours: 0,
        pricePerHour: 0, // added pricePerHour
        totalPrice: 0,
        percentageOfTotal: "0.00",
      });
    });

    console.log(
      "[issuetypes-summary] collected issue types:",
      issueTypes.length
    );

    // --- Step 2: Fetch issues in that project ---
    // Use new search/jql endpoint; support key or id transparently
    const jqlProject = projectID;
    const jqlRes = await fetch(
      `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/search/jql`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jql: `project = ${jqlProject}`,
          fields: ["issuetype", "timetracking", "timeestimate", "summary"],
          maxResults: 200,
        }),
      }
    );

    const jqlData = await jqlRes.json();
    if (!jqlRes.ok) {
      console.error("[issuetypes-summary] Error fetching issues:", jqlData);
      return res.status(jqlRes.status).json(jqlData);
    }

    const issues = jqlData.issues || [];
    console.log("[issuetypes-summary] issues fetched:", issues.length);

    // --- Step 3: Aggregate time per issue type ---
    issues.forEach((issue) => {
      const issueType = issue.fields?.issuetype;
      if (!issueType || !issueType.id) return;

      const estSeconds =
        issue.fields?.timetracking?.timeSpentSeconds ||
        issue.fields?.timeestimate ||
        0;
      const hours = estSeconds / 3600;
      const pricePerHour = 100 + Math.random() * 100;

      const entry = issueTypeMap.get(issueType.id);
      if (entry) {
        entry.totalIssues += 1;
        entry.totalEstimateHours += hours;
        entry.totalPrice += hours * pricePerHour;
        entry.pricePerHour = pricePerHour;
      }
    });

    // --- Step 4: Compute percentages ---
    const summary = Array.from(issueTypeMap.values());
    const total = summary.reduce((acc, i) => acc + i.totalPrice, 0);

    summary.forEach((i) => {
      i.percentageOfTotal = total
        ? ((i.totalPrice / total) * 100).toFixed(2)
        : "0.00";
      i.totalIssues = Number(i.totalIssues);
      i.totalEstimateHours = Number(i.totalEstimateHours.toFixed(2));
      i.totalPrice = Number(i.totalPrice.toFixed(2));
      i.pricePerHour = Number(i.pricePerHour.toFixed(2)) || 100;
    });

    res.json({ issueTypes, summary });
  } catch (err) {
    console.error("Error fetching issue types summary:", err);
    res.status(500).json({ error: "Failed to fetch issue types summary" });
  }
});

// Get issue types
app.get("/api/jira/issuetypes", async (req, res) => {
  console.log(req.query, "req.query");

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ error: "Missing token" });

  const projectKey = req.query.projectID;
  const projectID = req.query.projectID;
  console.log("projectKey", projectKey);
  if (!projectKey) {
    console.error("No projectKey provided!");
    return res.status(400).json({ error: "Missing projectKey" });
  }

  try {
    if (projectKey && projectKey !== "undefined") {
      try {
        const jqlUrl = `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/project/${projectID}`;
        const searchRes = await fetch(jqlUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        const searchData = await searchRes.json();
        console.log(searchData, "searchData");

        if (!searchRes.ok) {
          console.error(
            "Error searching issues for project issue types:",
            searchData
          );
          return res.status(searchRes.status).json(searchData);
        }

        const issues = searchData.issueTypes || [];
        console.log(issues, "issues found while scanning");

        const map = new Map();
        issues.forEach((t) => {
          if (t && t.id)
            map.set(String(t.id), {
              id: t.id,
              name: t.name,
              description: t.description || null,
            });
        });

        if (map.size > 0) return res.json(Array.from(map.values()));
      } catch (err) {
        console.error(
          "Failed to fetch project-specific issue types by scanning issues:",
          err
        );
      }
    }

    res.json([]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch issue types" });
  }
});

// Add issue types
app.post("/api/jira/issuetypes", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { name, description, type, projectId: projectIdBody } = req.body;
  const projectIdQuery = req.query.projectID || req.query.projectId;
  const projectId = projectIdBody || projectIdQuery;
  if (!token) return res.status(400).json({ error: "Missing token" });
  if (!name) return res.status(400).json({ error: "Missing issue type name" });
  if (!projectId) return res.status(400).json({ error: "Missing projectId" });
  try {
    const cloudId = CLOUD_ID || cloudID;
    const data = await manageIssueTypeAndScheme(
      token,
      cloudId,
      name,
      description,
      type,
      projectId
    );
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error in manageIssueTypeAndScheme:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to create and assign issue type" });
  }
});

// Update issue type
app.put("/api/jira/issuetypes/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ error: "Missing token" });

  const projectKey = req.query.projectKey;
  if (projectKey)
    console.log(
      `Updating issue type ${req.params.id} for projectKey=${projectKey}`
    );

  try {
    const { id } = req.params;
    const { name, description, type } = req.body;

    if (!id) return res.status(400).json({ error: "Missing issue type ID" });

    // ✅ Use PUT method for updating
    const issuesRes = await fetch(
      `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/issuetype/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name || "Updated Feature Request",
          description: description || "Updated description for feature request",
          type: type || "standard",
        }),
      }
    );

    const text = await issuesRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }

    if (!issuesRes.ok) {
      console.error("Failed to update Jira issue type:", data);
      return res.status(issuesRes.status).json(data);
    }

    // Some Jira endpoints return empty body on success. Normalize for frontend.
    const updated = {
      id,
      name: name ?? undefined,
      description: description ?? undefined,
    };

    res.json({ success: true, updated, raw: data });
  } catch (err) {
    console.error("Error updating issue type:", err);
    res.status(500).json({ error: "Failed to update issue type" });
  }
});

// Delete issue type
app.delete("/api/jira/issuetypes/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ error: "Missing token" });

  const projectKey = req.query.projectKey;
  if (projectKey)
    console.log(
      `Deleting issue type ${req.params.id} for projectKey=${projectKey}`
    );

  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Missing issue type ID" });

  try {
    const deleteRes = await fetch(
      `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/issuetype/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    // Jira may return empty body or HTML (204), so handle both cases
    const text = await deleteRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text || "Deleted successfully (no content returned)" };
    }

    if (!deleteRes.ok) {
      console.error("Failed to delete Jira issue type:", data);
      return res.status(deleteRes.status).json(data);
    }

    // Normalize delete response for the frontend
    res.json({
      success: true,
      id,
      message: data?.message || "Issue type deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting issue type:", err);
    res.status(500).json({ error: "Failed to delete issue type" });
  }
});

// Get estimated hours grouped by issue type (bounded JQL)
app.get("/api/jira/estimate-by-type", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ error: "Missing token" });

  // You can optionally pass ?projectKey=DEMO in frontend
  const projectKey = req.query.projectKey || "jira-estimation-demo";

  try {
    const jiraRes = await fetch(
      `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/search/jql`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // ✅ Add a bounded JQL condition (limit search to one project)
          jql: `project = ${projectKey}`,
          fields: ["issuetype", "timetracking", "timeestimate", "summary"],
          maxResults: 200,
        }),
      }
    );

    const data = await jiraRes.json();

    if (!jiraRes.ok) {
      console.error("Error fetching issues:", data);
      return res.status(jiraRes.status).json(data);
    }

    const issues = data.issues || [];

    // 🧮 Group by issue type and sum estimated hours
    const estimateMap = {};

    issues.forEach((issue) => {
      const issueType = issue.fields?.issuetype?.name || "Unknown";
      const estimateSeconds = issue.fields?.timetracking?.timeSpentSeconds || 0;

      if (!estimateMap[issueType]) estimateMap[issueType] = 0;
      estimateMap[issueType] += estimateSeconds;
    });

    // ⏱️ Convert seconds to hours
    const result = Object.entries(estimateMap).map(([issueType, seconds]) => {
      const hours = seconds / 3600;
      const pricePerHour = 100 + Math.random() * 100;
      const totalPrice = hours * pricePerHour;
      return {
        issueType,
        totalEstimateHours: hours.toFixed(2),
        pricePerHour,
        totalPrice,
        // percentageOfTotal: will be added after
      };
    });
    const grandTotal = result.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const resultWithPercent = result.map((row) => ({
      ...row,
      percentageOfTotal: grandTotal
        ? ((row.totalPrice / grandTotal) * 100).toFixed(2)
        : "0.00",
    }));
    res.json(resultWithPercent);
  } catch (err) {
    console.error("Error fetching estimate by type:", err);
    res.status(500).json({ error: "Failed to fetch estimate by issue type" });
  }
});

// Set estimate for a single issue (create or update timetracking.originalEstimate)
app.post("/api/jira/issue/:issueKey/estimate", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ error: "Missing token" });

  const { issueKey } = req.params;
  const { hours } = req.body;
  if (!issueKey) return res.status(400).json({ error: "Missing issue key" });
  if (hours == null || isNaN(Number(hours)))
    return res.status(400).json({ error: "Invalid hours" });

  const seconds = Math.round(Number(hours) * 3600);
  const originalEstimate = `${Number(hours)}h`;

  try {
    const updateRes = await fetch(
      `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/issue/${encodeURIComponent(
        issueKey
      )}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            timetracking: {
              originalEstimate: originalEstimate,
              originalEstimateSeconds: seconds,
            },
          },
        }),
      }
    );

    if (!updateRes.ok) {
      const text = await updateRes.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }
      console.error("Failed to set estimate for issue:", data);
      return res.status(updateRes.status).json(data);
    }

    res.json({ success: true, issueKey, hours, seconds });
  } catch (err) {
    console.error("Error setting estimate for issue:", err);
    res.status(500).json({ error: "Failed to set estimate for issue" });
  }
});

// Bulk update estimated hours for all issues of a given issue type in a project
// Body: { projectKey, issueTypeName, hours }
// This will search issues bounded to the project and issue type and update each one.
// Convert seconds to a Jira-friendly estimate string like "2h 30m"
function secondsToJiraEstimate(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0) parts.push("0m");
  return parts.join(" ");
}

app.put("/api/jira/estimate-by-type", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ error: "Missing token" });

  // Accept either hours (number) or seconds (number). If both provided, seconds wins.
  const { projectKey, issueTypeName, hours, seconds } = req.body;
  if (!issueTypeName)
    return res.status(400).json({ error: "Missing issueTypeName" });

  const secondsFinal = seconds
    ? Math.max(0, Math.round(seconds))
    : Math.max(0, Math.round(hours * 3600));
  const originalEstimate = secondsToJiraEstimate(secondsFinal);

  try {
    const searchRes = await fetch(
      `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/search/jql`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jql: `project = "${projectKey}" AND issuetype = "${issueTypeName}"`,
          fields: ["key"],
          maxResults: 200,
        }),
      }
    );

    const searchData = await searchRes.json();
    if (!searchRes.ok) return res.status(searchRes.status).json(searchData);
    const issues = searchData.issues || [];

    const results = [];
    for (const issue of issues) {
      const key = issue.key;
      try {
        const updateRes = await fetch(
          `https://api.atlassian.com/ex/jira/${CLOUD_ID}/rest/api/3/issue/${encodeURIComponent(
            key
          )}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: {
                timetracking: {
                  originalEstimate,
                },
              },
            }),
          }
        );

        if (!updateRes.ok) {
          const text = await updateRes.text();
          console.error("Failed to update issue:", text);
          results.push({ key, success: false, error: text });
        } else {
          console.log("Issue updated successfully:", key);
          results.push({ key, success: true });
        }
      } catch (err) {
        console.error("Error updating issue:", err);
        results.push({ key, success: false, error: String(err) });
      }
    }
    const successCount = results.filter((r) => r.success).length;
    console.log(`✅ Updated ${successCount}/${results.length} issues`);
    res.json({ updated: results.length, results });
  } catch (err) {
    console.error("Error bulk updating estimates by type:", err);
    res.status(500).json({ error: "Failed to bulk update estimates" });
  }
});

// manage for webhook request
app.post("/api/jira/webhook", async (req, res) => {
  const { event, issue } = req.body;
  console.log(event, issue);
  // if event is issue_updated, then update the issue in the database
  if (event === "issue_updated") {
    const { id, fields } = issue;
    const { summary, description } = fields;
    const issue = await Issue.findByIdAndUpdate(
      id,
      { summary, description },
      { new: true }
    );
    console.log(issue);
  }
  res.json({ success: true });
});

// ====================================================================================================

// Export the app for testing and also start the server when run directly
export default app;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}
