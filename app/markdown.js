export function markdown(s=''){return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])).split('\n\n').map(p=>'<p>'+p+'</p>').join('')}
