export function markdown(text){let d=document.createElement('div');d.textContent=text||'';return d.innerHTML.split('\n\n').map(x=>'<p>'+x.replace(/\n/g,'<br>')+'</p>').join('')}
