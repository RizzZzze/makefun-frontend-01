export function renderMarkdown(value='') { return value.split(/\n\n+/).map(p => `<p>${p.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</p>`).join(''); }
