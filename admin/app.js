// Supabase init
const SUPABASE_URL = "https://apywqhvxuvhmznlefzyh.supabase.co";   // apna supabase project URL
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweXdxaHZ4dXZobXpubGVmenloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNDg0NDgsImV4cCI6MjA3MzkyNDQ0OH0.nQ2YylEtDMgPKG5lcESDK_q7YmIcRzvelogr-9nWo3o";                     // apna anon public key

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// wrapper functions (db object jaisa)
const db = {
  supa: supabase,
  async signInEmail(email) {
    return await supabase.auth.signInWithOtp({ email });
  },
  async signOut() {
    return await supabase.auth.signOut();
  },
  async listTools() {
    const { data, error } = await supabase.from("tools").select("*");
    if (error) throw error;
    return data;
  },
  async createTool(obj) {
    const { error } = await supabase.from("tools").insert([obj]);
    if (error) throw error;
  },
  async updateTool(id, obj) {
    const { error } = await supabase.from("tools").update(obj).eq("id", id);
    if (error) throw error;
  },
  async deleteTool(id) {
    const { error } = await supabase.from("tools").delete().eq("id", id);
    if (error) throw error;
  }
};

const signinBtn = document.getElementById('signin');
const signoutBtn = document.getElementById('signout');
const emailInput = document.getElementById('email');
const userInfo = document.getElementById('userInfo');
const toolsList = document.getElementById('toolsList');
const newToolBtn = document.getElementById('newTool');
const toolForm = document.getElementById('toolForm');
const saveBtn = document.getElementById('save');
const cancelBtn = document.getElementById('cancel');
const toolsSection = document.getElementById('toolsSection');

let editingId = null;

// helper: show/hide tools
function showToolsUI(user) {
  if (user) {
    toolsSection.style.display = "block";
    toolForm.style.display = "none";
  } else {
    toolsSection.style.display = "none";
    toolForm.style.display = "none";
  }
}

async function refreshTools() {
  toolsList.innerHTML = 'Loading...';
  try {
    const tools = await db.listTools();
    toolsList.innerHTML = '';
    tools.forEach(t => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${t.title}</strong> ${t.active ? '<em>(active)</em>' : ''}<br>${t.description || ''}<br><a href="${t.url}" target="_blank">Open</a> `;
      const edit = document.createElement('button'); edit.textContent = 'Edit';
      edit.onclick = () => openEdit(t);
      const del = document.createElement('button'); del.textContent = 'Delete';
      del.onclick = async () => { if (confirm('Delete?')) { await db.deleteTool(t.id); refreshTools(); } };
      li.appendChild(edit); li.appendChild(del);
      toolsList.appendChild(li);
    })
  } catch (e) { toolsList.innerHTML = 'Error: ' + e.message }
}

function openEdit(t) {
  editingId = t.id;
  document.getElementById('title').value = t.title;
  document.getElementById('url').value = t.url || '';
  document.getElementById('description').value = t.description || '';
  document.getElementById('active').checked = !!t.active;
  toolForm.style.display = 'block';
}

newToolBtn.onclick = () => {
  editingId = null;
  document.getElementById('title').value = '';
  document.getElementById('url').value = '';
  document.getElementById('description').value = '';
  document.getElementById('active').checked = true;
  toolForm.style.display = 'block';
}

cancelBtn.onclick = () => { toolForm.style.display = 'none'; }

saveBtn.onclick = async () => {
  const obj = {
    title: document.getElementById('title').value,
    url: document.getElementById('url').value,
    description: document.getElementById('description').value,
    active: document.getElementById('active').checked
  };
  if (!obj.title) { alert('Title required'); return; }
  try {
    if (editingId) await db.updateTool(editingId, obj);
    else await db.createTool(obj);
    toolForm.style.display = 'none';
    await refreshTools();
  } catch (e) { alert('Error ' + e.message) }
}

signinBtn.onclick = async () => {
  const email = emailInput.value.trim();
  if (!email) return alert('Enter email');
  await db.signInEmail(email);
  alert('Check your email for a magic link');
}

signoutBtn.onclick = async () => { await db.signOut(); location.reload(); }

// initialize
(async function () {
  const { data: { user } } = await db.supa.auth.getUser();
  if (user) {
    userInfo.textContent = 'Signed in: ' + user.email;
    signoutBtn.style.display = 'inline-block';
    showToolsUI(user);
    refreshTools();
  } else {
    showToolsUI(null);
  }
})();
