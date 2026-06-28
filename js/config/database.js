// ==========================================
// MÓDULO DE CONFIGURAÇÃO E BANCO DE DADOS
// ==========================================

// Importa a biblioteca oficial do Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Chaves de Acesso
const SUPABASE_URL = 'https://bdiliwltiftvboudnsq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__RZ132tr0ghZu4MvK8Mcig_6Kv9yApa';

// Cria a conexão e exporta para o sistema
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Servidor Supabase conectado com sucesso!");
