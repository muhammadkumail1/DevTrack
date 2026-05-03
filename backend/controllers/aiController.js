const Project = require("../models/Project");
const Task = require("../models/Task");
const Bug = require("../models/Bug");
const User = require("../models/User");
const Sprint = require("../models/Sprint");

// Extract JSON from LLM response (handles markdown code blocks, extra text)
function extractJSON(text) {
  if (!text) return null;
  try { return JSON.parse(text.trim()); } catch (e) {}
  const block = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (block) { try { return JSON.parse(block[1].trim()); } catch (e) {} }
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) { try { return JSON.parse(obj[0]); } catch (e) {} }
  return null;
}

// Shared Groq API caller
async function callGroq(apiKey, messages, maxTokens) {
  maxTokens = maxTokens || 1500;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: maxTokens,
      temperature: 0.3,
      messages: messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error("Groq API error: " + err);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function normalizeText(value) {
  if (!value) return "";
  return String(value).trim().toLowerCase();
}

function handleDeterministicCommand(command, allProjects, currentTasks, currentBugs) {
  const cmd = normalizeText(command);
  if (!cmd) return null;

  if (cmd.includes("project") && cmd.includes("id")) {
    const matchedProject = allProjects.find(function(p) {
      return cmd.includes(normalizeText(p.title));
    });

    if (matchedProject) {
      return {
        action: "GENERAL_ANSWER",
        intent: "Project ID lookup",
        message: "Project ID details:\n\n- Title: " + matchedProject.title + "\n- ID: " + matchedProject._id.toString() + "\n- Status: " + (matchedProject.status || "N/A"),
        data: null,
      };
    }

    return {
      action: "GENERAL_ANSWER",
      intent: "Project ID listing",
      message: allProjects.length
        ? "Project IDs:\n\n" + allProjects.map(function(p) { return "- " + p.title + ": " + p._id.toString(); }).join("\n")
        : "No projects found.",
      data: null,
    };
  }

  if (cmd.includes("task") && cmd.includes("id")) {
    return {
      action: "GENERAL_ANSWER",
      intent: "Task ID listing",
      message: currentTasks.length
        ? "Task IDs:\n\n" + currentTasks.slice(0, 20).map(function(t) { return "- " + t.title + ": " + t._id.toString(); }).join("\n")
        : "No tasks found.",
      data: null,
    };
  }

  if (cmd.includes("bug") && cmd.includes("id")) {
    return {
      action: "GENERAL_ANSWER",
      intent: "Bug ID listing",
      message: currentBugs.length
        ? "Bug IDs:\n\n" + currentBugs.slice(0, 20).map(function(b) { return "- " + b.title + ": " + b._id.toString(); }).join("\n")
        : "No bugs found.",
      data: null,
    };
  }

  if (cmd.includes("which") && cmd.includes("project") && cmd.includes("progress")) {
    const inProgress = allProjects.filter(function(p) { return p.status === "In Progress"; });
    return {
      action: "GENERAL_ANSWER",
      intent: "In-progress project listing",
      message: inProgress.length
        ? "Projects currently in progress:\n\n" + inProgress.map(function(p) { return "- " + p.title + " (ID: " + p._id.toString() + ")"; }).join("\n")
        : "No projects are currently marked as In Progress.",
      data: null,
    };
  }

  return null;
}

exports.processCommand = async (req, res) => {
  try {
    const { command, projectId } = req.body;
    if (!command) return res.status(400).json({ message: "Command is required" });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(400).json({ message: "Groq API key not configured" });

    const [allProjects, allUsers, sprintData] = await Promise.all([
      Project.find().populate("manager", "name email").lean(),
      User.find({}, "name email role").lean(),
      projectId ? Sprint.find({ project: projectId }).lean() : [],
    ]);

    const [currentTasks, currentBugs] = await Promise.all([
      projectId ? Task.find({ project: projectId }).populate("assignedTo", "name").lean() : Task.find().populate("assignedTo", "name").lean(),
      projectId ? Bug.find({ project: projectId }).populate("assignedTo", "name").lean() : Bug.find().lean(),
    ]);

    const workloadRaw = await Task.aggregate([
      { $match: { status: { $ne: "Done" }, assignedTo: { $ne: null } } },
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
    ]);
    const workload = {};
    workloadRaw.forEach(function(w) { workload[w._id.toString()] = w.count; });

    const currentProject = projectId ? allProjects.find(function(p) { return p._id.toString() === projectId; }) : null;

    const deterministicResult = handleDeterministicCommand(command, allProjects, currentTasks, currentBugs);
    if (deterministicResult) {
      return res.json(deterministicResult);
    }

    const projectsCtx = allProjects.length
      ? allProjects.map(function(p) {
          return '  - "' + p.title + '" | ID: ' + p._id + ' | Status: ' + p.status + ' | Priority: ' + p.priority + ' | Manager: ' + (p.manager ? p.manager.name : "None");
        }).join("\n")
      : "  (no projects yet)";

    const teamCtx = allUsers.map(function(u) {
      return '  - ' + u.name + ' | Role: ' + u.role + ' | Active tasks: ' + (workload[u._id.toString()] || 0);
    }).join("\n");

    const tasksCtx = currentTasks.length
      ? currentTasks.map(function(t) {
          return '  - [' + t.status + '] "' + t.title + '" | Priority: ' + t.priority + ' | Assigned: ' + (t.assignedTo ? t.assignedTo.name : "Unassigned");
        }).join("\n")
      : "  (none)";

    const bugsCtx = currentBugs.length
      ? currentBugs.map(function(b) {
          return '  - [' + b.status + '] "' + b.title + '" | Severity: ' + (b.severity || "Unknown") + ' | Assigned: ' + (b.assignedTo ? b.assignedTo.name : "Unassigned");
        }).join("\n")
      : "  (none)";

    const systemPrompt = [
      "You are DevTrack AI - an expert project management assistant with FULL LIVE ACCESS to the database below.",
      "You are knowledgeable in PMP, Agile, Scrum, Kanban, SAFe, risk management, sprint planning, and all PM methodologies.",
      "Be smart, specific, and always reference real data when answering.",
      "",
      "=== LIVE DATABASE ===",
      "",
      "ALL PROJECTS (" + allProjects.length + " total):",
      projectsCtx,
      "",
      "TEAM MEMBERS (" + allUsers.length + " total):",
      teamCtx,
      "",
      "CONTEXT: " + (currentProject ? '"' + currentProject.title + '" (' + currentProject.status + ')' : "Organization-wide"),
      "",
      "TASKS (" + currentTasks.length + " total):",
      tasksCtx,
      "",
      "BUGS (" + currentBugs.length + " total):",
      bugsCtx,
      "",
      "=== INSTRUCTIONS ===",
      "",
      "You MUST respond ONLY with a JSON object. No markdown, no code blocks, no extra text.",
      "",
      'Format: {"action":"...","intent":"...","message":"...","data":null}',
      "",
      "action must be one of: GENERAL_ANSWER, CREATE_TASKS, CREATE_PROJECT, CREATE_BUG, ASSIGN_TASK, GET_FORECAST, GET_SUMMARY",
      "",
      "message = your complete helpful answer visible to user. Use \\n for line breaks. Reference real data.",
      "",
      "For CREATE_TASKS set data to: {\"tasks\": [{\"title\": \"...\", \"description\": \"detailed 2-sentence description\", \"priority\": \"High|Medium|Low\"}]}",
      "For CREATE_PROJECT set data to: {\"title\": \"...\", \"description\": \"auto-generated\", \"status\": \"Planning\", \"priority\": \"Medium\"}",
      "For CREATE_BUG set data to: {\"title\": \"...\", \"description\": \"...\", \"severity\": \"Critical|High|Medium|Low\"}",
      "",
      "IMPORTANT: For questions about listing/filtering data (e.g. which projects, show tasks, list bugs) - use GENERAL_ANSWER and write the answer using the LIVE DATA above.",
      "IMPORTANT: For PM questions (what is kanban, explain scrum, etc.) - use GENERAL_ANSWER and give expert explanation.",
      "IMPORTANT: Always use real names and real counts from the data provided.",
      "IMPORTANT: If user asks for an ID, return the exact MongoDB ID string from live data. Never return placeholders or unrelated text.",
      "IMPORTANT: Format messages cleanly using short sections and bullet points for readability."
    ].join("\n");

    let parsed;
    try {
      const content = await callGroq(apiKey, [
        { role: "system", content: systemPrompt },
        { role: "user", content: command },
      ], 1500);

      parsed = extractJSON(content);
      if (!parsed) throw new Error("AI response was not valid JSON");
    } catch (err) {
      console.error("Groq error:", err.message);
      return smartFallback(command, allProjects, currentTasks, currentBugs, allUsers, workload, res);
    }

    var result = {
      action: parsed.action || "GENERAL_ANSWER",
      intent: parsed.intent || "",
      message: parsed.message || "Done.",
      data: null,
    };

    if (parsed.action === "CREATE_TASKS" && projectId && parsed.data && parsed.data.tasks && parsed.data.tasks.length) {
      var created = [];
      for (var i = 0; i < parsed.data.tasks.length; i++) {
        var t = parsed.data.tasks[i];
        var task = await Task.create({
          title: t.title,
          description: t.description || ("Task: " + t.title),
          project: projectId,
          status: "To Do",
          priority: t.priority || "Medium",
          createdBy: req.user._id,
        });
        created.push(task);
      }
      result.data = { created: created.length, tasks: created };
      result.message = "Created " + created.length + " tasks:\n\n" + created.map(function(t) { return "- " + t.title; }).join("\n");

    } else if (parsed.action === "CREATE_TASKS" && !projectId) {
      result.action = "GENERAL_ANSWER";
      result.message = "Please open a specific project first, then I can create tasks inside it.";

    } else if (parsed.action === "CREATE_PROJECT" && parsed.data && parsed.data.title) {
      var project = await Project.create({
        title: parsed.data.title,
        description: parsed.data.description || ("Project: " + parsed.data.title),
        status: parsed.data.status || "Planning",
        priority: parsed.data.priority || "Medium",
        manager: req.user._id,
      });
      result.data = { project: project };
      result.message = (parsed.message || "") + '\n\nProject "' + project.title + '" has been created successfully!';

    } else if (parsed.action === "CREATE_BUG" && projectId && parsed.data && parsed.data.title) {
      var bug = await Bug.create({
        title: parsed.data.title,
        description: parsed.data.description || parsed.data.title,
        project: projectId,
        status: "Open",
        severity: parsed.data.severity || "Medium",
        reportedBy: req.user._id,
      });
      result.data = { bug: bug };
      result.message = parsed.message || ('Bug "' + bug.title + '" has been logged!');

    } else if (parsed.action === "GET_FORECAST") {
      var doneTasks = currentTasks.filter(function(t) { return t.status === "Done"; }).length;
      var remaining = currentTasks.length - doneTasks;
      var inProg = currentTasks.filter(function(t) { return t.status === "In Progress"; }).length;
      var velocity = Math.max(inProg || 3, 1);
      var weeksLeft = Math.ceil(remaining / velocity);
      var endDate = new Date();
      endDate.setDate(endDate.getDate() + weeksLeft * 7);
      result.data = { done: doneTasks, remaining: remaining, weeksLeft: weeksLeft, estimatedEnd: endDate.toISOString().split("T")[0] };
      result.message = "Forecast for " + (currentProject ? '"' + currentProject.title + '"' : "this project") + ":\n\nCompleted: " + doneTasks + " tasks\nIn Progress: " + inProg + " tasks\nRemaining: " + remaining + " tasks\nVelocity: ~" + velocity + " tasks/week\nEstimated completion: " + endDate.toDateString();

    } else if (parsed.action === "GET_SUMMARY" && currentProject) {
      var doneSummary = currentTasks.filter(function(t) { return t.status === "Done"; }).length;
      var openBugsSummary = currentBugs.filter(function(b) { return b.status !== "Closed"; }).length;
      result.data = {
        projectTitle: currentProject.title,
        status: currentProject.status,
        totalTasks: currentTasks.length,
        completedTasks: doneSummary,
        progress: currentTasks.length ? Math.round((doneSummary / currentTasks.length) * 100) : 0,
        openBugs: openBugsSummary,
      };
    }

    res.json(result);
  } catch (err) {
    console.error("AI command error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

async function smartFallback(command, projects, tasks, bugs, team, workload, res) {
  var cmd = command.toLowerCase();

  if (cmd.indexOf("project") !== -1) {
    var filtered = projects;
    if (cmd.indexOf("progress") !== -1) filtered = projects.filter(function(p) { return p.status === "In Progress"; });
    else if (cmd.indexOf("planning") !== -1) filtered = projects.filter(function(p) { return p.status === "Planning"; });
    else if (cmd.indexOf("done") !== -1 || cmd.indexOf("complete") !== -1) filtered = projects.filter(function(p) { return p.status === "Completed"; });

    var pMsg = filtered.length
      ? "Found " + filtered.length + " project(s):\n\n" + filtered.map(function(p) { return "- " + p.title + " (" + p.status + ", " + p.priority + " priority)"; }).join("\n")
      : "No projects match that filter.";
    return res.json({ action: "GENERAL_ANSWER", intent: "List projects", message: pMsg, data: null });
  }

  if (cmd.indexOf("task") !== -1) {
    var tMsg = tasks.length
      ? tasks.length + " tasks:\n\n" + tasks.slice(0, 20).map(function(t) { return "- [" + t.status + "] " + t.title; }).join("\n") + (tasks.length > 20 ? "\n... and " + (tasks.length - 20) + " more" : "")
      : "No tasks found.";
    return res.json({ action: "GENERAL_ANSWER", intent: "List tasks", message: tMsg, data: null });
  }

  if (cmd.indexOf("bug") !== -1) {
    var bMsg = bugs.length
      ? bugs.length + " bugs:\n\n" + bugs.map(function(b) { return "- [" + b.status + "] " + b.title; }).join("\n")
      : "No bugs found.";
    return res.json({ action: "GENERAL_ANSWER", intent: "List bugs", message: bMsg, data: null });
  }

  if (cmd.indexOf("team") !== -1 || cmd.indexOf("who") !== -1 || cmd.indexOf("assign") !== -1) {
    var sorted = team.slice().sort(function(a, b) { return (workload[a._id] || 0) - (workload[b._id] || 0); });
    var wMsg = "Team workload (" + team.length + " members):\n\n" + sorted.map(function(u) { return "- " + u.name + " (" + u.role + ") — " + (workload[u._id.toString()] || 0) + " active tasks"; }).join("\n") + "\n\nLeast busy: " + (sorted[0] ? sorted[0].name : "N/A");
    return res.json({ action: "GENERAL_ANSWER", intent: "Team overview", message: wMsg, data: null });
  }

  return res.json({
    action: "GENERAL_ANSWER",
    intent: "Offline fallback",
    message: "AI service temporarily unreachable. I can see:\n\n- " + projects.length + " projects\n- " + tasks.length + " tasks\n- " + bugs.length + " bugs\n- " + team.length + " team members\n\nTry again or ask me to list any of the above.",
    data: null,
  });
}

exports.getProjectSuggestions = async (req, res) => {
  try {
    var projectId = req.params.projectId;
    var results = await Promise.all([
      Project.findById(projectId).populate("manager", "name"),
      Task.find({ project: projectId }),
      Bug.find({ project: projectId }),
    ]);
    var project = results[0];
    var tasks = results[1];
    var bugs = results[2];

    if (!project) return res.status(404).json({ message: "Project not found" });

    var apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(400).json({ message: "Groq API not configured" });

    var done = tasks.filter(function(t) { return t.status === "Done"; }).length;
    var inProgress = tasks.filter(function(t) { return t.status === "In Progress"; }).length;
    var openBugs = bugs.filter(function(b) { return b.status !== "Closed"; }).length;
    var criticalBugs = bugs.filter(function(b) { return b.severity === "Critical" && b.status !== "Closed"; }).length;

    var prompt = 'As an expert PM consultant, give exactly 3 specific actionable suggestions for this project. Reference the real numbers.\n\nProject: "' + project.title + '" (' + project.status + ')\nTasks: ' + tasks.length + ' total - ' + done + ' done, ' + inProgress + ' in progress\nOpen Bugs: ' + openBugs + ' (' + criticalBugs + ' critical)\nManager: ' + (project.manager ? project.manager.name : "Unassigned") + '\n\nRespond ONLY with a JSON array (no extra text, no code blocks):\n[{"title": "short title", "description": "2-3 sentence specific recommendation"}]';

    var content = await callGroq(apiKey, [{ role: "user", content: prompt }], 700);
    var suggestions = extractJSON(content);
    if (!Array.isArray(suggestions)) throw new Error("Invalid format");
    res.json(suggestions);
  } catch (error) {
    res.json([
      { title: "Review in-progress tasks", description: "Audit all In Progress tasks to ensure each has a clear owner and deadline. Block out time to resolve any tasks that have been stuck for more than 2 days." },
      { title: "Triage open bugs by severity", description: "Sort all open bugs by severity and assign Critical bugs immediately. Set SLA targets: Critical=same day, High=2 days, Medium=1 week." },
      { title: "Run a sprint retrospective", description: "Hold a 30-minute retrospective to identify what is slowing the team down. Document action items and assign owners to each improvement." },
    ]);
  }
};
