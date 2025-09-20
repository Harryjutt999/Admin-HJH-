// admin/app.js
const signinBtn = document.getElementById('signin');
const signoutBtn = document.getElementById('signout');
const emailInput = document.getElementById('email');
const userInfo = document.getElementById('userInfo');
const toolsList = document.getElementById('toolsList');
const newToolBtn = document.getElementById('newTool');
const toolForm = document.getElementById('toolForm');
const saveBtn = document.getElementById('save');
const cancelBtn = document.getElementById('cancel');

let editingId = null;

async function refreshTools(){
  toolsList.innerHTML = 'Loading...';
  try{
    const tools = await db.listTools();
    toolsList.innerHTML = '';
    tools.forEach(t=>{
      const li = document.createElement('li');
      li.innerHTML = `<strong>${t.title}</strong> ${t.active?'<em>(active)</em>':''}<br>${t.description||''}<br><a href="${t.url}" target="_blank">Open</a> `;
      const edit = document.createElement('button'); edit.textContent='Edit';
      edit.onclick = ()=>openEdit(t);
      const del = document.createElement('button'); del.textContent='Delete';
      del.onclick = async ()=>{ if(confirm('Delete?')){ await db.deleteTool(t.id); refreshTools(); } };
      li.appendChild(edit); li.appendChild(del);
      toolsList.appendChild(li);
    })
  }catch(e){ toolsList.innerHTML = 'Error: '+e.message }
}

function openEdit(t){
  editingId = t.id;
  document.getElementById('title').value = t.title;
  document.getElementById('url').value = t.url||'';
  document.getElementById('description').value = t.description||'';
  document.getElementById('active').checked = !!t.active;
  toolForm.style.display = 'block';
}

newToolBtn.onclick = ()=>{ editingId=null; document.getElementById('title').value=''; document.getElementById('url').value=''; document.getElementById('description').value=''; document.getElementById('active').checked=true; toolForm.style.display='block'; }

cancelBtn.onclick = ()=>{ toolForm.style.display='none'; }

saveBtn.onclick = async ()=>{
  const obj = {
    title: document.getElementById('title').value,
    url: document.getElementById('url').value,
    description: document.getElementById('description').value,
    active: document.getElementById('active').checked
  };
  if(!obj.title){ alert('Title required'); return; }
  try{
    if(editingId) await db.updateTool(editingId, obj);
    else await db.createTool(obj);
    toolForm.style.display='none';
    await refreshTools();
  }catch(e){ alert('Error '+e.message) }
}

signinBtn.onclick = async ()=>{
  const email = emailInput.value.trim();
  if(!email) return alert('Enter email');
  await db.signInEmail(email);
  alert('Check your email for a magic link');
}

signoutBtn.onclick = async ()=>{ await db.signOut(); location.reload(); }

// initialize
(async function(){
  // show current user
  const u = await db.supa.auth.getUser();
  if(u.data.user){
    userInfo.textContent = 'Signed in: '+u.data.user.email;
    signoutBtn.style.display='inline-block';
    document.getElementById('auth').style.display='block';
  }
  refreshTools();
})();
