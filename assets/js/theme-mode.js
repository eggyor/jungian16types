(function () {
  var button = document.querySelector('[data-theme-toggle]');
  if (!button) return;
  var label = button.querySelector('[data-theme-label]');
  function setTheme(theme, persist) {
    var isNight = theme === 'night';
    document.documentElement.setAttribute('data-theme', isNight ? 'night' : 'light');
    button.setAttribute('aria-label', isNight ? '切換日間模式' : '切換夜間模式');
    button.setAttribute('aria-pressed', isNight ? 'true' : 'false');
    button.setAttribute('title', isNight ? '切換日間模式' : '切換星夜模式');
    if (label) label.textContent = isNight ? '日間模式' : '夜間模式';
    if (persist) {
      try { localStorage.setItem('jungian16-theme', isNight ? 'night' : 'light'); } catch (e) {}
    }
  }
  setTheme(document.documentElement.getAttribute('data-theme'), false);
  button.addEventListener('click', function () {
    setTheme(document.documentElement.getAttribute('data-theme') === 'night' ? 'light' : 'night', true);
  });
})();
