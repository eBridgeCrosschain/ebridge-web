import { Themes } from 'constants/theme';
export function getThemes() {
  const html = window.document.getElementsByTagName('html')[0];
  return html.getAttribute('data-theme');
}
export function setThemes(theme: keyof typeof Themes) {
  const html = window.document.getElementsByTagName('html')[0];
  const cTheme = getThemes();
  if (cTheme !== theme) html.setAttribute('data-theme', theme);
}
