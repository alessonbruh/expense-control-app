(function () {
  var theme = null;
  try {
    theme = localStorage.getItem('theme');
  } catch (e) {}
  var dark = theme
    ? theme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.classList.add('dark');
})();
