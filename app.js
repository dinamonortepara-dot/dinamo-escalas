// ==========================================
// 1. CONFIGURAÇÃO DO SUPABASE
// ==========================================
const SUPABASE_URL = 'https://bdiliwltiftvboudnsq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__RZ132tr0ghZu4MvK8Mcig_6Kv9yApa';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. VARIÁVEIS GLOBAIS
// ==========================================
const hoje = new Date();
const anoAtual = hoje.getFullYear();
let mesAtual = hoje.getMonth() + 1;
let dadosGlobais = { equipes: [], tipos: [] };
let pendente = null; 
let confirmCallback = null;

// ==========================================
// 3. INICIALIZAÇÃO
// ==========================================
window.onload = function() { 
  criarBotoesMes(); 
  carregarTudo(); 
};

// Funções de UI (Interface)
function abrir(id) { document.getElementById(id).classList.add('show'); }
function fechar(id) { document.getElementById(id).classList.remove('show'); }
function nav(id) { 
  document.querySelectorAll('.content').forEach(c => c.classList.remove('active')); 
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active')); 
  document.getElementById(id).classList.add('active'); 
  event.currentTarget.classList.add('active'); 
  if (id === 'visaoGeral' && document.getElementById('filtroTipo').value) carregarVisaoGeral();
}

function criarBotoesMes() {
  const m = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const mesAtualNum = new Date().getMonth() + 1;
  document.getElementById('barraMeses').innerHTML = m.map((n,i) => {
    const isCurrentMonth = (i+1) === mesAtualNum;
    return `<button class="m-btn ${i+1==mesAtual?'active':''}" onclick="mudarMes(${i+1}, this)">
      ${n} ${isCurrentMonth ? '<span class="current-month-indicator">Atual</span>' : ''}
    </button>`;
  }).join('');
}

function mudarMes(m, el) { 
  mesAtual = m; 
  document.querySelectorAll('.m-btn').forEach(b => b.classList.remove('active')); 
  el.classList.add('active'); 
  carregarTudo(); 
}

// ==========================================
// 4. LÓGICA DE BANCO DE DADOS (SUPABASE)
// ==========================================

async function carregarTudo() {
  document.getElementById('statusArea').innerHTML = '<div class="loading-container"><div class="loader"></div><p>Sincronizando dados...</p></div>';
  
  try {
    // Busca os tipos de equipe únicos direto do Supabase
    const { data: equipesData, error } = await supabase
      .from('equipes')
      .select('tipo_equipe')
      .eq('status', 'ATIVO');

    if (error) throw error;

    // Extrai tipos únicos
    const tipos = [...new Set(equipesData.map(e => e.tipo_equipe))].sort();
    
    const sel = document.getElementById('filtroTipo');
    const valAtual = sel.value;
    sel.innerHTML = '<option value="">Selecione um Grupo de Equipes...</option>' + 
                    tipos.map(t => `<option value="${t}">${t}</option>`).join('');
    if(valAtual) sel.value = valAtual;
    
    await verificarStatusPainel(tipos);
    
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    document.getElementById('statusArea').innerHTML = `
      <div style='text-align:center;padding:40px;color:var(--danger)'>
        <p>Erro ao conectar com o banco de dados. Verifique o console.</p>
      </div>`; 
  }
}

async function verificarStatusPainel(tipos) {
  if(!tipos || !tipos.length) { 
    document.getElementById('statusArea').innerHTML = `
      <div style='text-align:center;padding:40px;color:#999'>
        <i class="fas fa-users" style="font-size:3rem; margin-bottom:15px; opacity:0.3"></i>
        <p>Nenhuma equipe cadastrada no banco de dados.</p>
      </div>`; 
    return; 
  }
  
  let html = '<div class="grid-cards">';
  
  for (let tipo of tipos) {
    const { data: estData } = await supabase
      .from('estruturas')
      .select('*')
      .eq('nome', tipo)
      .eq('mes', mesAtual)
      .eq('ano', anoAtual)
      .single();

    let definido = !!estData;
    let gerado = false; 

    let statusClass = gerado ? 'gerado' : (definido ? 'definido' : 'pendente');
    let statusIcon = gerado ? 'lock' : (definido ? 'check' : 'exclamation-triangle');
    let statusText = gerado ? 'Finalizado' : (definido ? 'Pronto para Gerar' : 'Configuração Pendente');
    let hr = estData ? `${estData.horario_inicio} às ${estData.horario_fim}` : 'Não definido';
    
    html += `
    <div class="st-card">
      <div class="st-header ${statusClass}">
        <div class="st-title"><i class="fas fa-${statusIcon}"></i> ${tipo}</div>
      </div>
      <div class="st-body">
        <div class="info-row"><i class="far fa-clock"></i> <span>${hr}</span></div>
        <div class="info-row"><i class="fas fa-info-circle"></i> <span>${statusText}</span></div>
      </div>
    </div>`;
  }
  
  document.getElementById('statusArea').innerHTML = html + '</div>';
}
