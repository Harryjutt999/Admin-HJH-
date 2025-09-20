// Paste your Supabase credentials here
const SUPABASE_URL = "https://apywqhvxuvhmznlefzyh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweXdxaHZ4dXZobXpubGVmenloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNDg0NDgsImV4cCI6MjA3MzkyNDQ0OH0.nQ2YylEtDMgPKG5lcESDK_q7YmIcRzvelogr-9nWo3o";

// This file exposes a simple helper `db` used by admin and user apps
(function(global){
  const { createClient } = supabase;
  const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  async function signInEmail(email){
    return await supa.auth.signInWithOtp({ email });
  }

  async function signOut(){
    return await supa.auth.signOut();
  }

  async function getUser(){
    const { data } = await supa.auth.getUser();
    return data.user;
  }

  // Tools CRUD
  async function listTools(){
    const { data, error } = await supa.from('tools').select('*').order('created_at', { ascending: false });
    if(error) throw error; return data;
  }

  async function createTool(obj){
    const { data, error } = await supa.from('tools').insert([obj]);
    if(error) throw error; return data[0];
  }

  async function updateTool(id, obj){
    const { data, error } = await supa.from('tools').update(obj).eq('id', id);
    if(error) throw error; return data[0];
  }

  async function deleteTool(id){
    const { error } = await supa.from('tools').delete().eq('id', id);
    if(error) throw error; return true;
  }

  global.db = {
    supa, signInEmail, signOut, getUser, listTools, createTool, updateTool, deleteTool
  };
})(window);
