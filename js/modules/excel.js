// ==========================================
// MÓDULO EXCEL - Importação e Exportação
// ==========================================
import { supabase } from '../config/database.js';

// Variável temporária de segurança (Simula o Login)
// Quando o Módulo Auth estiver pronto, isso será dinâmico.
const USUARIO_LOGADO = {
  nome: "Administrador Sistema",
  nivel_acesso: "admin" // Mude para 'coordenador' no futuro para testar o bloqueio
};

export function iniciarModuloExcel() {
  const btnUpload = document.getElementById('btnUploadExcel');
  
  // Cria dinamicamente o botão de Download na tela para os outros usuários
  const filterContainer = document.querySelector('#gestaoEquipes .filter-container');
  if (filterContainer && !document.getElementById('btnDownloadExcel')) {
    const btnDownload = document.createElement('button');
    btnDownload.className = 'btn-sec';
    btnDownload.id = 'btnDownloadExcel';
    btnDownload.innerHTML = '<i class="fas fa-file-download"></i> Baixar Estrutura';
    filterContainer.appendChild(btnDownload);
    
    // Todos podem baixar
    btnDownload.addEventListener('click', baixarExcel);
  }

  // Regra de Negócio: Apenas Admin faz Upload
  if (btnUpload) {
    btnUpload.addEventListener('click', () => {
      if (USUARIO_LOGADO.nivel_acesso !== 'admin') {
        alert('Acesso Restrito: Apenas administradores podem atualizar a base de equipes.');
        return;
      }
      
      // Abre a janela do computador para escolher o arquivo
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
  // Aqui vai entrar a lógica da biblioteca SheetJS para ler as colunas
  alert(`Arquivo "${file.name}" selecionado com sucesso!\nA leitura das colunas será conectada aqui no próximo passo.`);
}

async function baixarExcel() {
  alert('Iniciando o download da estrutura de equipes e colaboradores...');
  // Aqui entrará a lógica para pegar os dados do Supabase e gerar um Excel novo
}
