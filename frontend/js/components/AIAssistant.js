// AIAssistant.js — DevTrack AI with full website control + MCQ counter-questions
(function () {

  /* ─────────────────────────────────────────────────────────────
     CSS injection
  ───────────────────────────────────────────────────────────── */
  const AI_CSS = `
    .ai-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 9999; }

    /* FAB */
    .ai-fab {
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border: none; color: white; font-size: 22px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 24px rgba(99,102,241,.45);
      transition: transform .2s, box-shadow .2s;
    }
    .ai-fab:hover { transform: scale(1.1); box-shadow: 0 8px 32px rgba(99,102,241,.6); }

    /* Panel */
    .ai-panel {
      width: 400px; height: 560px;
      background: var(--bg2, #13161b);
      border: 1px solid var(--border, #252a33);
      border-radius: 16px;
      display: flex; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,.35);
      overflow: hidden;
      animation: ai-slide-up .2s ease;
    }
    @keyframes ai-slide-up {
      from { opacity: 0; transform: translateY(16px) scale(.97); }
      to   { opacity: 1; transform: translateY(0)   scale(1); }
    }

    /* Header */
    .ai-header {
      padding: 13px 16px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    .ai-header-icon {
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(255,255,255,.18);
      display: flex; align-items: center; justify-content: center;
      font-size: 17px; flex-shrink: 0;
    }
    .ai-header-title { font-weight: 700; font-size: 14px; color: #fff; }
    .ai-header-sub   { font-size: 11px; color: rgba(255,255,255,.75); margin-top: 1px; }
    .ai-close {
      margin-left: auto; background: rgba(255,255,255,.15); border: none;
      color: white; cursor: pointer; border-radius: 7px;
      width: 28px; height: 28px; font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background .15s;
    }
    .ai-close:hover { background: rgba(255,255,255,.3); }

    /* Messages */
    .ai-msgs {
      flex: 1; overflow-y: auto; padding: 14px 14px 6px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .ai-msg-row-user  { display: flex; justify-content: flex-end; }
    .ai-msg-row-ai    { display: flex; justify-content: flex-start; flex-direction: column; gap: 5px; }
    .ai-bubble-user {
      max-width: 82%; padding: 10px 14px;
      border-radius: 16px 16px 4px 16px;
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      color: #fff; font-size: 13px; line-height: 1.5; word-break: break-word;
    }
    .ai-bubble-ai {
      max-width: 88%; padding: 10px 14px;
      border-radius: 4px 16px 16px 16px;
      background: var(--bg3, #1a1e25);
      border: 1px solid var(--border, #252a33);
      color: var(--text, #e8eaed); font-size: 13px; line-height: 1.55;
      word-break: break-word;
    }
    .ai-bubble-ai.error { background: #450a0a22; border-color: #7f1d1d; color: #fca5a5; }

    /* Action badge */
    .ai-action-badge {
      display: inline-block; font-size: 10px; font-weight: 600;
      padding: 2px 8px; border-radius: 10px;
      border: 1px solid; margin-bottom: 2px;
    }

    /* MCQ Options */
    .ai-mcq { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
    .ai-mcq-title {
      font-size: 11px; font-weight: 600; color: var(--text2, #8b95a1);
      text-transform: uppercase; letter-spacing: .4px; margin-bottom: 2px;
    }
    .ai-mcq-opts { display: flex; flex-wrap: wrap; gap: 6px; }
    .ai-mcq-btn {
      padding: 6px 12px; font-size: 12px; font-weight: 500;
      border-radius: 20px; cursor: pointer; transition: all .15s;
      background: var(--bg2, #13161b);
      border: 1px solid var(--border2, #2e3440);
      color: var(--text, #e8eaed);
      display: flex; align-items: center; gap: 5px;
    }
    .ai-mcq-btn:hover { border-color: #6366f1; color: #a5b4fc; background: rgba(99,102,241,.1); }
    .ai-mcq-btn.selected { border-color: #6366f1; background: rgba(99,102,241,.18); color: #a5b4fc; }
    .ai-mcq-btn:disabled { opacity: .45; cursor: default; }

    /* Multi-select confirm */
    .ai-mcq-confirm {
      margin-top: 4px; padding: 6px 14px; font-size: 12px; font-weight: 600;
      border-radius: 8px; cursor: pointer;
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      border: none; color: #fff; transition: opacity .15s;
    }
    .ai-mcq-confirm:hover { opacity: .85; }

    /* Typing dots */
    .ai-typing {
      padding: 10px 14px;
      background: var(--bg3, #1a1e25);
      border: 1px solid var(--border, #252a33);
      border-radius: 4px 16px 16px 16px;
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--text2, #8b95a1);
    }
    .ai-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--accent, #4f9cf9);
      animation: ai-pulse 1.2s ease-in-out infinite;
    }
    .ai-dot:nth-child(2) { animation-delay: .2s; }
    .ai-dot:nth-child(3) { animation-delay: .4s; }
    @keyframes ai-pulse { 0%,80%,100%{opacity:.25;transform:scale(.9)} 40%{opacity:1;transform:scale(1)} }

    /* Quick chips */
    .ai-chips { padding: 0 14px 10px; display: flex; flex-wrap: wrap; gap: 6px; flex-shrink: 0; }
    .ai-chip {
      padding: 5px 11px; font-size: 11.5px; border-radius: 20px;
      background: var(--bg3, #1a1e25);
      border: 1px solid var(--border, #252a33);
      color: var(--text2, #8b95a1); cursor: pointer; transition: all .15s;
      display: flex; align-items: center; gap: 4px;
    }
    .ai-chip:hover { border-color: #6366f1; color: #a5b4fc; }

    /* Input row */
    .ai-input-row {
      padding: 10px 14px;
      border-top: 1px solid var(--border, #252a33);
      display: flex; gap: 8px; align-items: center;
      background: var(--bg2, #13161b); flex-shrink: 0;
    }
    .ai-input {
      flex: 1; padding: 9px 13px;
      border: 1px solid var(--border, #252a33); border-radius: 10px;
      background: var(--bg3, #1a1e25); color: var(--text, #e8eaed);
      font-size: 13px; outline: none; font-family: inherit;
      transition: border-color .15s;
    }
    .ai-input:focus { border-color: #6366f1; }
    .ai-send {
      width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
      background: linear-gradient(135deg,#6366f1,#8b5cf6);
      border: none; color: white; cursor: pointer; font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      transition: opacity .15s;
    }
    .ai-send:disabled { opacity: .35; cursor: default; }
    .ai-send:not(:disabled):hover { opacity: .85; }
  `;

  if (!document.getElementById('ai-styles')) {
    const s = document.createElement('style');
    s.id = 'ai-styles';
    s.textContent = AI_CSS;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────
     Intent detection (client-side, fast)
  ───────────────────────────────────────────────────────────── */
  const INTENT = {
    CREATE_TASK:    /\b(add|create|make|new)\b.{0,30}\btask/i,
    CREATE_PROJECT: /\b(add|create|make|new)\b.{0,30}\bproject/i,
    CREATE_BUG:     /\b(add|log|report|create|new)\b.{0,30}\bbug/i,
    CREATE_SPRINT:  /\b(add|create|start|new)\b.{0,30}\bsprint/i,
    NAV_PROJECTS:   /\b(go|open|show|take me|navigate|switch)\b.{0,30}\bproject/i,
    NAV_BUGS:       /\b(go|open|show|take me|navigate|switch)\b.{0,30}\bbug/i,
    NAV_TASKS:      /\b(go|open|show|take me|navigate|switch)\b.{0,30}\btask/i,
    NAV_REPORTS:    /\b(go|open|show|take me|navigate|switch)\b.{0,30}\breport/i,
    NAV_TEAM:       /\b(go|open|show|take me|navigate|switch)\b.{0,30}\bteam/i,
    NAV_SPRINTS:    /\b(go|open|show|take me|navigate|switch)\b.{0,30}\bsprint/i,
    NAV_DASH:       /\b(go|open|show|take me|navigate|switch)\b.{0,30}\b(dashboard|home)/i,
    LIST_PROJECTS:  /\b(list|show|what|which|all)\b.{0,30}\bproject/i,
    LIST_TASKS:     /\b(list|show|what|which|all)\b.{0,30}\btask/i,
    LIST_BUGS:      /\b(list|show|what|which|all)\b.{0,30}\bbug/i,
  };

  function detectIntent(text) {
    for (const [key, re] of Object.entries(INTENT)) {
      if (re.test(text)) return key;
    }
    return 'GENERAL';
  }

  /* ─────────────────────────────────────────────────────────────
     Message renderer (newlines → divs)
  ───────────────────────────────────────────────────────────── */
  function RenderText({ text }) {
    const lines = (text || '').replace(/\\n/g, '\n').trim().split('\n');
    return React.createElement(React.Fragment, null,
      lines.map((line, i) =>
        React.createElement('div', { key: i, style: { minHeight: line.trim() ? 'auto' : '7px' } }, line)
      )
    );
  }

  /* ─────────────────────────────────────────────────────────────
     MCQ widget — single or multi select
  ───────────────────────────────────────────────────────────── */
  function McqWidget({ question, options, multi, onAnswer, disabled }) {
    const [selected, setSelected] = React.useState([]);

    const toggle = (val) => {
      if (disabled) return;
      if (!multi) { onAnswer([val]); return; }
      setSelected(prev =>
        prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
      );
    };

    return React.createElement('div', { className: 'ai-mcq' },
      React.createElement('div', { className: 'ai-mcq-title' }, question),
      React.createElement('div', { className: 'ai-mcq-opts' },
        options.map(opt =>
          React.createElement('button', {
            key: opt.value,
            className: 'ai-mcq-btn' + (selected.includes(opt.value) ? ' selected' : ''),
            onClick: () => toggle(opt.value),
            disabled
          }, opt.icon && React.createElement('span', null, opt.icon), opt.label)
        )
      ),
      multi && selected.length > 0 && !disabled &&
        React.createElement('button', {
          className: 'ai-mcq-confirm',
          onClick: () => onAnswer(selected)
        }, 'Confirm (' + selected.length + ' selected) →')
    );
  }

  /* ─────────────────────────────────────────────────────────────
     Main AIAssistant component
  ───────────────────────────────────────────────────────────── */
  function AIAssistant({ projectId, setPage }) {
    const toast = useToast();
    const [open, setOpen] = React.useState(false);
    const [msgs, setMsgs] = React.useState([{
      type: 'ai',
      text: 'Hi! I\'m DevTrack AI — I have full control over this app.\n\nI can:\n- Create tasks, bugs, sprints, projects\n- Navigate to any page\n- List & filter your data\n- Answer Agile / PM questions\n- Guide you step-by-step\n\nWhat would you like to do?'
    }]);
    const [input, setInput] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    // Conversation state for multi-step flows
    const [flow, setFlow] = React.useState(null);
    // flow = { type, step, data: {} }

    // Live data cache
    const [projects, setProjects] = React.useState([]);
    const [users, setUsers] = React.useState([]);

    const bottomRef = React.useRef(null);
    const inputRef  = React.useRef(null);

    /* Load projects + users once on mount */
    React.useEffect(() => {
      api.get('/projects').then(d => Array.isArray(d) && setProjects(d));
      api.get('/users').then(d   => Array.isArray(d) && setUsers(d));
    }, []);

    React.useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs, loading]);

    React.useEffect(() => {
      if (open) setTimeout(() => inputRef.current?.focus(), 120);
    }, [open]);

    /* ── helpers ── */
    const pushMsg = (msg) => setMsgs(prev => [...prev, msg]);
    const pushAI  = (text, extra) => pushMsg({ type: 'ai', text, ...extra });
    const pushUser = (text) => pushMsg({ type: 'user', text });

    /* ── Navigate helper (calls setPage prop if provided) ── */
    const navigateTo = (page) => {
      if (typeof setPage === 'function') setPage(page);
    };

    /* ── Handle MCQ answer from a widget ── */
    const handleMcqAnswer = async (values) => {
      if (!flow) return;

      // Mark all MCQ widgets as disabled
      setMsgs(prev => prev.map(m =>
        m.mcq ? { ...m, mcqDone: true } : m
      ));

      const label = values.join(', ');
      pushUser(label);

      const nextFlow = { ...flow, data: { ...flow.data } };

      /* ── CREATE TASK flow ── */
      if (flow.type === 'CREATE_TASK') {

        if (flow.step === 'ask_project') {
          nextFlow.data.projectId   = values[0];
          nextFlow.data.projectName = projects.find(p => p._id === values[0])?.title || values[0];
          nextFlow.step = 'ask_count';
          setFlow(nextFlow);

          pushMsg({
            type: 'ai',
            text: 'How many tasks do you want to create for "' + nextFlow.data.projectName + '"?',
            mcq: {
              question: 'Pick a number',
              multi: false,
              options: [
                { value: '1', label: '1 task',  icon: '1️⃣' },
                { value: '3', label: '3 tasks', icon: '3️⃣' },
                { value: '5', label: '5 tasks', icon: '5️⃣' },
                { value: '10', label: '10 tasks', icon: '🔟' },
                { value: 'custom', label: 'Custom…', icon: '✏️' },
              ]
            }
          });
          return;
        }

        if (flow.step === 'ask_count') {
          if (values[0] === 'custom') {
            nextFlow.step = 'ask_count_custom';
            setFlow(nextFlow);
            pushAI('How many tasks? Type a number:');
            return;
          }
          nextFlow.data.count = parseInt(values[0], 10);
          nextFlow.step = 'ask_theme';
          setFlow(nextFlow);

          pushMsg({
            type: 'ai',
            text: 'What theme should these ' + nextFlow.data.count + ' tasks follow?',
            mcq: {
              question: 'Pick a theme (or type your own)',
              multi: false,
              options: [
                { value: 'Software Development Phases', label: 'Dev Phases',    icon: '⚙️' },
                { value: 'UI/UX Design',                label: 'UI/UX Design',  icon: '🎨' },
                { value: 'Testing & QA',                label: 'Testing & QA',  icon: '🧪' },
                { value: 'DevOps & Deployment',         label: 'DevOps',        icon: '🚀' },
                { value: 'Sprint Planning',             label: 'Sprint Planning',icon: '📋' },
                { value: 'custom',                      label: 'Custom…',       icon: '✏️' },
              ]
            }
          });
          return;
        }

        if (flow.step === 'ask_theme') {
          if (values[0] === 'custom') {
            nextFlow.step = 'ask_theme_custom';
            setFlow(nextFlow);
            pushAI('Describe the theme or topic for the tasks:');
            return;
          }
          nextFlow.data.theme = values[0];
          nextFlow.step = 'ask_priority';
          setFlow(nextFlow);

          pushMsg({
            type: 'ai',
            text: 'What priority for these tasks?',
            mcq: {
              question: 'Priority',
              multi: false,
              options: [
                { value: 'High',   label: 'High',   icon: '🔴' },
                { value: 'Medium', label: 'Medium', icon: '🟡' },
                { value: 'Low',    label: 'Low',    icon: '🟢' },
                { value: 'Mixed',  label: 'Mixed',  icon: '🎲' },
              ]
            }
          });
          return;
        }

        if (flow.step === 'ask_priority') {
          nextFlow.data.priority = values[0];
          setFlow(null);
          await executeCreateTasks(nextFlow.data);
          return;
        }
      }

      /* ── CREATE BUG flow ── */
      if (flow.type === 'CREATE_BUG') {

        if (flow.step === 'ask_project') {
          nextFlow.data.projectId   = values[0];
          nextFlow.data.projectName = projects.find(p => p._id === values[0])?.title || values[0];
          nextFlow.step = 'ask_severity';
          setFlow(nextFlow);

          pushMsg({
            type: 'ai',
            text: 'What severity is this bug?',
            mcq: {
              question: 'Severity',
              multi: false,
              options: [
                { value: 'Critical', label: 'Critical', icon: '🔴' },
                { value: 'Major',    label: 'Major',    icon: '🟠' },
                { value: 'Minor',    label: 'Minor',    icon: '🟡' },
              ]
            }
          });
          return;
        }

        if (flow.step === 'ask_severity') {
          nextFlow.data.severity = values[0];
          nextFlow.step = 'ask_assign';
          setFlow(nextFlow);

          const userOpts = users.map(u => ({ value: u._id, label: u.name, icon: '👤' }));
          userOpts.unshift({ value: 'none', label: 'Unassigned', icon: '—' });

          pushMsg({
            type: 'ai',
            text: 'Assign to a team member?',
            mcq: { question: 'Assignee', multi: false, options: userOpts }
          });
          return;
        }

        if (flow.step === 'ask_assign') {
          nextFlow.data.assignedTo = values[0] === 'none' ? null : values[0];
          setFlow(null);
          await executeCreateBug(nextFlow.data);
          return;
        }
      }

      /* ── CREATE PROJECT flow ── */
      if (flow.type === 'CREATE_PROJECT') {

        if (flow.step === 'ask_status') {
          nextFlow.data.status = values[0];
          nextFlow.step = 'ask_nav';
          setFlow(nextFlow);

          pushMsg({
            type: 'ai',
            text: 'After creating, where do you want to go?',
            mcq: {
              question: 'Navigate after creation',
              multi: false,
              options: [
                { value: 'projects', label: 'Projects page', icon: '◈' },
                { value: 'dashboard', label: 'Dashboard',    icon: '▦' },
                { value: 'stay',     label: 'Stay here',     icon: '✓' },
              ]
            }
          });
          return;
        }

        if (flow.step === 'ask_nav') {
          nextFlow.data.navAfter = values[0];
          setFlow(null);
          await executeCreateProject(nextFlow.data);
          return;
        }
      }

      /* ── NAV flow ── */
      if (flow.type === 'NAV') {
        if (flow.step === 'ask_page') {
          setFlow(null);
          navigateTo(values[0]);
          pushAI('Navigated to ' + values[0] + ' ✓');
          return;
        }
      }
    };

    /* ── Handle free-text input during a flow ── */
    const handleFlowText = async (text) => {
      if (!flow) return false;
      const next = { ...flow, data: { ...flow.data } };

      /* CREATE TASK */
      if (flow.type === 'CREATE_TASK') {
        if (flow.step === 'ask_project') {
          // Try to match project by name
          const match = projects.find(p => p.title.toLowerCase().includes(text.toLowerCase()));
          if (match) {
            next.data.projectId = match._id;
            next.data.projectName = match.title;
            next.step = 'ask_count';
            setFlow(next);
            pushMsg({
              type: 'ai',
              text: 'Got it — "' + match.title + '". How many tasks?',
              mcq: {
                question: 'Number of tasks',
                multi: false,
                options: [
                  { value: '1',  label: '1 task',   icon: '1️⃣' },
                  { value: '3',  label: '3 tasks',  icon: '3️⃣' },
                  { value: '5',  label: '5 tasks',  icon: '5️⃣' },
                  { value: '10', label: '10 tasks', icon: '🔟' },
                ]
              }
            });
            return true;
          }
          pushAI('I couldn\'t find that project. Pick from the list above ↑');
          return true;
        }

        if (flow.step === 'ask_count_custom') {
          const n = parseInt(text, 10);
          if (isNaN(n) || n < 1) { pushAI('Please enter a valid number (e.g. 7).'); return true; }
          next.data.count = n;
          next.step = 'ask_theme';
          setFlow(next);
          pushMsg({
            type: 'ai',
            text: 'Theme for the ' + n + ' tasks?',
            mcq: {
              question: 'Pick a theme',
              multi: false,
              options: [
                { value: 'Software Development Phases', label: 'Dev Phases', icon: '⚙️' },
                { value: 'UI/UX Design',                label: 'UI/UX',      icon: '🎨' },
                { value: 'Testing & QA',                label: 'QA',         icon: '🧪' },
                { value: 'custom',                      label: 'Type mine',  icon: '✏️' },
              ]
            }
          });
          return true;
        }

        if (flow.step === 'ask_theme_custom') {
          next.data.theme = text;
          next.step = 'ask_priority';
          setFlow(next);
          pushMsg({
            type: 'ai',
            text: 'Priority for these tasks?',
            mcq: {
              question: 'Priority',
              multi: false,
              options: [
                { value: 'High',   label: 'High',   icon: '🔴' },
                { value: 'Medium', label: 'Medium', icon: '🟡' },
                { value: 'Low',    label: 'Low',    icon: '🟢' },
                { value: 'Mixed',  label: 'Mixed',  icon: '🎲' },
              ]
            }
          });
          return true;
        }
      }

      /* CREATE BUG — title step */
      if (flow.type === 'CREATE_BUG' && flow.step === 'ask_title') {
        next.data.title = text;
        next.step = 'ask_project';
        setFlow(next);
        const opts = projects.map(p => ({ value: p._id, label: p.title, icon: '◈' }));
        pushMsg({
          type: 'ai',
          text: 'Which project does this bug belong to?',
          mcq: { question: 'Project', multi: false, options: opts }
        });
        return true;
      }

      /* CREATE PROJECT — title step */
      if (flow.type === 'CREATE_PROJECT' && flow.step === 'ask_title') {
        next.data.title = text;
        next.step = 'ask_status';
        setFlow(next);
        pushMsg({
          type: 'ai',
          text: 'Initial status for "' + text + '"?',
          mcq: {
            question: 'Status',
            multi: false,
            options: [
              { value: 'Active',    label: 'Active',    icon: '🟢' },
              { value: 'Planning',  label: 'Planning',  icon: '📝' },
              { value: 'Completed', label: 'Completed', icon: '✅' },
            ]
          }
        });
        return true;
      }

      return false; // not handled
    };

    /* ─── Executors ─── */
    async function executeCreateTasks(data) {
      setLoading(true);
      pushAI('Creating ' + data.count + ' tasks for "' + data.projectName + '"…');
      try {
        const priority = data.priority === 'Mixed' ? null : data.priority;
        const res = await api.post('/ai/command', {
          command: 'Create ' + data.count + ' tasks related to ' + data.theme + (priority ? ' with ' + priority + ' priority' : ''),
          projectId: data.projectId
        });
        if (res.data?.created) {
          toast('Created ' + res.data.created + ' tasks ✓', 'success');
          pushAI('✅ Done! Created ' + res.data.created + ' tasks in "' + data.projectName + '":\n\n' +
            (res.data.tasks || []).map(t => '• ' + t.title).join('\n')
          );
        } else {
          pushAI(res.message || 'Tasks created successfully.');
        }
      } catch (err) {
        pushAI('❌ Error: ' + err.message, { isError: true });
      } finally { setLoading(false); }
    }

    async function executeCreateBug(data) {
      setLoading(true);
      try {
        const body = {
          title: data.title,
          description: data.description || data.title,
          project: data.projectId,
          severity: data.severity,
          status: 'Open',
          ...(data.assignedTo ? { assignedTo: data.assignedTo } : {})
        };
        const res = await api.post('/bugs', body);
        if (res._id) {
          toast('Bug logged ✓', 'success');
          pushAI('✅ Bug "' + res.title + '" logged as ' + res.severity + ' in "' + data.projectName + '".');
        } else {
          pushAI('❌ Could not create bug: ' + (res.message || 'Unknown error'), { isError: true });
        }
      } catch (err) {
        pushAI('❌ Error: ' + err.message, { isError: true });
      } finally { setLoading(false); }
    }

    async function executeCreateProject(data) {
      setLoading(true);
      try {
        const res = await api.post('/projects', {
          title: data.title,
          description: data.description || '',
          status: data.status || 'Active'
        });
        if (res._id) {
          toast('Project created ✓', 'success');
          pushAI('✅ Project "' + res.title + '" created with status ' + res.status + '!');
          if (data.navAfter && data.navAfter !== 'stay') navigateTo(data.navAfter);
        } else {
          pushAI('❌ Could not create project: ' + (res.message || ''), { isError: true });
        }
      } catch (err) {
        pushAI('❌ Error: ' + err.message, { isError: true });
      } finally { setLoading(false); }
    }

    /* ─── Intent → start a flow or answer directly ─── */
    const startFlow = (cmd) => {
      const intent = detectIntent(cmd);

      /* Navigation */
      if (intent.startsWith('NAV_')) {
        const pageMap = {
          NAV_PROJECTS: 'projects', NAV_BUGS: 'bugs', NAV_TASKS: 'tasks',
          NAV_REPORTS: 'reports',   NAV_TEAM: 'team', NAV_SPRINTS: 'sprints',
          NAV_DASH: 'dashboard'
        };
        const page = pageMap[intent];
        if (page) {
          navigateTo(page);
          pushAI('📌 Navigated to ' + page.charAt(0).toUpperCase() + page.slice(1) + ' ✓');
          return true;
        }
      }

      /* Create task */
      if (intent === 'CREATE_TASK') {
        // Do we already know the project?
        const knownProject = projectId
          ? projects.find(p => p._id === projectId)
          : null;

        if (knownProject) {
          // Skip project step
          setFlow({ type: 'CREATE_TASK', step: 'ask_count', data: { projectId: knownProject._id, projectName: knownProject.title } });
          pushMsg({
            type: 'ai',
            text: 'Adding tasks to "' + knownProject.title + '". How many?',
            mcq: {
              question: 'Number of tasks',
              multi: false,
              options: [
                { value: '1',  label: '1 task',   icon: '1️⃣' },
                { value: '3',  label: '3 tasks',  icon: '3️⃣' },
                { value: '5',  label: '5 tasks',  icon: '5️⃣' },
                { value: '10', label: '10 tasks', icon: '🔟' },
                { value: 'custom', label: 'Custom…', icon: '✏️' },
              ]
            }
          });
        } else if (projects.length === 0) {
          pushAI('You don\'t have any projects yet. Want me to create one first?');
        } else {
          const opts = projects.map(p => ({ value: p._id, label: p.title, icon: '◈' }));
          setFlow({ type: 'CREATE_TASK', step: 'ask_project', data: {} });
          pushMsg({
            type: 'ai',
            text: 'Sure! Which project should I add tasks to?',
            mcq: { question: 'Select project', multi: false, options: opts }
          });
        }
        return true;
      }

      /* Create bug */
      if (intent === 'CREATE_BUG') {
        setFlow({ type: 'CREATE_BUG', step: 'ask_title', data: {} });
        pushAI('Sure! What\'s the title / short description of the bug?');
        return true;
      }

      /* Create project */
      if (intent === 'CREATE_PROJECT') {
        setFlow({ type: 'CREATE_PROJECT', step: 'ask_title', data: {} });
        pushAI('Great! What should the project be called?');
        return true;
      }

      return false; // fall through to LLM
    };

    /* ─── Main send handler ─── */
    const send = async (overrideText) => {
      const text = (overrideText || input).trim();
      if (!text || loading) return;
      setInput('');
      pushUser(text);

      // If inside a flow, handle as flow text
      if (flow) {
        const handled = await handleFlowText(text);
        if (handled) return;
      }

      // Try intent-based local flow first
      if (startFlow(text)) return;

      // Fall back to LLM
      setLoading(true);
      try {
        const res = await api.post('/ai/command', { command: text, projectId: projectId || null });
        const msg = (res.message || 'Done.').replace(/\\n/g, '\n');

        // Handle LLM-side creations
        if (res.action === 'CREATE_TASKS' && res.data?.created) {
          toast('Created ' + res.data.created + ' tasks', 'success');
        } else if (res.action === 'CREATE_PROJECT' && res.data?.project) {
          toast('Project created!', 'success');
          api.get('/projects').then(d => Array.isArray(d) && setProjects(d));
        } else if (res.action === 'CREATE_BUG' && res.data?.bug) {
          toast('Bug logged!', 'success');
        } else if (res.action === 'GET_FORECAST' && res.data) {
          const d = res.data;
          pushAI(msg + '\n\n📊 Forecast:\n• Completed: ' + d.done + ' tasks\n• Remaining: ' + d.remaining + '\n• Est. end: ' + d.estimatedEnd);
          setLoading(false);
          return;
        }

        pushAI(msg, { action: res.action });
      } catch (err) {
        pushAI('❌ Could not reach AI: ' + err.message, { isError: true });
      } finally {
        setLoading(false);
      }
    };

    const onKey = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    };

    /* ─── Quick chips ─── */
    const CHIPS = [
      { label: 'Add 5 tasks',      icon: '⚡' },
      { label: 'Log a bug',        icon: '🐛' },
      { label: 'New project',      icon: '◈' },
      { label: 'Go to Reports',    icon: '📊' },
      { label: 'Show all projects',icon: '📁' },
      { label: 'Team workload',    icon: '👥' },
    ];

    const actionColors = {
      CREATE_TASKS:   { bg: '#10b98122', border: '#10b98144', text: '#10b981' },
      CREATE_PROJECT: { bg: '#6366f122', border: '#6366f144', text: '#818cf8' },
      CREATE_BUG:     { bg: '#ef444422', border: '#ef444444', text: '#fca5a5' },
      GET_FORECAST:   { bg: '#f59e0b22', border: '#f59e0b44', text: '#fcd34d' },
      GET_SUMMARY:    { bg: '#3b82f622', border: '#3b82f644', text: '#93c5fd' },
    };

    const showChips = msgs.length <= 1 && !flow;

    /* ─── Render ─── */
    if (!open) {
      return React.createElement('div', { className: 'ai-wrap' },
        React.createElement('button', { className: 'ai-fab', onClick: () => setOpen(true), title: 'DevTrack AI' }, '✨')
      );
    }

    return React.createElement('div', { className: 'ai-wrap' },
      React.createElement('div', { className: 'ai-panel' },

        /* Header */
        React.createElement('div', { className: 'ai-header' },
          React.createElement('div', { className: 'ai-header-icon' }, '🤖'),
          React.createElement('div', null,
            React.createElement('div', { className: 'ai-header-title' }, 'DevTrack AI'),
            React.createElement('div', { className: 'ai-header-sub' },
              'Full control  ·  ' + (loading ? 'Thinking…' : flow ? 'Gathering info…' : 'Ready')
            )
          ),
          React.createElement('button', { className: 'ai-close', onClick: () => setOpen(false) }, '✕')
        ),

        /* Messages */
        React.createElement('div', { className: 'ai-msgs' },
          msgs.map((m, i) => {
            if (m.type === 'user') {
              return React.createElement('div', { key: i, className: 'ai-msg-row-user' },
                React.createElement('div', { className: 'ai-bubble-user' }, m.text)
              );
            }
            // AI message
            const ac = m.action ? actionColors[m.action] : null;
            return React.createElement('div', { key: i, className: 'ai-msg-row-ai' },
              ac && React.createElement('span', {
                className: 'ai-action-badge',
                style: { background: ac.bg, borderColor: ac.border, color: ac.text }
              }, m.action.replace(/_/g, ' ')),
              React.createElement('div', { className: 'ai-bubble-ai' + (m.isError ? ' error' : '') },
                React.createElement(RenderText, { text: m.text })
              ),
              m.mcq && React.createElement(McqWidget, {
                question: m.mcq.question,
                options:  m.mcq.options,
                multi:    m.mcq.multi || false,
                onAnswer: handleMcqAnswer,
                disabled: !!m.mcqDone
              })
            );
          }),

          loading && React.createElement('div', { className: 'ai-msg-row-ai' },
            React.createElement('div', { className: 'ai-typing' },
              'Thinking',
              React.createElement('div', { className: 'ai-dot' }),
              React.createElement('div', { className: 'ai-dot' }),
              React.createElement('div', { className: 'ai-dot' })
            )
          ),
          React.createElement('div', { ref: bottomRef })
        ),

        /* Quick chips */
        showChips && React.createElement('div', { className: 'ai-chips' },
          CHIPS.map(c =>
            React.createElement('button', {
              key: c.label, className: 'ai-chip',
              onClick: () => send(c.label), disabled: loading
            }, c.icon, ' ', c.label)
          )
        ),

        /* Input */
        React.createElement('div', { className: 'ai-input-row' },
          React.createElement('input', {
            ref: inputRef,
            className: 'ai-input',
            value: input,
            onChange: e => setInput(e.target.value),
            onKeyDown: onKey,
            placeholder: flow ? 'Type your answer…' : 'Ask anything or give a command…',
            disabled: loading
          }),
          React.createElement('button', {
            className: 'ai-send',
            onClick: () => send(),
            disabled: loading || !input.trim()
          }, '➤')
        )
      )
    );
  }

  window.AIAssistant = AIAssistant;
})();
