// ==========================================
// MÓDULO EXCEL - Importação e Exportação
// ==========================================
import { supabase } from '../config/database.js';

// Variável temporária de segurança (Simula o Login de Coordenador/Admin)
const USUARIO_LOGADO = {
  nome: "Administrador Sistema",
  nivel_acesso: "admin" 
};

export function iniciarModuloExcel() {
  const btnUpload = document.getElementById('btnUploadExcel');
  const filterContainer = document.querySelector('#gestaoEquipes .filter-container');
  
  // Cria dinamicamente o botão de Download
  if (filterContainer && !document.getElementById('btnDownloadExcel')) {
    const btnDownload = document.createElement('button');
    btnDownload.className = 'btn-sec';
    btnDownload.id = 'btnDownloadExcel';
    btnDownload.innerHTML = '<i class="fas fa-file-download"></i> Baixar Estrutura';
    filterContainer.appendChild(btnDownload);
    
    btnDownload.addEventListener('click', baixarExcel);
  }

  // Lógica do botão de Upload
  if (btnUpload) {
    btnUpload.addEventListener('click', () => {
      if (USUARIO_LOGADO.nivel_acesso !== 'admin') {
        alert('Acesso Restrito: Apenas administradores podem atualizar a base de equipes.');
        return;
      }
      
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx, .xls, .csv';
      
      input.onchange = (e) => {
        const arquivo = e.target.files[0];
        if (arquivo) processarArquivo(arquivo);
      };
      
      input.click();
    });
  }
}

async function processarArquivo(file) {
  const areaEquipes = document.getElementById('areaEquipes');
  
  // 1. Feedback visual para o usuário
  areaEquipes.innerHTML = `
    <div style="text-align:center; padding: 40px; color: var(--primary);">
      <i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; margin-bottom: 15px;"></i>
      <p>Lendo a planilha <b>${file.name}</b>, aguarde...</p>
    </div>
  `;

  // 2. Motor de leitura do arquivo físico
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      // Pega o arquivo e passa para o leitor de Excel
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Lê apenas a primeira aba do Excel
      const primeiraAba = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[primeiraAba];
      
      // Converte a aba para uma lista de dados que o Javascript entende (JSON)
      const dadosPlanilha = XLSX.utils.sheet_to_json(worksheet);

      if (dadosPlanilha.length === 0) {
        throw new Error("A planilha parece estar vazia.");
      }

      // Mostra o sucesso na tela
      areaEquipes.innerHTML = `
        <div style="background: var(--status-work-bg); color: var(--status-work-text); padding: 25px; border-radius: 12px; border: 1px solid var(--status-work-border);">
          <h3 style="margin-bottom: 10px;"><i class="fas fa-check-circle"></i> Leitura Concluída!</h3>
          <p>Foram encontradas <b>${dadosPlanilha.length}</b> linhas na sua planilha.</p>
          <p style="margin-top: 15px; font-size: 0.9rem; color: var(--text-secondary);">
            Agora precisamos mapear essas colunas para salvar no Supabase de forma segura.
          </p>
        </div>
      `;

      // Joga os dados "crus" no console para podermos inspecionar a estrutura real
      console.log("🔎 [INSPEÇÃO] Dados extraídos do Excel:", dadosPlanilha);

    } catch (erro) {
      console.error("Erro ao ler Excel:", erro);
      areaEquipes.innerHTML = `
        <div style="background: var(--danger-light); color: var(--danger); padding: 20px; border-radius: 8px; border: 1px solid var(--danger-light);">
          <h3><i class="fas fa-exclamation-triangle"></i> Falha na Leitura</h3>
          <p>Não foi possível processar este arquivo. Verifique se o formato está correto.</p>
        </div>
      `;
    }
  };

  // Inicia a leitura de fato
  reader.readAsArrayBuffer(file);
}

async function baixarExcel() {
  alert('Iniciando o download... Em breve conectaremos isso ao banco de dados.');
}
