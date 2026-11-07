// Keyboard shortcuts for the analytics dashboard: Alt+1 opens the first panel,
// Alt+2 the second, and so on up to Alt+9. Part of the dashboard's older script
// bundle, which is why it is written in the older style.

var MAX_SHORTCUTS = 9;

export function createDashboard(panels) {
  var state = { open: null, history: [] };

  function open(panel) {
    if (state.open === panel.id) {
      return;
    }
    state.open = panel.id;
    state.history.push(panel.id);
  }

  var shortcuts = {};
  for (var i = 0; i < panels.length && i < MAX_SHORTCUTS; i++) {
    var panel = panels[i];
    shortcuts['Alt+' + (i + 1)] = function () {
      open(panel);
    };
  }

  return {
    press: function (key) {
      var handler = shortcuts[key];
      if (!handler) {
        return false;
      }
      handler();
      return true;
    },
    openPanel: function () {
      return state.open;
    },
    history: function () {
      return state.history.slice();
    },
  };
}

// The cheat sheet shown when the user presses "?".
export function describeShortcuts(panels) {
  var lines = [];
  for (var i = 0; i < panels.length && i < MAX_SHORTCUTS; i++) {
    lines.push('Alt+' + (i + 1) + '  ' + panels[i].title);
  }
  return lines;
}
