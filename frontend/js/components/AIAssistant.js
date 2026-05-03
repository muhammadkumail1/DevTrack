// DevTrack AI Assistant - Smart floating chat widget
function AIAssistant({ projectId }) {
  const toast = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([
    {
      type: 'ai',
      text: 'Hi! I\'m DevTrack AI with live access to your database.\n\nI can:\n- List/filter projects, tasks, bugs\n- Create tasks with smart descriptions\n- Add new projects or bug reports\n- Recommend who to assign work to\n- Forecast project completion\n- Answer PMP, Agile, Scrum questions\n\nWhat would you like to do?'
    }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(function() {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  React.useEffect(function() {
    if (isOpen && inputRef.current) {
      setTimeout(function() { inputRef.current && inputRef.current.focus(); }, 100);
    }
  }, [isOpen]);

  var formatAssistantMessage = function(text) {
    if (!text) return 'Done.';
    var cleaned = String(text)
      .replace(/```json\s*/gi, '')
      .replace(/```/g, '')
      .replace(/\\n/g, '\n')
      .trim();

    if (cleaned[0] === '"' && cleaned[cleaned.length - 1] === '"') {
      cleaned = cleaned.slice(1, -1);
    }

    return cleaned;
  };

  var quickActions = [
    { label: 'List all projects', icon: '📁' },
    { label: 'Show team workload', icon: '👥' },
    { label: 'What is Scrum?', icon: '📘' },
    { label: 'Create 5 tasks', icon: '⚡' },
  ];

  var handleCommand = async function(cmd) {
    var text = (cmd || input).trim();
    if (!text || loading) return;

    var activeProjectId = projectId || null;

    setMessages(function(prev) { return prev.concat([{ type: 'user', text: text }]); });
    setInput('');
    setLoading(true);

    try {
      var response = await api.post('/ai/command', { command: text, projectId: activeProjectId });

      var displayText = formatAssistantMessage(response.message || 'Done.');

      if (response.action === 'CREATE_TASKS' && response.data && response.data.created) {
        if (typeof toast === 'function') toast('Created ' + response.data.created + ' tasks', 'success');
      } else if (response.action === 'CREATE_PROJECT' && response.data && response.data.project) {
        if (typeof toast === 'function') toast('Project created!', 'success');
      } else if (response.action === 'CREATE_BUG' && response.data && response.data.bug) {
        if (typeof toast === 'function') toast('Bug logged!', 'success');
      } else if (response.action === 'GET_FORECAST' && response.data) {
        var d = response.data;
        displayText = formatAssistantMessage(response.message || '') + '\n\n📊 Progress Summary:\n- Completed: ' + d.done + ' tasks\n- Remaining: ' + d.remaining + ' tasks\n- Estimated end: ' + d.estimatedEnd;
      } else if (response.action === 'GET_SUMMARY' && response.data) {
        var s = response.data;
        displayText = formatAssistantMessage(response.message || '') + '\n\n📌 Project Stats:\n- Progress: ' + s.progress + '%\n- Tasks: ' + s.completedTasks + '/' + s.totalTasks + ' done\n- Open bugs: ' + s.openBugs;
      }

      setMessages(function(prev) { return prev.concat([{ type: 'ai', text: displayText, action: response.action }]); });
    } catch (error) {
      setMessages(function(prev) { return prev.concat([{ type: 'ai', text: '❌ Error: ' + (error.message || 'Could not process command'), isError: true }]); });
    } finally {
      setLoading(false);
    }
  };

  var handleKey = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommand();
    }
  };

  var renderText = function(text) {
    if (!text) return null;
    var lines = text.split('\n');
    return lines.map(function(line, i) {
      return React.createElement('div', {
        key: i,
        style: { minHeight: line.trim() ? 'auto' : '8px', lineHeight: '1.55' }
      }, line);
    });
  };

  var getActionBadge = function(action) {
    var badges = {
      'CREATE_TASKS': { text: 'Tasks Created', color: '#10b981' },
      'CREATE_PROJECT': { text: 'Project Created', color: '#6366f1' },
      'CREATE_BUG': { text: 'Bug Logged', color: '#ef4444' },
      'GET_FORECAST': { text: 'Forecast', color: '#f59e0b' },
      'GET_SUMMARY': { text: 'Summary', color: '#3b82f6' },
    };
    return badges[action] || null;
  };

  // Floating button when closed
  if (!isOpen) {
    return React.createElement('div', { style: { position: 'fixed', bottom: 24, right: 24, zIndex: 9999 } },
      React.createElement('button', {
        onClick: function() { setIsOpen(true); },
        title: 'Open DevTrack AI',
        style: {
          width: 58, height: 58, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white', border: 'none', fontSize: 24, cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(99,102,241,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.25s ease',
        },
        onMouseEnter: function(e) {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.6)';
        },
        onMouseLeave: function(e) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.45)';
        },
      }, '✨')
    );
  }

  // Chat window
  return React.createElement('div', { style: { position: 'fixed', bottom: 24, right: 24, zIndex: 9999 } },
    React.createElement('div', {
      style: {
        width: 420, height: 580, background: 'var(--bg)',
        border: '1px solid var(--border)', borderRadius: 18,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }
    },

      // Header
      React.createElement('div', {
        style: {
          padding: '14px 18px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex', alignItems: 'center', gap: 12,
          flexShrink: 0,
        }
      },
        React.createElement('div', {
          style: {
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }
        }, '🤖'),
        React.createElement('div', { style: { flex: 1, minWidth: 0 } },
          React.createElement('div', { style: { fontWeight: 700, fontSize: 14, color: 'white' } }, 'DevTrack AI'),
          React.createElement('div', { style: { fontSize: 11, color: 'rgba(255,255,255,0.8)' } },
            'Live data  |  Llama 3.3  |  ' + (loading ? 'Thinking...' : 'Ready')
          )
        ),
        React.createElement('button', {
          onClick: function() { setIsOpen(false); },
          style: {
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            cursor: 'pointer', borderRadius: 8, width: 30, height: 30, fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }
        }, '✕')
      ),

      // Messages area
      React.createElement('div', {
        style: {
          flex: 1, overflowY: 'auto', padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }
      },

        messages.map(function(msg, i) {
          var badge = msg.action ? getActionBadge(msg.action) : null;
          return React.createElement('div', {
            key: i,
            style: {
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              flexDirection: 'column',
              alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start',
              gap: 4,
            }
          },
            badge && React.createElement('div', {
              style: {
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                background: badge.color + '22', color: badge.color, border: '1px solid ' + badge.color + '44',
              }
            }, badge.text),
            React.createElement('div', {
              style: {
                maxWidth: '88%', padding: '10px 14px',
                borderRadius: msg.type === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                background: msg.type === 'user'
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : (msg.isError ? '#fee2e244' : 'var(--bg2)'),
                color: msg.type === 'user' ? 'white' : (msg.isError ? '#ef4444' : 'var(--text)'),
                border: msg.type === 'ai' ? '1px solid ' + (msg.isError ? '#fca5a544' : 'var(--border)') : 'none',
                fontSize: 13, wordBreak: 'break-word',
              }
            }, renderText(msg.text))
          );
        }),

        // Typing indicator
        loading && React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-start' } },
          React.createElement('div', {
            style: {
              padding: '10px 16px', borderRadius: '4px 16px 16px 16px',
              background: 'var(--bg2)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 4,
            }
          },
            React.createElement('div', { style: { fontSize: 13, color: 'var(--text-muted)' } }, 'Thinking'),
            React.createElement('div', {
              style: { display: 'flex', gap: 3, alignItems: 'center', marginLeft: 4 }
            },
              [0, 1, 2].map(function(j) {
                return React.createElement('div', {
                  key: j,
                  style: {
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'var(--accent)',
                    animation: 'pulse 1.2s ease-in-out ' + (j * 0.2) + 's infinite',
                    opacity: 0.7,
                  }
                });
              })
            )
          )
        ),

        React.createElement('div', { ref: messagesEndRef })
      ),

      // Quick action chips (show only at start)
      messages.length <= 1 && React.createElement('div', {
        style: {
          padding: '0 16px 12px',
          display: 'flex', flexWrap: 'wrap', gap: 6,
          flexShrink: 0,
        }
      },
        quickActions.map(function(q) {
          return React.createElement('button', {
            key: q.label,
            onClick: function() { handleCommand(q.label); },
            disabled: loading,
            style: {
              padding: '5px 12px', fontSize: 11.5, borderRadius: 20,
              background: 'var(--bg2)', border: '1px solid var(--border)',
              color: 'var(--text)', cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 5,
            },
            onMouseEnter: function(e) {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.color = '#6366f1';
            },
            onMouseLeave: function(e) {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            },
          }, q.icon + ' ' + q.label);
        })
      ),

      // Input row
      React.createElement('div', {
        style: {
          padding: '12px 16px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8, alignItems: 'flex-end',
          background: 'var(--bg)', flexShrink: 0,
        }
      },
        React.createElement('input', {
          ref: inputRef,
          value: input,
          onChange: function(e) { setInput(e.target.value); },
          onKeyDown: handleKey,
          placeholder: 'Ask anything about your projects...',
          disabled: loading,
          style: {
            flex: 1, padding: '10px 14px',
            border: '1px solid var(--border)', borderRadius: 12,
            background: 'var(--bg2)', color: 'var(--text)',
            fontSize: 13, outline: 'none',
            transition: 'border-color 0.15s',
          },
          onFocus: function(e) { e.target.style.borderColor = '#6366f1'; },
          onBlur: function(e) { e.target.style.borderColor = 'var(--border)'; },
        }),
        React.createElement('button', {
          onClick: function() { handleCommand(); },
          disabled: loading || !input.trim(),
          style: {
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: (input.trim() && !loading)
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'var(--bg2)',
            color: (input.trim() && !loading) ? 'white' : 'var(--text-muted)',
            border: '1px solid ' + ((input.trim() && !loading) ? 'transparent' : 'var(--border)'),
            cursor: (input.trim() && !loading) ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, transition: 'all 0.2s',
          }
        }, '➤')
      )
    )
  );
}
