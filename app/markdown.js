export function renderMarkdown(host,text){host.innerHTML=esc(text).split('\n\n').map(p=>p.startsWith('#')?'<h3>'+p.replace(/^#+ /,'')+'</h3>':'<p>'+p.replaceAll('\n','<br>')+'</p>').join('')}
import {esc} from './api.js';
