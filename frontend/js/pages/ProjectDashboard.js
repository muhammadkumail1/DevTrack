// ProjectDashboard.js — Full project workspace with tabs
// Refactored for HCI compliance: alignment, visual hierarchy, spacing, readability
(function () {
  const e = React.createElement;

  /* ─────────────────────────────────────────────
     Shared style constants
  ───────────────────────────────────────────── */
  const TAB_LIST = ['Overview', 'Board', 'Milestones', 'Backlog', 'Bugs', 'Team', 'Sprints'];

  const CSS = `
    /* ── Project Dashboard Scoped Styles ── */
    .pd-root { display: flex; flex-direction: column; gap: 0; }

    /* Top bar */
    .pd-topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 0 16px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 20px;
      gap: 12px;
      flex-wrap: wrap;
    }
    .pd-crumbs { display: flex; align-items: center; gap: 6px; font-size: 13px; }
    .pd-crumb-link {
      color: var(--text3); cursor: pointer; transition: color .15s;
      display: flex; align-items: center; gap: 5px;
    }
    .pd-crumb-link:hover { color: var(--accent); }
    .pd-crumb-sep { color: var(--border2); font-size: 12px; }
    .pd-crumb-cur { color: var(--text); font-weight: 600; }
    .pd-topbar-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

    /* Project header */
    .pd-header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 20px;
      align-items: start;
      margin-bottom: 24px;
    }
    .pd-title { font-size: 22px; font-weight: 700; color: var(--text); line-height: 1.2; margin-bottom: 4px; }
    .pd-desc { font-size: 13px; color: var(--text2); line-height: 1.5; max-width: 600px; }
    .pd-meta-pills { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
    .pd-meta-pill {
      display: flex; align-items: center; gap: 5px;
      font-size: 12px; color: var(--text3);
      background: var(--bg3); border: 1px solid var(--border);
      border-radius: 20px; padding: 3px 10px;
    }
    .pd-header-right {
      display: flex; flex-direction: column; align-items: flex-end; gap: 6px;
    }
    .pd-spi-box {
      background: var(--bg3); border: 1px solid var(--border);
      border-radius: 8px; padding: 8px 14px; text-align: center; min-width: 80px;
    }
    .pd-spi-val { font-family: 'DM Mono', monospace; font-size: 20px; font-weight: 700; }
    .pd-spi-lbl { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: .5px; margin-top: 2px; }

    /* Tab bar */
    .pd-tabs {
      display: flex; gap: 2px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
      overflow-x: auto;
    }
    .pd-tab {
      padding: 9px 16px;
      font-size: 13px; font-weight: 500;
      color: var(--text3);
      background: transparent; border: none; border-bottom: 2px solid transparent;
      cursor: pointer; white-space: nowrap;
      transition: color .15s, border-color .15s;
      margin-bottom: -1px;
    }
    .pd-tab:hover { color: var(--text); }
    .pd-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

    /* Health banner */
    .pd-health {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 16px; border-radius: 8px;
      border: 1px solid; margin-bottom: 20px;
      font-size: 13px;
    }
    .pd-health-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

    /* KPI grid */
    .pd-kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .pd-kpi {
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: 12px; padding: 16px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .pd-kpi-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: .5px; font-weight: 500; }
    .pd-kpi-value { font-family: 'DM Mono', monospace; font-size: 26px; font-weight: 700; line-height: 1; }
    .pd-kpi-sub { font-size: 11px; color: var(--text3); }
    .pd-kpi-accent-bar { height: 3px; border-radius: 2px; margin-top: 4px; }

    /* Two-col grid */
    .pd-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .pd-card {
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: 12px; padding: 18px;
    }
    .pd-card-title {
      font-size: 12px; font-weight: 600; color: var(--text2);
      text-transform: uppercase; letter-spacing: .5px;
      margin-bottom: 14px;
    }

    /* Task progress strip */
    .pd-task-strip { display: flex; gap: 0; margin-bottom: 12px; border-radius: 6px; overflow: hidden; height: 6px; }

    /* Recent tasks list */
    .pd-activity { display: flex; flex-direction: column; gap: 0; }
    .pd-activity-item {
      display: grid; grid-template-columns: 8px 1fr auto;
      align-items: center; gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
    }
    .pd-activity-item:last-child { border-bottom: none; }
    .pd-activity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .pd-activity-title { font-size: 13px; font-weight: 500; color: var(--text); }
    .pd-activity-meta { font-size: 11px; color: var(--text3); margin-top: 2px; }

    /* Kanban */
    .pd-kanban { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .pd-kanban-col {
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: 12px; padding: 14px; min-height: 400px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .pd-kanban-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 6px; padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }
    .pd-kanban-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
    .pd-kanban-badge {
      font-family: 'DM Mono', monospace; font-size: 11px;
      background: var(--bg3); border: 1px solid var(--border);
      border-radius: 20px; padding: 1px 8px; color: var(--text3);
    }
    .pd-task-card {
      background: var(--bg); border: 1px solid var(--border);
      border-radius: 10px; padding: 12px;
      display: flex; flex-direction: column; gap: 8px;
      transition: border-color .15s, box-shadow .15s;
      cursor: default;
    }
    .pd-task-card:hover {
      border-color: var(--border2);
      box-shadow: 0 2px 12px rgba(0,0,0,.18);
    }
    .pd-task-card-title { font-size: 13px; font-weight: 500; color: var(--text); line-height: 1.35; }
    .pd-task-card-foot {
      display: flex; align-items: center; justify-content: space-between;
      gap: 8px; flex-wrap: wrap;
    }
    .pd-task-card-actions { display: flex; gap: 4px; }
    .pd-move-btn {
      padding: 3px 8px; font-size: 10px; font-weight: 600;
      border-radius: 6px; cursor: pointer; transition: all .12s;
      background: var(--bg2); border: 1px solid var(--border); color: var(--text3);
    }
    .pd-move-btn:hover { background: var(--accent); border-color: var(--accent); color: #fff; }

    /* Priority dot */
    .pd-prio { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }

    /* Avatar initials */
    .pd-avatar {
      width: 24px; height: 24px; border-radius: 50%;
      background: var(--bg3); border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; color: var(--text2); flex-shrink: 0;
    }
    .pd-avatar-md {
      width: 36px; height: 36px; font-size: 13px;
      border-radius: 50%; background: var(--bg3); border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: var(--text2); flex-shrink: 0;
    }

    /* Table layout (Backlog/Bugs) */
    .pd-tbl-head {
      display: grid; gap: 12px; padding: 6px 14px;
      font-size: 10px; font-weight: 600; color: var(--text3);
      text-transform: uppercase; letter-spacing: .5px;
    }
    .pd-tbl-row {
      display: grid; gap: 12px; padding: 10px 14px;
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: 8px; align-items: center;
      margin-bottom: 4px; transition: border-color .12s;
    }
    .pd-tbl-row:hover { border-color: var(--border2); }

    /* Timeline */
    .pd-timeline { display: flex; flex-direction: column; gap: 0; }
    .pd-tl-item { display: grid; grid-template-columns: 32px 1fr; gap: 0; }
    .pd-tl-spine { display: flex; flex-direction: column; align-items: center; }
    .pd-tl-dot {
      width: 12px; height: 12px; border-radius: 50%;
      border: 2px solid var(--border2); background: var(--bg3);
      flex-shrink: 0; z-index: 1; margin-top: 4px;
    }
    .pd-tl-dot.done { border-color: var(--green); background: var(--green); }
    .pd-tl-dot.active { border-color: var(--accent); background: var(--accent); }
    .pd-tl-dot.overdue { border-color: var(--red); background: var(--red); }
    .pd-tl-line { flex: 1; width: 2px; background: var(--border); margin: 4px 0; }
    .pd-tl-content { padding: 4px 0 20px 12px; }

    /* Sprint cards */
    .pd-sprint-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }

    /* Team cards */
    .pd-team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }

    /* Workload bar */
    .pd-workload-bar { height: 4px; background: var(--bg3); border-radius: 4px; overflow: hidden; }
    .pd-workload-fill { height: 100%; border-radius: 4px; transition: width .4s; }

    /* Stat row in team card */
    .pd-stat-row { display: flex; gap: 20px; margin: 10px 0; }
    .pd-stat-item { display: flex; flex-direction: column; gap: 2px; }
    .pd-stat-num { font-family: 'DM Mono', monospace; font-size: 16px; font-weight: 700; }
    .pd-stat-lbl { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: .4px; }

    /* Form in Sprints tab */
    .pd-form-card {
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: 12px; padding: 18px; margin-bottom: 20px;
    }

    /* Empty state */
    .pd-empty { text-align: center; padding: 48px 20px; color: var(--text3); }
    .pd-empty-icon { font-size: 28px; margin-bottom: 8px; }

    /* Fade in */
    @keyframes pd-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .pd-fade { animation: pd-fade .2s ease; }

    /* Responsive */
    @media (max-width: 900px) {
      .pd-kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .pd-two-col { grid-template-columns: 1fr; }
      .pd-kanban { grid-template-columns: 1fr; }
      .pd-header { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .pd-kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `;

  /* ─────────────────────────────────────────────
     Inject styles once
  ───────────────────────────────────────────── */
  if (!document.getElementById('pd-styles')) {
    const style = document.createElement('style');
    style.id = 'pd-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────────
     Small utility components
  ───────────────────────────────────────────── */
  function PdAvatar({ name, size }) {
    const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const hue = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    const cls = size === 'md' ? 'pd-avatar-md' : 'pd-avatar';
    return e('div', {
      className: cls,
      style: { background: `hsl(${hue},40%,20%)`, borderColor: `hsl(${hue},40%,30%)`, color: `hsl(${hue},60%,70%)` }
    }, initials);
  }

  function PrioDot({ priority }) {
    const colors = { High: 'var(--red)', Medium: 'var(--yellow)', Low: 'var(--text3)' };
    return e('div', { className: 'pd-prio', style: { background: colors[priority] || 'var(--text3)' } });
  }

  function WorkloadBar({ pct }) {
    const color = pct >= 75 ? 'var(--green)' : pct >= 40 ? 'var(--accent)' : 'var(--yellow)';
    return e('div', { className: 'pd-workload-bar' },
      e('div', { className: 'pd-workload-fill', style: { width: pct + '%', background: color } })
    );
  }

  function PdEmpty({ icon, text }) {
    return e('div', { className: 'pd-empty' },
      e('div', { className: 'pd-empty-icon' }, icon),
      e('div', { style: { fontSize: 13 } }, text)
    );
  }

  function daysFrom(dateStr) {
    if (!dateStr) return 999;
    return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  }

  /* ─────────────────────────────────────────────
     Tab bar
  ───────────────────────────────────────────── */
  function TabBar({ active, setActive }) {
    return e('div', { className: 'pd-tabs' },
      TAB_LIST.map(t =>
        e('button', {
          key: t,
          className: 'pd-tab' + (active === t ? ' active' : ''),
          onClick: () => setActive(t)
        }, t)
      )
    );
  }

  /* ─────────────────────────────────────────────
     Health banner
  ───────────────────────────────────────────── */
  function HealthBanner({ health, spi, daysLeft, tasksTotal, tasksCompleted }) {
    const map = {
      'On Track':   { bg: 'rgba(34,197,94,.08)',  border: 'rgba(34,197,94,.25)',  dot: 'var(--green)',  text: 'var(--green)'  },
      'At Risk':    { bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.25)', dot: 'var(--yellow)', text: 'var(--yellow)' },
      'Off Track':  { bg: 'rgba(239,68,68,.08)',  border: 'rgba(239,68,68,.25)',  dot: 'var(--red)',    text: 'var(--red)'    },
      'Completed':  { bg: 'rgba(79,156,249,.08)', border: 'rgba(79,156,249,.25)', dot: 'var(--accent)', text: 'var(--accent)' },
    };
    const c = map[health] || map['On Track'];
    return e('div', {
      className: 'pd-health',
      style: { background: c.bg, borderColor: c.border, color: c.text }
    },
      e('div', { className: 'pd-health-dot', style: { background: c.dot } }),
      e('span', { style: { fontWeight: 600, fontSize: 13 } }, health),
      e('span', { style: { color: 'var(--text3)', fontSize: 12 } }, '·'),
      spi != null && e('span', { style: { fontSize: 12, color: 'var(--text2)' } }, 'SPI ' + spi.toFixed(2)),
      daysLeft != null && e('span', { style: { fontSize: 12, color: 'var(--text2)' } }, daysLeft + ' days remaining'),
      tasksTotal > 0 && e('span', { style: { fontSize: 12, color: 'var(--text2)', marginLeft: 'auto' } },
        tasksCompleted + ' / ' + tasksTotal + ' tasks done'
      )
    );
  }

  /* ─────────────────────────────────────────────
     KPI Card
  ───────────────────────────────────────────── */
  function KpiCard({ label, value, sub, color }) {
    return e('div', { className: 'pd-kpi' },
      e('div', { className: 'pd-kpi-label' }, label),
      e('div', { className: 'pd-kpi-value', style: { color } }, value),
      sub && e('div', { className: 'pd-kpi-sub' }, sub),
      e('div', { className: 'pd-kpi-accent-bar', style: { background: color, opacity: .35, width: '40%' } })
    );
  }

  /* ─────────────────────────────────────────────
     Overview tab
  ───────────────────────────────────────────── */
  function OverviewTab({ data, project, canManage }) {
    const s = data.stats;
    const kpiCards = [
      { label: 'Completion',  value: s.progress + '%',           sub: s.doneTasks + '/' + s.totalTasks + ' tasks', color: 'var(--green)'  },
      { label: 'Open Bugs',   value: s.openBugs,                 sub: s.criticalBugs + ' critical',               color: 'var(--red)'    },
      { label: 'Milestones',  value: s.completedMilestones + '/' + s.totalMilestones, sub: 'completed',           color: 'var(--purple)' },
      { label: 'Sprints',     value: s.totalSprints,             sub: data.activeSprint ? 'Active: ' + data.activeSprint.name : 'None active', color: 'var(--accent)' },
    ];

    const total = s.todoTasks + s.inProgressTasks + s.doneTasks;
    const toPct = n => total > 0 ? (n / total * 100).toFixed(1) : 0;

    return e('div', { className: 'pd-fade' },

      data.health && e(HealthBanner, {
        health: data.health, spi: data.spi,
        daysLeft: data.daysRemaining,
        tasksTotal: s.totalTasks, tasksCompleted: s.doneTasks
      }),

      /* KPI row */
      e('div', { className: 'pd-kpi-grid' },
        kpiCards.map(k => e(KpiCard, { key: k.label, ...k }))
      ),

      /* Progress + Sprint row */
      e('div', { className: 'pd-two-col' },

        e('div', { className: 'pd-card' },
          e('div', { className: 'pd-card-title' }, 'Task Progress'),

          /* Status strip */
          total > 0 && e('div', { className: 'pd-task-strip' },
            e('div', { style: { width: toPct(s.todoTasks) + '%', background: 'var(--bg3)' } }),
            e('div', { style: { width: toPct(s.inProgressTasks) + '%', background: 'var(--yellow)' } }),
            e('div', { style: { width: toPct(s.doneTasks) + '%', background: 'var(--green)' } })
          ),

          e('div', { style: { display: 'flex', gap: 16, marginTop: 14, marginBottom: 14 } },
            e('div', { style: { flex: 1 } },
              e('div', { style: { fontFamily: "'DM Mono',monospace", fontSize: 24, fontWeight: 700, color: 'var(--text)' } }, s.todoTasks),
              e('div', { style: { fontSize: 11, color: 'var(--text3)', marginTop: 2 } }, 'To Do')
            ),
            e('div', { style: { flex: 1 } },
              e('div', { style: { fontFamily: "'DM Mono',monospace", fontSize: 24, fontWeight: 700, color: 'var(--yellow)' } }, s.inProgressTasks),
              e('div', { style: { fontSize: 11, color: 'var(--text3)', marginTop: 2 } }, 'In Progress')
            ),
            e('div', { style: { flex: 1 } },
              e('div', { style: { fontFamily: "'DM Mono',monospace", fontSize: 24, fontWeight: 700, color: 'var(--green)' } }, s.doneTasks),
              e('div', { style: { fontSize: 11, color: 'var(--text3)', marginTop: 2 } }, 'Done')
            )
          ),
          e(ProgressBar, { pct: s.progress }),
          e('div', { style: { textAlign: 'right', fontSize: 12, color: 'var(--text3)', marginTop: 6 } }, s.progress + '% complete')
        ),

        e('div', { className: 'pd-card' },
          e('div', { className: 'pd-card-title' }, 'Active Sprint'),
          data.activeSprint
            ? e('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
                e('div', { style: { fontWeight: 600, fontSize: 15, color: 'var(--text)' } }, data.activeSprint.name),
                e('div', { style: { fontSize: 12, color: 'var(--text3)' } },
                  fmt(data.activeSprint.startDate) + ' → ' + fmt(data.activeSprint.endDate)
                ),
                e(StatusBadge, { status: data.activeSprint.status }),
                e('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 } },
                  e('div', { style: { width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 } }),
                  e('span', { style: { fontSize: 11, color: 'var(--green)', fontWeight: 600 } }, 'Currently Active')
                )
              )
            : e('div', { style: { color: 'var(--text3)', fontSize: 13 } }, 'No active sprint scheduled')
        )
      ),

      /* Recent tasks */
      e('div', { className: 'pd-card' },
        e('div', { className: 'pd-card-title' }, 'Recent Tasks'),
        data.recentTasks && data.recentTasks.length > 0
          ? e('div', { className: 'pd-activity' },
              data.recentTasks.map(t => {
                const dotColor = t.status === 'Done' ? 'var(--green)' : t.status === 'In Progress' ? 'var(--yellow)' : 'var(--text3)';
                return e('div', { key: t._id, className: 'pd-activity-item' },
                  e('div', { className: 'pd-activity-dot', style: { background: dotColor } }),
                  e('div', null,
                    e('div', { className: 'pd-activity-title' }, t.title),
                    e('div', { className: 'pd-activity-meta' },
                      (t.assignedTo?.name || 'Unassigned') + (t.dueDate ? '  ·  Due ' + fmt(t.dueDate) : '')
                    )
                  ),
                  e(StatusBadge, { status: t.status })
                );
              })
            )
          : e('div', { style: { color: 'var(--text3)', fontSize: 13 } }, 'No tasks yet')
      )
    );
  }

  /* ─────────────────────────────────────────────
     Board (Kanban) tab
  ───────────────────────────────────────────── */
  function BoardTab({ projectId, onChange }) {
    const [tasks, setTasks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const toast = useToast();
    const cols = ['To Do', 'In Progress', 'Done'];
    const colColors = { 'To Do': 'var(--text3)', 'In Progress': 'var(--yellow)', 'Done': 'var(--green)' };
    const moveLabels = { 'To Do': '←', 'In Progress': '▶', 'Done': '✓' };

    React.useEffect(() => {
      setLoading(true);
      api.get('/tasks?project=' + projectId).then(d => { Array.isArray(d) && setTasks(d); setLoading(false); });
    }, [projectId]);

    const moveTask = (taskId, newStatus) => {
      api.patch('/tasks/' + taskId + '/status', { status: newStatus }).then(d => {
        if (!d.message) {
          setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
          toast('Moved to ' + newStatus, 'success');
          onChange?.();
        }
      });
    };

    if (loading) return e(Spinner);

    return e('div', { className: 'pd-kanban pd-fade' },
      cols.map(col => {
        const items = tasks.filter(t => t.status === col);
        return e('div', { key: col, className: 'pd-kanban-col' },
          e('div', { className: 'pd-kanban-header' },
            e('span', { className: 'pd-kanban-title', style: { color: colColors[col] } }, col),
            e('span', { className: 'pd-kanban-badge' }, items.length)
          ),
          items.length === 0
            ? e('div', { style: { color: 'var(--text3)', fontSize: 12, textAlign: 'center', padding: '24px 0', borderRadius: 8, border: '2px dashed var(--border)' } }, 'No tasks')
            : items.map(t =>
                e('div', { key: t._id, className: 'pd-task-card' },
                  e('div', { style: { display: 'flex', gap: 8, alignItems: 'flex-start' } },
                    e(PrioDot, { priority: t.priority }),
                    e('div', { className: 'pd-task-card-title' }, t.title)
                  ),
                  e('div', { className: 'pd-task-card-foot' },
                    e('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                      t.assignedTo && e(PdAvatar, { name: t.assignedTo.name }),
                      t.dueDate && e('span', {
                        style: { fontSize: 11, color: daysFrom(t.dueDate) < 0 ? 'var(--red)' : 'var(--text3)' }
                      }, fmt(t.dueDate))
                    ),
                    e('div', { className: 'pd-task-card-actions' },
                      cols.filter(c => c !== col).map(c =>
                        e('button', {
                          key: c, className: 'pd-move-btn',
                          onClick: () => moveTask(t._id, c),
                          title: 'Move to ' + c
                        }, moveLabels[c])
                      )
                    )
                  )
                )
              )
        );
      })
    );
  }

  /* ─────────────────────────────────────────────
     Milestones (Timeline) tab
  ───────────────────────────────────────────── */
  function MilestonesTab({ projectId, canManage }) {
    const [milestones, setMilestones] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const toast = useToast();

    React.useEffect(() => {
      setLoading(true);
      api.get('/milestones?project=' + projectId).then(d => { Array.isArray(d) && setMilestones(d); setLoading(false); });
    }, [projectId]);

    const approve = id => {
      api.patch('/milestones/' + id + '/approve').then(d => {
        if (!d.message) {
          setMilestones(prev => prev.map(m => m._id === id ? { ...m, status: 'Approved' } : m));
          toast('Milestone approved', 'success');
        }
      });
    };

    if (loading) return e(Spinner);
    if (milestones.length === 0) return e(PdEmpty, { icon: '◆', text: 'No milestones defined' });

    const dotClass = m => {
      if (m.status === 'Approved' || m.status === 'Completed') return 'done';
      if (m.status === 'In Progress') return 'active';
      if (m.dueDate && new Date(m.dueDate) < new Date() && m.status !== 'Approved') return 'overdue';
      return '';
    };

    return e('div', { className: 'pd-timeline pd-fade' },
      milestones.map(m =>
        e('div', { key: m._id, className: 'pd-tl-item' },
          e('div', { className: 'pd-tl-spine' },
            e('span', { className: 'pd-tl-dot ' + dotClass(m) }),
            e('div', { className: 'pd-tl-line' })
          ),
          e('div', { className: 'pd-tl-content' },
            e('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' } },
              e('div', null,
                e('div', { style: { fontWeight: 600, fontSize: 14, marginBottom: 4, color: 'var(--text)' } }, m.title),
                m.description && e('div', { style: { fontSize: 12, color: 'var(--text3)', marginBottom: 8, lineHeight: 1.5 } }, m.description),
                e('div', { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
                  e(StatusBadge, { status: m.status }),
                  m.dueDate && e('span', {
                    style: {
                      fontSize: 12,
                      color: daysFrom(m.dueDate) < 0 && m.status !== 'Approved' && m.status !== 'Completed'
                        ? 'var(--red)' : 'var(--text3)'
                    }
                  }, '📅 ' + fmt(m.dueDate))
                )
              ),
              canManage && m.status !== 'Approved' &&
                e('button', {
                  className: 'btn btn-sm',
                  onClick: () => approve(m._id),
                  style: { flexShrink: 0 }
                }, '✓ Approve')
            )
          )
        )
      )
    );
  }

  /* ─────────────────────────────────────────────
     Backlog tab
  ───────────────────────────────────────────── */
  function BacklogTab({ projectId }) {
    const [tasks, setTasks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [sFilter, setSFilter] = React.useState('');
    const [pFilter, setPFilter] = React.useState('');
    const gridTpl = '1fr 90px 110px 140px 100px';

    React.useEffect(() => {
      setLoading(true);
      api.get('/tasks?project=' + projectId).then(d => { Array.isArray(d) && setTasks(d); setLoading(false); });
    }, [projectId]);

    if (loading) return e(Spinner);

    const filtered = tasks.filter(t =>
      (!sFilter || t.status === sFilter) &&
      (!pFilter || t.priority === pFilter)
    );

    return e('div', { className: 'pd-fade' },
      e('div', { style: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' } },
        e('select', { value: sFilter, onChange: ex => setSFilter(ex.target.value), style: { width: 140 } },
          e('option', { value: '' }, 'All Status'),
          ['To Do', 'In Progress', 'Done'].map(s => e('option', { key: s, value: s }, s))
        ),
        e('select', { value: pFilter, onChange: ex => setPFilter(ex.target.value), style: { width: 130 } },
          e('option', { value: '' }, 'All Priority'),
          ['Low', 'Medium', 'High'].map(p => e('option', { key: p, value: p }, p))
        ),
        e('span', { style: { fontSize: 12, color: 'var(--text3)', alignSelf: 'center', marginLeft: 4 } },
          filtered.length + ' tasks'
        )
      ),
      e('div', { className: 'pd-tbl-head', style: { gridTemplateColumns: gridTpl } },
        e('div', null, 'Title'), e('div', null, 'Priority'), e('div', null, 'Status'),
        e('div', null, 'Assignee'), e('div', null, 'Due')
      ),
      filtered.length === 0
        ? e(PdEmpty, { icon: '◻', text: 'No tasks match filters' })
        : filtered.map(t =>
            e('div', { key: t._id, className: 'pd-tbl-row', style: { gridTemplateColumns: gridTpl } },
              e('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                e(PrioDot, { priority: t.priority }),
                e('span', { style: { fontWeight: 500, fontSize: 13 } }, t.title)
              ),
              e(StatusBadge, { status: t.priority }),
              e(StatusBadge, { status: t.status }),
              t.assignedTo
                ? e('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                    e(PdAvatar, { name: t.assignedTo.name }),
                    e('span', { style: { fontSize: 12, color: 'var(--text2)' } }, t.assignedTo.name)
                  )
                : e('span', { style: { color: 'var(--text3)', fontSize: 12 } }, '—'),
              e('span', {
                style: {
                  fontSize: 12,
                  color: t.dueDate && daysFrom(t.dueDate) < 0 && t.status !== 'Done'
                    ? 'var(--red)' : 'var(--text3)'
                }
              }, fmt(t.dueDate))
            )
          )
    );
  }

  /* ─────────────────────────────────────────────
     Bugs tab
  ───────────────────────────────────────────── */
  function BugsTab({ projectId }) {
    const [bugs, setBugs] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [sFilter, setSFilter] = React.useState('');
    const gridTpl = '1fr 90px 100px 150px';

    React.useEffect(() => {
      setLoading(true);
      api.get('/bugs?project=' + projectId).then(d => { Array.isArray(d) && setBugs(d); setLoading(false); });
    }, [projectId]);

    if (loading) return e(Spinner);

    const filtered = bugs.filter(b => !sFilter || b.status === sFilter);

    return e('div', { className: 'pd-fade' },
      e('div', { style: { display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' } },
        e('select', { value: sFilter, onChange: ex => setSFilter(ex.target.value), style: { width: 150 } },
          e('option', { value: '' }, 'All Status'),
          ['Open', 'In Progress', 'Resolved', 'Closed'].map(s => e('option', { key: s, value: s }, s))
        ),
        e('span', { style: { fontSize: 12, color: 'var(--text3)' } }, filtered.length + ' bugs')
      ),
      e('div', { className: 'pd-tbl-head', style: { gridTemplateColumns: gridTpl } },
        e('div', null, 'Title'), e('div', null, 'Severity'), e('div', null, 'Status'), e('div', null, 'Assigned')
      ),
      filtered.length === 0
        ? e(PdEmpty, { icon: '⬡', text: 'No bugs found' })
        : filtered.map(b =>
            e('div', { key: b._id, className: 'pd-tbl-row', style: { gridTemplateColumns: gridTpl } },
              e('span', { style: { fontWeight: 500, fontSize: 13 } }, b.title),
              e(StatusBadge, { status: b.severity }),
              e(StatusBadge, { status: b.status }),
              b.assignedTo
                ? e('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                    e(PdAvatar, { name: b.assignedTo.name }),
                    e('span', { style: { fontSize: 12, color: 'var(--text2)' } }, b.assignedTo.name)
                  )
                : e('span', { style: { color: 'var(--text3)', fontSize: 12 } }, 'Unassigned')
            )
          )
    );
  }

  /* ─────────────────────────────────────────────
     Team tab
  ───────────────────────────────────────────── */
  function TeamTab({ memberWorkload }) {
    if (!memberWorkload || memberWorkload.length === 0) return e(PdEmpty, { icon: '◑', text: 'No team members' });

    return e('div', { className: 'pd-team-grid pd-fade' },
      memberWorkload.map(m => {
        const pct = m.total > 0 ? Math.round((m.done / m.total) * 100) : 0;
        const user = m.user;
        if (!user) return null;
        return e('div', { key: user._id, className: 'pd-card' },
          e('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 } },
            e(PdAvatar, { name: user.name, size: 'md' }),
            e('div', null,
              e('div', { style: { fontWeight: 600, fontSize: 14, color: 'var(--text)' } }, user.name),
              e('div', { style: { fontSize: 12, color: 'var(--text3)' } }, m.projectRole || user.role)
            )
          ),
          e('div', { className: 'pd-stat-row' },
            e('div', { className: 'pd-stat-item' },
              e('div', { className: 'pd-stat-num', style: { color: 'var(--text)' } }, m.total),
              e('div', { className: 'pd-stat-lbl' }, 'Total')
            ),
            e('div', { className: 'pd-stat-item' },
              e('div', { className: 'pd-stat-num', style: { color: 'var(--yellow)' } }, m.inProgress || 0),
              e('div', { className: 'pd-stat-lbl' }, 'Active')
            ),
            e('div', { className: 'pd-stat-item' },
              e('div', { className: 'pd-stat-num', style: { color: 'var(--green)' } }, m.done),
              e('div', { className: 'pd-stat-lbl' }, 'Done')
            )
          ),
          e(WorkloadBar, { pct }),
          e('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 5 } },
            e('span', { style: { fontSize: 11, color: 'var(--text3)' } }, 'Completion'),
            e('span', { style: { fontSize: 11, fontFamily: "'DM Mono',monospace", color: 'var(--text2)' } }, pct + '%')
          )
        );
      })
    );
  }

  /* ─────────────────────────────────────────────
     Sprints tab
  ───────────────────────────────────────────── */
  function SprintsTab({ projectId, canManage }) {
    const [sprints, setSprints] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showForm, setShowForm] = React.useState(false);
    const [form, setForm] = React.useState({ name: '', startDate: '', endDate: '', status: 'Planned' });
    const toast = useToast();

    const load = () => api.get('/sprints?project=' + projectId).then(d => { Array.isArray(d) && setSprints(d); setLoading(false); });
    React.useEffect(() => { load(); }, [projectId]);

    const save = () => {
      api.post('/sprints', { ...form, project: projectId }).then(d => {
        if (!d.message) {
          setSprints(prev => [d, ...prev]);
          setShowForm(false);
          setForm({ name: '', startDate: '', endDate: '', status: 'Planned' });
          toast('Sprint created', 'success');
        } else toast(d.message, 'error');
      });
    };

    if (loading) return e(Spinner);

    return e('div', { className: 'pd-fade' },
      canManage && e('div', { style: { marginBottom: 16 } },
        e('button', {
          className: 'btn btn-sm',
          onClick: () => setShowForm(f => !f)
        }, showForm ? '✕ Cancel' : '+ New Sprint')
      ),

      showForm && e('div', { className: 'pd-form-card' },
        e('div', { className: 'pd-card-title', style: { marginBottom: 14 } }, 'New Sprint'),
        e('div', { className: 'grid2' },
          e(Field, { label: 'Sprint Name' },
            e('input', { value: form.name, onChange: ex => setForm(p => ({ ...p, name: ex.target.value })), placeholder: 'e.g. Sprint 1' })
          ),
          e(Field, { label: 'Status' },
            e('select', { value: form.status, onChange: ex => setForm(p => ({ ...p, status: ex.target.value })) },
              ['Planned', 'Active', 'Completed'].map(s => e('option', { key: s, value: s }, s))
            )
          )
        ),
        e('div', { className: 'grid2' },
          e(Field, { label: 'Start Date' },
            e('input', { type: 'date', value: form.startDate, onChange: ex => setForm(p => ({ ...p, startDate: ex.target.value })) })
          ),
          e(Field, { label: 'End Date' },
            e('input', { type: 'date', value: form.endDate, onChange: ex => setForm(p => ({ ...p, endDate: ex.target.value })) })
          )
        ),
        e('div', { style: { display: 'flex', justifyContent: 'flex-end', marginTop: 8 } },
          e('button', { className: 'btn', onClick: save }, 'Create Sprint')
        )
      ),

      sprints.length === 0
        ? e(PdEmpty, { icon: '◎', text: 'No sprints yet' })
        : e('div', { className: 'pd-sprint-grid' },
            sprints.map(s =>
              e('div', { key: s._id, className: 'pd-card' },
                e('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 } },
                  e('div', { style: { fontWeight: 600, fontSize: 14, color: 'var(--text)' } }, s.name),
                  e(StatusBadge, { status: s.status })
                ),
                e('div', { style: { fontSize: 12, color: 'var(--text3)', marginBottom: 10 } },
                  fmt(s.startDate) + ' → ' + fmt(s.endDate)
                ),
                s.tasks && e('div', null,
                  e('div', { style: { display: 'flex', gap: 14, fontSize: 11, color: 'var(--text3)', marginBottom: 8 } },
                    e('span', null, 'Todo: ' + s.tasks.todo),
                    e('span', { style: { color: 'var(--yellow)' } }, 'Active: ' + s.tasks.inProgress),
                    e('span', { style: { color: 'var(--green)' } }, 'Done: ' + s.tasks.completed)
                  ),
                  e(ProgressBar, { pct: s.progress || 0 })
                ),
                s.status === 'Active' && e('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 } },
                  e('div', { style: { width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' } }),
                  e('span', { style: { fontSize: 11, color: 'var(--green)', fontWeight: 600 } }, 'Currently Active')
                )
              )
            )
          )
    );
  }

  /* ─────────────────────────────────────────────
     RAG dot for topbar
  ───────────────────────────────────────────── */
  function RagDot({ health }) {
    const colors = { 'On Track': 'var(--green)', 'At Risk': 'var(--yellow)', 'Off Track': 'var(--red)', 'Completed': 'var(--accent)' };
    return e('div', { style: { width: 8, height: 8, borderRadius: '50%', background: colors[health] || 'var(--text3)', flexShrink: 0 } });
  }

  /* ─────────────────────────────────────────────
     Main ProjectDashboard
  ───────────────────────────────────────────── */
  function ProjectDashboard({ project: initialProject, onBack }) {
    const { user } = useAuth();
    const canManage = user?.role === 'Manager' || user?.role === 'Admin';
    const [tab, setTab] = React.useState('Overview');
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const load = (quiet) => {
      if (quiet) setRefreshing(true); else setLoading(true);
      api.get('/projects/' + initialProject._id + '/overview').then(d => {
        if (!d.message) setData(d);
        setLoading(false);
        setRefreshing(false);
      });
    };

    React.useEffect(() => {
      load(false);
      const iv = setInterval(() => load(true), 30000);
      return () => clearInterval(iv);
    }, [initialProject._id]);

    React.useEffect(() => {
      if (tab === 'Overview') load(true);
    }, [tab]);

    const tabContent = () => {
      if (!data && tab === 'Overview') return e(Spinner);
      if (tab === 'Overview')   return e(OverviewTab,   { data, project: initialProject, canManage });
      if (tab === 'Board')      return e(BoardTab,      { projectId: initialProject._id, canManage, onChange: () => load(true) });
      if (tab === 'Milestones') return e(MilestonesTab, { projectId: initialProject._id, canManage });
      if (tab === 'Backlog')    return e(BacklogTab,    { projectId: initialProject._id, canManage });
      if (tab === 'Bugs')       return e(BugsTab,       { projectId: initialProject._id });
      if (tab === 'Team')       return e(TeamTab,       { memberWorkload: data?.memberWorkload });
      if (tab === 'Sprints')    return e(SprintsTab,    { projectId: initialProject._id, canManage });
      return null;
    };

    const proj = data?.project || initialProject;

    return e('div', { className: 'pd-root' },

      /* ── Top breadcrumb bar ── */
      e('div', { className: 'pd-topbar' },
        e('div', { className: 'pd-crumbs' },
          e('span', { className: 'pd-crumb-link', onClick: onBack }, '◈ Projects'),
          e('span', { className: 'pd-crumb-sep' }, '/'),
          e('span', { className: 'pd-crumb-cur' }, proj.title)
        ),
        e('div', { className: 'pd-topbar-right' },
          refreshing && e('span', { style: { fontSize: 11, color: 'var(--text3)' } }, 'Refreshing…'),
          data?.health && e('div', { style: { display: 'flex', alignItems: 'center', gap: 5 } },
            e(RagDot, { health: data.health }),
            e('span', { style: { fontSize: 12, color: 'var(--text3)' } }, data.health)
          ),
          e(StatusBadge, { status: proj.status }),
          e('button', {
            className: 'btn btn-ghost btn-sm',
            onClick: () => load(false),
            title: 'Refresh',
            style: { minWidth: 32, padding: '5px 10px' }
          }, '↻'),
          e('button', { className: 'btn btn-ghost btn-sm', onClick: onBack }, '← Back')
        )
      ),

      /* ── Project header ── */
      e('div', { className: 'pd-header' },
        e('div', null,
          e('div', { className: 'pd-title' }, proj.title),
          proj.description && e('div', { className: 'pd-desc' }, proj.description),
          e('div', { className: 'pd-meta-pills' },
            proj.manager?.name && e('div', { className: 'pd-meta-pill' },
              e('span', null, '👤'), proj.manager.name
            ),
            (proj.startDate || proj.endDate) && e('div', { className: 'pd-meta-pill' },
              e('span', null, '📅'),
              (proj.startDate ? fmt(proj.startDate) : '—') + ' → ' + (proj.endDate ? fmt(proj.endDate) : '—')
            ),
            proj.members?.length > 0 && e('div', { className: 'pd-meta-pill' },
              e('span', null, '👥'), proj.members.length + ' members'
            )
          )
        ),
        data?.spi != null && e('div', { className: 'pd-header-right' },
          e('div', { className: 'pd-spi-box' },
            e('div', {
              className: 'pd-spi-val',
              style: {
                color: data.spi >= 0.95 ? 'var(--green)' : data.spi >= 0.8 ? 'var(--yellow)' : 'var(--red)'
              }
            }, data.spi.toFixed(2)),
            e('div', { className: 'pd-spi-lbl' }, 'SPI')
          )
        )
      ),

      /* ── Tab bar ── */
      e(TabBar, { active: tab, setActive: setTab }),

      /* ── Tab content ── */
      loading && !data
        ? e(Spinner)
        : e('div', null, tabContent())
    );
  }

  window.ProjectDashboard = ProjectDashboard;
})();