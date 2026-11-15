export function renderMarkdown(value = '') {
  const escape = text => text.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
  return String(value).split(/\n\n+/).map(block => {
    const heading = block.match(/^#{1,3}\s+(.+)$/);
    const content = escape(heading ? heading[1] : block).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    return heading ? `<h3>${content}</h3>` : `<p>${content}</p>`;
  }).join('');
}
