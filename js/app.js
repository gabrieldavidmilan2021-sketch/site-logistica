const KEY='minha_loja_personalizados_v1';
let DATA=Object.assign({vendas:[],gastos:[],investimentos:[],tarefas:[],produtos:[]},{});
let DATA_READY=false;

function normalizeData(d){
  const base={vendas:[],gastos:[],investimentos:[],tarefas:[],produtos:[]};
  const source=d&&typeof d==='object'?d:{};
  const normalized={...source};
  Object.keys(base).forEach(key=>{normalized[key]=Array.isArray(source[key])?source[key]:[]});
  return normalized;
}
function getData(){ return DATA; }

function loadData(){
  try{
    DATA=normalizeData(JSON.parse(localStorage.getItem(KEY)||'{}'));
  }catch(_){ DATA=normalizeData({}); }
  DATA_READY=true;
  window.dispatchEvent(new Event('dataReady'));
}
function saveData(d){
  DATA=normalizeData(d);
  localStorage.setItem(KEY,JSON.stringify(DATA));
  return Promise.resolve();
}
function brl(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2)}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function imagePreview(src){return src?`<img class="thumb" src="${esc(src)}" alt="Foto">`:'<span class="no-photo">—</span>'}
async function downloadBackup(){
  const data=normalizeData(getData());
  const backup={version:1,createdAt:new Date().toISOString(),data};
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
function formatRecordDate(date){return date?new Date(date+'T12:00').toLocaleDateString('pt-BR'):'Sem data'}
function rowsGroupedByDate(items,columns,row){
  let lastDate;
  return items.map(item=>{
    const date=item.data||'';
    const divider=date!==lastDate?`<tr class="date-divider"><td colspan="${columns}"><span>${formatRecordDate(date)}</span></td></tr>`:'';
    lastDate=date;
    return divider+row(item);
  }).join('');
}
function monthLabel(date){
  if(!date)return 'Sem mês';
  const parsed=new Date(date+'T12:00');
  return Number.isNaN(parsed.getTime())?'Sem mês':parsed.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
}
function rowsGroupedByMonth(items,columns,row){
  let lastMonth;
  return items.map(item=>{
    const month=item.data?item.data.slice(0,7):'';
    const divider=month!==lastMonth?`<tr class="date-divider month-divider"><td colspan="${columns}"><span>${monthLabel(item.data)}</span></td></tr>`:'';
    lastMonth=month;
    return divider+row(item);
  }).join('');
}
function ensureTasksLink(){
  const nav=document.querySelector('.sidebar nav');
  if(nav&&location.pathname.includes('/pages/')&&!nav.querySelector('a[href="tarefas.html"]')){
    const link=document.createElement('a');
    link.href='tarefas.html';
    link.textContent='✅ Tarefas';
    nav.appendChild(link);
  }
}
ensureTasksLink();
window.addEventListener('dataReady',()=>{if(typeof renderDashboard==='function') renderDashboard(); if(typeof render==='function') render(); if(typeof renderTasks==='function') renderTasks(); if(typeof renderProducts==='function') renderProducts();});
loadData();
