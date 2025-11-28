/* calendar.js
   Usage: include on calendar.html and ensure loggedUser is set in localStorage
*/

(function(){
  const user = localStorage.getItem('loggedUser') || 'guest';
  const storageKey = `calendarTasks_${user}`;

  // DOM hooks (calendar.html should have containers with these IDs)
  const calWrap = document.getElementById('calendarWrap') || document.getElementById('calendar');
  const tasksList = document.getElementById('calendarTaskList') || document.getElementById('taskList');

  // state
  let today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth(); // 0-11

  // load saved tasks
  let saved = JSON.parse(localStorage.getItem(storageKey) || '{}');

  function saveAll(){ localStorage.setItem(storageKey, JSON.stringify(saved)); }

  // helpers
  function monthKey(y,m,d){ return `${y}-${(m+1).toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`; }

  // render header + grid
  function renderCalendar() {
    if(!calWrap) return;
    calWrap.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'cal-header card';
    header.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center;">
        <button id="prevMonth" class="btn ghost">&lt;</button>
        <div style="min-width:200px;text-align:center;"><strong style="font-size:16px">${new Date(viewYear,viewMonth).toLocaleString(undefined,{month:'long', year:'numeric'})}</strong></div>
        <button id="nextMonth" class="btn ghost">&gt;</button>
      </div>
    `;
    calWrap.appendChild(header);

    // grid
    const grid = document.createElement('div');
    grid.className = 'cal-grid card';
    // week labels
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(w=>{
      const el = document.createElement('div');
      el.className='day';
      el.style.fontWeight='700';
      el.style.minHeight='auto';
      el.style.padding='6px';
      el.textContent = w;
      grid.appendChild(el);
    });

    // determine leading blanks
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();

    // add blanks
    for(let i=0;i<firstDay;i++){
      const blank = document.createElement('div');
      blank.className='day';
      blank.style.opacity=0.4;
      grid.appendChild(blank);
    }

    // add days
    for(let d=1; d<=daysInMonth; d++){
      const dtEl = document.createElement('div');
      dtEl.className='day';
      const num = document.createElement('div'); num.className='dateNum'; num.textContent = d;
      dtEl.appendChild(num);

      // check tasks for this date
      const key = monthKey(viewYear, viewMonth, d);
      const items = saved[key] || [];
      if(items.length){
        dtEl.classList.add('has-task');
        const dots = document.createElement('div'); dots.className='dots';
        // show up to 3 dots colored by priority
        items.slice(0,3).forEach(it=>{
          const dot = document.createElement('span');
          dot.className = 'dot ' + (it.priority === 'high'? 'red' : it.priority === 'medium' ? 'yellow' : it.priority === 'low' ? 'green' : 'blue');
          dots.appendChild(dot);
        });
        dtEl.appendChild(dots);
      }

      // click to add/view tasks
      dtEl.addEventListener('click', ()=> openDayModal(viewYear, viewMonth, d) );

      grid.appendChild(dtEl);
    }

    calWrap.appendChild(grid);

    // attach prev/next
    document.getElementById('prevMonth').onclick = ()=> { viewMonth--; if(viewMonth<0){ viewMonth=11; viewYear--; } renderCalendar(); renderTaskList(); };
    document.getElementById('nextMonth').onclick = ()=> { viewMonth++; if(viewMonth>11){ viewMonth=0; viewYear++; } renderCalendar(); renderTaskList(); };

    renderTaskList();
  }

  // show list of tasks for the whole month on right side
  function renderTaskList(){
    if(!tasksList) return;
    tasksList.innerHTML = '';
    const title = document.createElement('div'); title.className='card'; title.innerHTML=`<strong>Tasks in ${(new Date(viewYear,viewMonth)).toLocaleString(undefined,{month:'long', year:'numeric'})}</strong>`;
    tasksList.appendChild(title);

    // gather all tasks for this month
    for(let d=1; d<= new Date(viewYear, viewMonth+1, 0).getDate(); d++){
      const key = monthKey(viewYear, viewMonth, d);
      const arr = saved[key] || [];
      arr.forEach((it,i)=>{
        const el = document.createElement('div'); el.className='card';
        el.style.marginBottom='8px';
        el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;">
            <div><strong>${it.title}</strong><div style="font-size:13px;color:var(--muted)">${viewYear}-${(viewMonth+1).toString().padStart(2,'0')}-${d.toString().padStart(2,'0')} • ${it.description || ''}</div></div>
            <div><button class="btn ghost" data-key="${key}" data-index="${i}">Edit</button></div>
          </div>`;
        tasksList.appendChild(el);
      });
    }

    // attach edit buttons
    tasksList.querySelectorAll('button[data-key]').forEach(btn=>{
      btn.onclick = (ev)=>{
        const key = btn.dataset.key; const index = Number(btn.dataset.index);
        openEditModal(key, index);
      };
    });
  }

  // modal for adding a task to date
  function openDayModal(y,m,d){
    const dateKey = monthKey(y,m,d);

    const existing = saved[dateKey] || [];

    const title = prompt(`Add a task for ${dateKey}\n(Leave blank to cancel)\n\nFormat: Title | description | priority(high/medium/low)`, '');
    if(!title) return;

    // parse simple pipe separated input for UX speed
    const parts = title.split('|').map(s=>s.trim());
    const obj = { title: parts[0] || 'Task', description: parts[1] || '', priority: parts[2] || 'normal', created: new Date().toISOString() };

    saved[dateKey] = existing.concat(obj);
    saveAll();
    renderCalendar();
    renderTaskList();
  }

  // edit modal - simple prompt
  function openEditModal(key,index){
    const arr = saved[key] || [];
    const item = arr[index];
    if(!item) return;
    const newVal = prompt(`Edit task (format: title | desc | priority)\nCurrent: ${item.title} | ${item.description} | ${item.priority}`, `${item.title} | ${item.description} | ${item.priority}`);
    if(!newVal) return;
    const parts = newVal.split('|').map(s=>s.trim());
    item.title = parts[0] || item.title;
    item.description = parts[1] || item.description;
    item.priority = parts[2] || item.priority;
    saveAll();
    renderCalendar();
    renderTaskList();
  }

  // initial render
  renderCalendar();

  // expose helpers for debugging
  window.calendarReload = ()=>{ saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); renderCalendar(); renderTaskList(); };

})();
