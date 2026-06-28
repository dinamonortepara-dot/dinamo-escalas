// ==========================================
// MÓDULO EXCEL - Importação de Equipes
// ==========================================
import { supabase } from '../config/database.js';

const USUARIO_LOGADO = {
  nome: "Administrador Sistema",
  nivel_acesso: "admin" 
};

export function iniciarModuloExcel() {
  const btnUpload = document.getElementById('btnUploadExcel');
  
  if (btnUpload) {
    btnUpload.addEventListener('click', () => {
      if (USUARIO_LOGADO.nivel_acesso !== 'admin') {
        alert('Acesso Restrito: Apenas administradores podem atualizar a base.');
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
  
  areaEquipes.innerHTML = `
    <div style="text-align:center; padding: 40px; color: var(--primary);">
      <i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; margin-bottom: 15px;"></i>
      <p>Lendo e sincronizando a planilha <b>${file.name}</b> com o banco de dados...</p>
    </div>
  `;

  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const primeiraAba = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[primeiraAba];
      const dadosPlanilha = XLSX.utils.sheet_to_json(worksheet);

      if (dadosPlanilha.length === 0) throw new Error("A planilha está vazia.");

      // 1. Mapeamento: Transforma os nomes do seu Excel para os nomes do nosso banco de dados
      const equipesFormatadas = dadosPlanilha
        .filter(linha => linha['Prefixo']) // Garante que a linha tem um prefixo válido
        .map(linha => ({
          prefixo: String(linha['Prefixo']).trim(),
          tipo_equipe: String(linha['Tipo Equipe'] || 'NÃO DEFINIDO').trim(),
          status: String(linha['Status'] || 'ATIVA').toUpperCase().trim(),
          centro_custo: linha['Centro Custo'] ? String(linha['Centro Custo']).trim() : null,
          regime: linha['Regime'] ? String(linha['Regime']).trim() : null,
          veiculo_placa: linha['Veiculo'] ? String(linha['Veiculo']).trim() : null,
          processo: linha['Processo'] ? String(linha['Processo']).trim() : null,
          cidade: linha['Cidade/Localidade'] ? String(linha['Cidade/Localidade']).trim() : null,
          encarregado: linha['Encarregado'] ? String(linha['Encarregado']).trim() : null,
          supervisor: linha['Supervisor'] ? String(linha['Supervisor']).trim() : null,
          coordenador: linha['Coordenador'] ? String(linha['Coordenador']).trim() : null
        }));

      // 2. Envia para o Supabase (upsert: atualiza se já existir, insere se for novo)
      const { error } = await supabase
        .from('equipes')
        .upsert(equipesFormatadas, { onConflict: 'prefixo' });

      if (error) throw error;

      // 3. Sucesso!
      areaEquipes.innerHTML = `
        <div style="background: var(--status-work-bg); color: var(--status-work-text); padding: 25px; border-radius: 12px; border: 1px solid var(--status-work-border);">
          <h3 style="margin-bottom: 10px;"><i class="fas fa-check-circle"></i> Sincronização Concluída!</h3>
          <p>Foram cadastradas/atualizadas <b>${equipesFormatadas.length}</b> equipes no sistema.</p>
        </div>
      `;

    } catch (erro) {
      console.error("Erro na sincronização:", erro);
      areaEquipes.innerHTML = `
        <div style="background: var(--danger-light); color: var(--danger); padding: 20px; border-radius: 8px; border: 1px solid var(--danger-light);">
          <h3><i class="fas fa-exclamation-triangle"></i> Falha na Sincronização</h3>
          <p>${erro.message || 'Verifique se o Excel possui a coluna "Prefixo" e "Tipo Equipe".'}</p>
        </div>
      `;
    }
  };

  reader.readAsArrayBuffer(file);
}
