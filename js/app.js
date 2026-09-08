const KEY='minha_loja_personalizados_v1';
const SERVER_KEY='minha_loja_ultimo_servidor_v1';
let DATA=Object.assign({vendas:[],gastos:[],investimentos:[],tarefas:[],produtos:[]},{});
let DATA_READY=false;
let SAVE_QUEUE=Promise.resolve();

function normalizeData(d){
  const base={vendas:[],gastos:[],investimentos:[],tarefas:[],produtos:[]};
  const source=d&&typeof d==='object'?d:{};
  Object.keys(base).forEach(key=>{base[key]=Array.isArray(source[key])?source[key]:[]});
  return base;
}
function getData(){ return DATA; }

async function loadData(){
  try{
    const r=await fetch('/api/data',{cache:'no-store'});
    if(!r.ok) throw new Error('API indisponível');
    const serverData=normalizeData(await r.json());
    const localData=normalizeData(JSON.parse(localStorage.getItem(KEY)||'{}'));
    const previousServer=normalizeData(JSON.parse(localStorage.getItem(SERVER_KEY)||'{}'));
    const serverIsEmpty=Object.values(serverData).every(items=>items.length===0);
    const localHasData=Object.values(localData).some(items=>items.length>0);
    const previousServerWasEmpty=Object.values(previousServer).every(items=>items.length===0);
    const migratedLocalData=serverIsEmpty&&localHasData&&previousServerWasEmpty;
    DATA=migratedLocalData?localData:serverData;
    localStorage.setItem(SERVER_KEY,JSON.stringify(DATA));
    if(migratedLocalData) saveData(DATA);
    DATA_READY=true;
    window.dispatchEvent(new Event('dataReady'));
  }catch(e){
    // Fallback para os dados antigos salvos neste navegador.
    try{ DATA=normalizeData(JSON.parse(localStorage.getItem(KEY)||'{}')); }catch(_){ DATA=normalizeData({}); }
    DATA_READY=true;
    window.dispatchEvent(new Event('dataReady'));
    console.warn('Servidor não disponível; usando armazenamento local.',e);
  }
}
function saveData(d){
  DATA=normalizeData(d);
  const snapshot=JSON.stringify(DATA);
  localStorage.setItem(KEY,snapshot);
  SAVE_QUEUE=SAVE_QUEUE.then(()=>fetch('/api/data',{method:'POST',headers:{'Content-Type':'application/json'},body:snapshot}))
    .then(response=>{if(!response.ok) throw new Error('Servidor recusou os dados'); localStorage.setItem(SERVER_KEY,snapshot); return response})
    .catch(e=>console.warn('Não foi possível sincronizar com o servidor.',e));
  return SAVE_QUEUE;
}
function brl(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2)}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function imagePreview(src){return src?`<img class="thumb" src="${esc(src)}" alt="Foto">`:'<span class="no-photo">—</span>'}
function downloadBackup(){
  const backup={version:1,createdAt:new Date().toISOString(),data:normalizeData(getData())};
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  const link=document.createElement('a');
  link.href=URL.createObjectURL(blob);
  link.download='backup-minha-loja-'+new Date().toISOString().slice(0,10)+'.json';
  link.click();
  URL.revokeObjectURL(link.href);
}
async function restoreBackup(input){
  const file=input.files[0];
  input.value='';
  if(!file)return;
  if(prompt('Digite a senha para restaurar o backup:')!=='812799'){alert('Senha incorreta.');return}
  try{
    const content=JSON.parse(await file.text());
    const restored=normalizeData(content.data||content);
    const total=Object.values(restored).reduce((sum,items)=>sum+items.length,0);
    if(!confirm('Restaurar '+total+' registros? Os dados atuais serão substituídos.'))return;
    await saveData(restored);
    alert('Backup restaurado com sucesso.');
    location.reload();
  }catch(error){alert('Não foi possível ler este arquivo de backup.')}
}
function clearAll(){
  if(prompt('Digite a senha novamente para apagar TODOS os dados da loja:')!=='812799'){
    alert('Senha incorreta. Os dados não foram apagados.');
    return;
  }
  if(confirm('Apagar TODOS os dados desta loja? Esta ação não pode ser desfeita.')){
    saveData(normalizeData({})); location.reload();
  }
}
function renderDashboard(){
 const d=getData(), sums={};
 ['vendas','gastos','investimentos'].forEach(k=>{
   sums[k]=d[k].reduce((a,x)=>a+Number(x.valor||0),0);
   const el=document.getElementById(k), qtd=document.getElementById(k+'Qtd');
   if(el) el.textContent=brl(sums[k]);
   if(qtd) qtd.textContent=d[k].length+' registro(s)';
 });
 const lucro=document.getElementById('lucro');
 if(lucro) lucro.textContent=brl(sums.vendas-sums.gastos-sums.investimentos);
 const summary=document.getElementById('summary');
 if(summary) summary.innerHTML=`<div class="summary-row"><span>Receita de vendas</span><b>${brl(sums.vendas)}</b></div><div class="summary-row"><span>Total de gastos</span><b>${brl(sums.gastos)}</b></div><div class="summary-row"><span>Total investido</span><b>${brl(sums.investimentos)}</b></div><div class="summary-row total"><span>Resultado líquido</span><b>${brl(sums.vendas-sums.gastos-sums.investimentos)}</b></div>`;
}
function productName(id){const p=getData().produtos.find(x=>x.id===id);return p?p.nome:''}
window.addEventListener('dataReady',()=>{if(typeof renderDashboard==='function') renderDashboard(); if(typeof render==='function') render(); if(typeof renderTasks==='function') renderTasks(); if(typeof renderProducts==='function') renderProducts();});
loadData();
