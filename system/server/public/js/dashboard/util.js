function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function parseTerminalColors(input) { // eslint-disable-line
  return stripHtml(input)
    .replace(/\[1m/g, '<strong>')
    .replace(/\[22m/g, '</strong>')
    .replace(/\[33m/g, '<span class="text-warning">')
    .replace(/\[31m/g, '<span class="text-danger">')
    .replace(/\[32m/g, '<span class="text-success">')
    .replace(/\[36m/g, '<span class="text-info">')
    .replace(/\[35m/g, '<span class="text-primary">')
    .replace(/\[39m/g, '</span>');
}
