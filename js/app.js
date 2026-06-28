// ==========================================
// O MAESTRO (app.js) - Controla a Interface
// ==========================================

import { supabase } from './config/database.js';
import { iniciarModuloExcel } from './modules/excel.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("Sistema Dínamo iniciado com sucesso!");
  
  iniciarNavegacaoAbas();
  criarBotoesMes();
  
  // Liga o módulo de importação/exportação
  iniciarModuloExcel();
});

// ==========================================
// 1. CONTROLE DAS ABAS (Navegação)
// ==========================================
function iniciarNavegacaoAbas() {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

// ==========================================
// 2. BARRA DE MESES
// ==========================================
function criarBotoesMes() {
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  
  const dataAtual = new Date();
  const mesAtualNum = dataAtual.getMonth() + 1;
  let mesSelecionado = mesAtualNum;

  const barra = document.getElementById('barraMeses');
  if (!barra) return;

  barra.innerHTML = meses.map((nomeMes, index) => {
    const numMes = index + 1;
    const isCurrentMonth = numMes === mesAtualNum;
    return `<button class="m-btn ${numMes === mesSelecionado ? 'active' : ''}" data-mes="${numMes}">
      ${nomeMes} ${isCurrentMonth ? '<span class="current-month-indicator">Atual</span>' : ''}
    </button>`;
  }).join('');

  const botoesMes = barra.querySelectorAll('.m-btn');
  botoesMes.forEach(btn => {
    btn.addEventListener('click', (e) => {
      botoesMes.forEach(b => b.classList.remove('active'));
      
      const btnClicado = e.currentTarget;
      btnClicado.classList.add('active');
      mesSelecionado = btnClicado.getAttribute('data-mes');
    });
  });
}
