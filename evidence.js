/* evidence.js */
(function(){
  const user = localStorage.getItem('loggedUser') || 'guest';
  const key = `notes_${user}`;
  const board = document.getElementById('boardArea');
  const addBtn = document.getElementById('addStickyBtn');

  let notes = JSON.parse(localStorage.getItem(key) || '[]');

  function save(){ localStorage.setItem(key, JSON.stringify(notes)); }

  function render(){
    board.innerHTML = '';
    notes.forEach((n, idx)=>{
      const el = document.createElement('div');
      el.className = 'sticky ' + (n.color||'blue');
      el.style.left = n.x || 'auto';
      el.style.top = n.y || 'auto';
      el.style.position = 'relative';
      el.draggable = true;
      el.innerHTML = `<button class="remove" data-idx="${idx}">✕</button>
                      <div class="content">${escapeHtml(n.text)}</div>`;
      board.appendChild(el);

      // events
      el.querySelector('.remove').onclick = (e)=> {
        e.stopPropagation();
        notes.splice(idx,1); save(); render();
      };

      // edit on double click
      el.ondblclick = ()=> {
        const newText = prompt('Edit note text:', n.text);
        if(newText !== null){ n.text = newText; save(); render(); }
      };

      // drag
      el.addEventListener('dragstart', ev=>{
        ev.dataTransfer.setData('text/plain', idx);
        setTimeout(()=> el.style.opacity=0.5, 10);
      });
      el.addEventListener('dragend', ev=>{
        el.style.opacity=1;
      });
    });
  }

  // board drop handling: reorder notes by receiving index from drag
  board.addEventListener('dragover', ev => ev.preventDefault());
  board.addEventListener('drop', ev => {
    ev.preventDefault();
    const fromIdx = Number(ev.dataTransfer.getData('text/plain'));
    const rect = board.getBoundingClientRect();
    const x = Math.max(0, ev.clientX - rect.left - 10);
    const y = Math.max(0, ev.clientY - rect.top - 10);

    // set new position onto the note and save
    notes[fromIdx].x = x + 'px';
    notes[fromIdx].y = y + 'px';
    save(); render();
  });

  addBtn.onclick = () => {
    const text = prompt('Add a new note:','New note');
    if(!text) return;
    const note = { text, color:'blue', x:'auto', y:'auto', created:Date.now() };
    notes.push(note); save(); render();
  };

  // simple escape for HTML
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // initial render
  render();

  // expose for debugging
  window.notesSave = save; window.notesLoad = ()=>{ notes = JSON.parse(localStorage.getItem(key) || '[]'); render(); };

})();
