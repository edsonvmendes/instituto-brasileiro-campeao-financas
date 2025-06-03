// Variáveis globais para armazenar os dados
let entradasFinanceiras = [];
let saidasFinanceiras = [];
let extratoBancario = [];
let estoqueEntradas = [];
let estoqueSaidas = [];

// Variáveis para armazenar os resultados da conciliação
let resultadoConciliacaoFinanceira = null;
let resultadoConciliacaoBens = null;

// Variáveis para controle da interface
let abaAtiva = 'financeira';
let tipoImportacaoAtual = '';
let dadosImportacaoTemporarios = null;
let mapeamentoColunas = {};

// Constantes para mapeamento de colunas esperado
const COLUNAS_ESPERADAS = {
    entradas: ['data', 'descricao', 'valor'],
    saidas: ['data', 'descricao', 'valor'],
    extrato: ['data', 'descricao', 'valor'],
    estoqueEntradas: ['data', 'item', 'quantidade', 'origem'],
    estoqueSaidas: ['data', 'item', 'quantidade', 'destino']
};

// Elementos do DOM
const tabs = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const modalImportacao = document.getElementById('modal-importacao');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.querySelector('.modal-body');
const closeModalButton = document.querySelector('.close-button');

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado. Iniciando Conciliação App...');
    carregarDadosLocalStorage();
    configurarAbas();
    configurarBotoesAcao();
    configurarFiltros();
    configurarModal();
    
    // Executa a conciliação inicial com os dados carregados
    executarConciliacaoFinanceira();
    executarConciliacaoBens();
    
    // Renderiza a aba ativa inicial
    renderizarAbaAtiva();
    console.log('Conciliação App inicializado.');
});

// --- Funções de Configuração Inicial ---

function carregarDadosLocalStorage() {
    console.log('Carregando dados do localStorage...');
    entradasFinanceiras = JSON.parse(localStorage.getItem('conciliacao_entradasFinanceiras')) || [];
    saidasFinanceiras = JSON.parse(localStorage.getItem('conciliacao_saidasFinanceiras')) || [];
    extratoBancario = JSON.parse(localStorage.getItem('conciliacao_extratoBancario')) || [];
    estoqueEntradas = JSON.parse(localStorage.getItem('conciliacao_estoqueEntradas')) || [];
    estoqueSaidas = JSON.parse(localStorage.getItem('conciliacao_estoqueSaidas')) || [];
    console.log('Dados carregados:', {
        entradasFinanceiras: entradasFinanceiras.length,
        saidasFinanceiras: saidasFinanceiras.length,
        extratoBancario: extratoBancario.length,
        estoqueEntradas: estoqueEntradas.length,
        estoqueSaidas: estoqueSaidas.length
    });
}

function salvarDadosLocalStorage() {
    console.log('Salvando dados no localStorage...');
    localStorage.setItem('conciliacao_entradasFinanceiras', JSON.stringify(entradasFinanceiras));
    localStorage.setItem('conciliacao_saidasFinanceiras', JSON.stringify(saidasFinanceiras));
    localStorage.setItem('conciliacao_extratoBancario', JSON.stringify(extratoBancario));
    localStorage.setItem('conciliacao_estoqueEntradas', JSON.stringify(estoqueEntradas));
    localStorage.setItem('conciliacao_estoqueSaidas', JSON.stringify(estoqueSaidas));
    console.log('Dados salvos.');
}

function configurarAbas() {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            if (tabName === abaAtiva) return; // Não faz nada se clicar na aba já ativa
            
            console.log(`Mudando para aba: ${tabName}`);
            abaAtiva = tabName;
            
            // Atualiza classes 'active'
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(abaAtiva).classList.add('active');
            
            // Renderiza o conteúdo da nova aba
            renderizarAbaAtiva();
        });
    });
}

function configurarBotoesAcao() {
    // Botões de importação Financeira
    document.getElementById('importar-entradas')?.addEventListener('click', () => abrirModalImportacao('entradas'));
    document.getElementById('importar-saidas')?.addEventListener('click', () => abrirModalImportacao('saidas'));
    document.getElementById('importar-extrato')?.addEventListener('click', () => abrirModalImportacao('extrato'));
    document.getElementById('exportar-relatorio-financeiro')?.addEventListener('click', () => exportarRelatorio('financeiro'));

    // Botões de importação Bens
    document.getElementById('importar-estoque-entradas')?.addEventListener('click', () => abrirModalImportacao('estoqueEntradas'));
    document.getElementById('importar-estoque-saidas')?.addEventListener('click', () => abrirModalImportacao('estoqueSaidas'));
    document.getElementById('exportar-relatorio-bens')?.addEventListener('click', () => exportarRelatorio('bens'));
    
    // Botão de atualizar período no Dashboard
    document.getElementById('atualizar-periodo')?.addEventListener('click', () => renderizarDashboard());
}

function configurarFiltros() {
    // Filtros Financeiros
    document.getElementById('aplicar-filtros-financeiro')?.addEventListener('click', () => renderizarConciliacaoFinanceira());
    // Adicionar listeners para Enter nos inputs de filtro se necessário
    document.getElementById('busca-financeiro')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') renderizarConciliacaoFinanceira();
    });

    // Filtros de Bens
    document.getElementById('aplicar-filtros-bens')?.addEventListener('click', () => renderizarConciliacaoBens());
    document.getElementById('busca-bens')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') renderizarConciliacaoBens();
    });
}

function configurarModal() {
    closeModalButton?.addEventListener('click', fecharModalImportacao);
    // Fechar modal clicando fora
    modalImportacao?.addEventListener('click', (event) => {
        if (event.target === modalImportacao) {
            fecharModalImportacao();
        }
    });
}

// --- Funções de Renderização ---

function renderizarAbaAtiva() {
    console.log(`Renderizando aba: ${abaAtiva}`);
    switch (abaAtiva) {
        case 'financeira':
            renderizarConciliacaoFinanceira();
            break;
        case 'bens':
            renderizarConciliacaoBens();
            break;
        case 'dashboard':
            renderizarDashboard();
            break;
        case 'instrucoes':
            // O conteúdo das instruções já está no HTML
            break;
        default:
            console.error(`Aba desconhecida: ${abaAtiva}`);
    }
}

function renderizarConciliacaoFinanceira() {
    console.log('Renderizando Conciliação Financeira...');
    if (!resultadoConciliacaoFinanceira) {
        console.log('Resultado da conciliação financeira ainda não calculado.');
        executarConciliacaoFinanceira(); // Calcula se ainda não foi feito
    }
    
    const filtros = obterFiltros('financeiro');
    const dadosFiltrados = filtrarDadosFinanceiros(resultadoConciliacaoFinanceira, filtros);

    renderizarResumoFinanceiro(dadosFiltrados);
    renderizarTabelaLancamentosInternos(dadosFiltrados.lancamentosInternosFiltrados);
    renderizarTabelaExtrato(dadosFiltrados.extratoFiltrado);
    renderizarTabelaGapsFinanceiros(dadosFiltrados.gapsFiltrados);
    renderizarStatusConciliacao(dadosFiltrados, 'financeira');
}

function renderizarConciliacaoBens() {
    console.log('Renderizando Conciliação de Bens...');
     if (!resultadoConciliacaoBens) {
        console.log('Resultado da conciliação de bens ainda não calculado.');
        executarConciliacaoBens(); // Calcula se ainda não foi feito
    }
    
    const filtros = obterFiltros('bens');
    const dadosFiltrados = filtrarDadosBens(resultadoConciliacaoBens, filtros);
    
    renderizarResumoBens(dadosFiltrados);
    renderizarTabelaEstoqueEntradas(dadosFiltrados.entradasFiltradas);
    renderizarTabelaEstoqueSaidas(dadosFiltrados.saidasFiltradas);
    renderizarTabelaSaldoEstoque(dadosFiltrados.saldoEstoqueFiltrado);
    renderizarStatusConciliacao(dadosFiltrados, 'bens');
}

function renderizarDashboard() {
    console.log('Renderizando Dashboard...');
    const dataInicial = document.getElementById('data-inicial-dashboard')?.value;
    const dataFinal = document.getElementById('data-final-dashboard')?.value;
    
    // Recalcular conciliações se necessário ou usar resultados existentes filtrados por data
    // Por simplicidade, vamos usar os resultados completos por enquanto
    if (!resultadoConciliacaoFinanceira) executarConciliacaoFinanceira();
    if (!resultadoConciliacaoBens) executarConciliacaoBens();
    
    renderizarGraficoFinanceiro(resultadoConciliacaoFinanceira);
    renderizarStatsFinanceiro(resultadoConciliacaoFinanceira);
    renderizarGraficoBens(resultadoConciliacaoBens);
    renderizarStatsBens(resultadoConciliacaoBens);
    renderizarTopDivergencias(resultadoConciliacaoFinanceira, resultadoConciliacaoBens);
    renderizarProgressoConciliacao(resultadoConciliacaoFinanceira, resultadoConciliacaoBens);
}

// --- Funções de Renderização Específicas (Implementação Pendente) ---

function renderizarResumoFinanceiro(dados) { /* ... */ }
function renderizarTabelaLancamentosInternos(lancamentos) { /* ... */ }
function renderizarTabelaExtrato(extrato) { /* ... */ }
function renderizarTabelaGapsFinanceiros(gaps) { /* ... */ }
function renderizarStatusConciliacao(dados, tipo) { /* ... */ }

function renderizarResumoBens(dados) { /* ... */ }
function renderizarTabelaEstoqueEntradas(entradas) { /* ... */ }
function renderizarTabelaEstoqueSaidas(saidas) { /* ... */ }
function renderizarTabelaSaldoEstoque(saldo) { /* ... */ }

function renderizarGraficoFinanceiro(dados) { /* ... */ }
function renderizarStatsFinanceiro(dados) { /* ... */ }
function renderizarGraficoBens(dados) { /* ... */ }
function renderizarStatsBens(dados) { /* ... */ }
function renderizarTopDivergencias(financeiro, bens) { /* ... */ }
function renderizarProgressoConciliacao(financeiro, bens) { /* ... */ }

// --- Funções de Lógica de Negócio (Conciliação - Implementação Pendente) ---

function executarConciliacaoFinanceira() {
    console.log('Executando conciliação financeira...');
    // Lógica para cruzar entradasFinanceiras, saidasFinanceiras e extratoBancario
    // Adaptar AlgoritmosConciliacao.ts
    resultadoConciliacaoFinanceira = { /* ... resultado simulado ... */
        lancamentosInternos: [],
        extrato: [],
        gaps: [],
        resumo: { conciliado: 0, pendente: 0, divergente: 0, naoIdentificado: 0, totalInterno: 0, totalExtrato: 0 }
    };
    console.log('Conciliação financeira concluída.');
}

function executarConciliacaoBens() {
    console.log('Executando conciliação de bens...');
    // Lógica para calcular saldo de estoque a partir de estoqueEntradas e estoqueSaidas
    // Adaptar AlgoritmosConciliacao.ts
    resultadoConciliacaoBens = { /* ... resultado simulado ... */
        entradas: [],
        saidas: [],
        saldoEstoque: [],
        resumo: { conciliado: 0, pendente: 0, divergente: 0, totalEntradas: 0, totalSaidas: 0 }
    };
    console.log('Conciliação de bens concluída.');
}

// --- Funções de Filtragem (Implementação Pendente) ---

function obterFiltros(tipo) {
    const filtros = {};
    if (tipo === 'financeiro') {
        filtros.dataInicial = document.getElementById('data-inicial-financeiro')?.value;
        filtros.dataFinal = document.getElementById('data-final-financeiro')?.value;
        filtros.status = document.getElementById('status-filtro-financeiro')?.value;
        filtros.busca = document.getElementById('busca-financeiro')?.value.toLowerCase();
    } else if (tipo === 'bens') {
        filtros.dataInicial = document.getElementById('data-inicial-bens')?.value;
        filtros.dataFinal = document.getElementById('data-final-bens')?.value;
        filtros.status = document.getElementById('status-filtro-bens')?.value;
        filtros.busca = document.getElementById('busca-bens')?.value.toLowerCase();
    }
    console.log(`Filtros obtidos para ${tipo}:`, filtros);
    return filtros;
}

function filtrarDadosFinanceiros(dadosCompletos, filtros) {
    console.log('Filtrando dados financeiros...');
    // Lógica de filtragem baseada nos filtros
    // Retornar um objeto similar a dadosCompletos, mas com os dados filtrados
    return { /* ... dados filtrados ... */
        lancamentosInternosFiltrados: dadosCompletos.lancamentosInternos, // Simulado
        extratoFiltrado: dadosCompletos.extrato, // Simulado
        gapsFiltrados: dadosCompletos.gaps, // Simulado
        resumo: dadosCompletos.resumo // O resumo pode precisar ser recalculado
    };
}

function filtrarDadosBens(dadosCompletos, filtros) {
    console.log('Filtrando dados de bens...');
    // Lógica de filtragem baseada nos filtros
    // Retornar um objeto similar a dadosCompletos, mas com os dados filtrados
    return { /* ... dados filtrados ... */
        entradasFiltradas: dadosCompletos.entradas, // Simulado
        saidasFiltradas: dadosCompletos.saidas, // Simulado
        saldoEstoqueFiltrado: dadosCompletos.saldoEstoque, // Simulado
        resumo: dadosCompletos.resumo // O resumo pode precisar ser recalculado
    };
}

// --- Funções de Importação (Implementação Pendente) ---

function abrirModalImportacao(tipo) {
    console.log(`Abrindo modal para importar: ${tipo}`);
    tipoImportacaoAtual = tipo;
    dadosImportacaoTemporarios = null;
    mapeamentoColunas = {};

    let titulo = `Importar ${tipo.replace('estoque', 'Estoque ')}`;
    modalTitle.textContent = titulo;

    // Limpa e configura o corpo do modal
    modalBody.innerHTML = `
        <p>Selecione um arquivo Excel (.xlsx) para importar.</p>
        <p class="text-small">Não tem um arquivo pronto? 
            <button id="baixar-modelo" class="btn btn-link">Baixar Modelo</button>
        </p>
        
        <input type="file" id="arquivo-excel" accept=".xlsx, .xls" class="form-control mb-2">
        
        <div id="mapeamento-colunas-container" class="mapeamento-colunas hidden">
            <h4>Mapeamento de Colunas</h4>
            <p>Verifique se as colunas foram mapeadas corretamente. Se necessário, ajuste as seleções.</p>
            <div id="mapeamento-grid" class="mapeamento-grid">
                <!-- Mapeamento será inserido aqui -->
            </div>
        </div>
        
        <div id="erros-importacao-container" class="erros-importacao hidden">
            <h4><i class="fas fa-exclamation-triangle"></i> Erros na Importação</h4>
            <ul id="lista-erros-importacao"></ul>
        </div>
        
        <div id="previa-importacao-container" class="previa-importacao hidden">
            <h4>Prévia dos Dados (Primeiras 5 linhas)</h4>
            <div class="table-responsive">
                <table id="tabela-previa-importacao">
                    <thead></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
        
        <div class="modal-footer">
            <button id="cancelar-importacao" class="btn btn-outline">Cancelar</button>
            <button id="confirmar-importacao" class="btn btn-primary" disabled>Importar</button>
        </div>
    `;

    // Adiciona listeners aos novos elementos do modal
    document.getElementById('baixar-modelo')?.addEventListener('click', () => gerarModeloExcel(tipoImportacaoAtual));
    document.getElementById('arquivo-excel')?.addEventListener('change', handleSelecaoArquivo);
    document.getElementById('cancelar-importacao')?.addEventListener('click', fecharModalImportacao);
    document.getElementById('confirmar-importacao')?.addEventListener('click', confirmarImportacao);

    modalImportacao.style.display = 'block';
}

function fecharModalImportacao() {
    console.log('Fechando modal de importação.');
    modalImportacao.style.display = 'none';
    modalBody.innerHTML = ''; // Limpa o conteúdo para a próxima abertura
}

function handleSelecaoArquivo(event) {
    const file = event.target.files[0];
    if (!file) return;
    console.log(`Arquivo selecionado: ${file.name}`);

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Lê como array de arrays

            if (jsonData.length < 2) {
                mostrarErroImportacao('Planilha vazia ou sem cabeçalho.');
                return;
            }

            const cabecalho = jsonData[0].map(h => String(h).trim());
            const linhas = jsonData.slice(1);

            dadosImportacaoTemporarios = { cabecalho, linhas };
            console.log('Dados brutos lidos:', dadosImportacaoTemporarios);

            tentarMapeamentoAutomatico(cabecalho);
            renderizarMapeamentoColunas(cabecalho);
            renderizarPreviaImportacao(cabecalho, linhas.slice(0, 5));
            validarMapeamento(); // Habilita/desabilita botão importar

        } catch (error) {
            console.error('Erro ao ler o arquivo Excel:', error);
            mostrarErroImportacao(`Erro ao processar o arquivo: ${error.message}`);
            document.getElementById('confirmar-importacao').disabled = true;
        }
    };
    reader.onerror = (e) => {
        console.error('Erro no FileReader:', e);
        mostrarErroImportacao('Não foi possível ler o arquivo selecionado.');
        document.getElementById('confirmar-importacao').disabled = true;
    };
    reader.readAsArrayBuffer(file);
}

function tentarMapeamentoAutomatico(cabecalhoArquivo) {
    console.log('Tentando mapeamento automático...');
    mapeamentoColunas = {};
    const colunasEsperadas = COLUNAS_ESPERADAS[tipoImportacaoAtual] || [];
    
    colunasEsperadas.forEach(colunaEsperada => {
        // Tenta encontrar correspondência exata (ignorando case e acentos)
        let encontrada = cabecalhoArquivo.find(h => normalizarString(h) === normalizarString(colunaEsperada));
        
        // Tenta encontrar correspondências comuns (ex: 'Valor Total' para 'valor')
        if (!encontrada) {
            // Adicionar lógicas de mapeamento mais flexíveis aqui se necessário
        }
        
        mapeamentoColunas[colunaEsperada] = encontrada || ''; // Armazena o nome da coluna encontrada ou vazio
    });
    console.log('Mapeamento automático:', mapeamentoColunas);
}

function renderizarMapeamentoColunas(cabecalhoArquivo) {
    const container = document.getElementById('mapeamento-grid');
    const colunasEsperadas = COLUNAS_ESPERADAS[tipoImportacaoAtual] || [];
    container.innerHTML = ''; // Limpa mapeamento anterior

    colunasEsperadas.forEach(colunaEsperada => {
        const div = document.createElement('div');
        div.className = 'mapeamento-item';
        
        const label = document.createElement('span');
        label.textContent = `${colunaEsperada.charAt(0).toUpperCase() + colunaEsperada.slice(1)}:`;
        
        const select = document.createElement('select');
        select.className = 'form-control';
        select.dataset.colunaEsperada = colunaEsperada;
        
        // Opção vazia
        const optionVazia = document.createElement('option');
        optionVazia.value = '';
        optionVazia.textContent = '-- Selecione --';
        select.appendChild(optionVazia);
        
        // Opções do cabeçalho do arquivo
        cabecalhoArquivo.forEach(colunaArquivo => {
            const option = document.createElement('option');
            option.value = colunaArquivo;
            option.textContent = colunaArquivo;
            if (mapeamentoColunas[colunaEsperada] === colunaArquivo) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        // Atualiza o mapeamento quando o usuário muda a seleção
        select.addEventListener('change', (e) => {
            mapeamentoColunas[colunaEsperada] = e.target.value;
            console.log('Mapeamento atualizado:', mapeamentoColunas);
            validarMapeamento();
        });
        
        div.appendChild(label);
        div.appendChild(select);
        container.appendChild(div);
    });

    document.getElementById('mapeamento-colunas-container').classList.remove('hidden');
}

function renderizarPreviaImportacao(cabecalho, linhas) {
    const container = document.getElementById('previa-importacao-container');
    const tableHead = container.querySelector('#tabela-previa-importacao thead');
    const tableBody = container.querySelector('#tabela-previa-importacao tbody');
    
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    // Cabeçalho da prévia
    const trHead = document.createElement('tr');
    cabecalho.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        trHead.appendChild(th);
    });
    tableHead.appendChild(trHead);

    // Linhas da prévia
    linhas.forEach(linha => {
        const trBody = document.createElement('tr');
        linha.forEach(celula => {
            const td = document.createElement('td');
            // Formata data se for objeto Date
            td.textContent = (celula instanceof Date) ? formatarDataExcel(celula) : celula;
            trBody.appendChild(td);
        });
        tableBody.appendChild(trBody);
    });

    container.classList.remove('hidden');
}

function validarMapeamento() {
    const colunasEsperadas = COLUNAS_ESPERADAS[tipoImportacaoAtual] || [];
    const todasMapeadas = colunasEsperadas.every(col => mapeamentoColunas[col] && mapeamentoColunas[col] !== '');
    
    document.getElementById('confirmar-importacao').disabled = !todasMapeadas;
    
    if (!todasMapeadas) {
        mostrarErroImportacao('Mapeie todas as colunas obrigatórias para continuar.');
    } else {
        ocultarErroImportacao();
    }
    return todasMapeadas;
}

function confirmarImportacao() {
    if (!validarMapeamento() || !dadosImportacaoTemporarios) return;
    
    console.log(`Confirmando importação para: ${tipoImportacaoAtual}`);
    const { cabecalho, linhas } = dadosImportacaoTemporarios;
    const dadosProcessados = [];
    const erros = [];

    linhas.forEach((linha, index) => {
        const itemProcessado = {};
        let linhaValida = true;
        
        Object.entries(mapeamentoColunas).forEach(([colunaEsperada, colunaArquivo]) => {
            const indiceColuna = cabecalho.indexOf(colunaArquivo);
            if (indiceColuna === -1) {
                erros.push(`Linha ${index + 2}: Coluna mapeada '${colunaArquivo}' não encontrada.`);
                linhaValida = false;
                return;
            }
            
            let valor = linha[indiceColuna];
            
            // Validações e conversões
            if (colunaEsperada === 'data') {
                valor = converterParaData(valor);
                if (!valor) {
                    erros.push(`Linha ${index + 2}: Formato de data inválido na coluna '${colunaArquivo}'. Use DD/MM/AAAA ou AAAA-MM-DD.`);
                    linhaValida = false;
                }
            } else if (colunaEsperada === 'valor' || colunaEsperada === 'quantidade') {
                valor = converterParaNumero(valor);
                if (isNaN(valor)) {
                    erros.push(`Linha ${index + 2}: Valor numérico inválido na coluna '${colunaArquivo}'.`);
                    linhaValida = false;
                }
            } else {
                valor = String(valor || '').trim(); // Converte para string e remove espaços
            }
            
            itemProcessado[colunaEsperada] = valor;
        });

        if (linhaValida) {
            dadosProcessados.push(itemProcessado);
        }
    });

    if (erros.length > 0) {
        mostrarErroImportacao(`Erros encontrados durante o processamento (${erros.length}). Verifique os dados e tente novamente.`, erros.slice(0, 10)); // Mostra os 10 primeiros erros
        document.getElementById('confirmar-importacao').disabled = true;
        return;
    }

    // Atualiza os dados principais
    switch (tipoImportacaoAtual) {
        case 'entradas': entradasFinanceiras = dadosProcessados; break;
        case 'saidas': saidasFinanceiras = dadosProcessados; break;
        case 'extrato': extratoBancario = dadosProcessados; break;
        case 'estoqueEntradas': estoqueEntradas = dadosProcessados; break;
        case 'estoqueSaidas': estoqueSaidas = dadosProcessados; break;
    }

    console.log(`Dados importados para ${tipoImportacaoAtual}:`, dadosProcessados.length, 'linhas');
    salvarDadosLocalStorage();
    fecharModalImportacao();
    
    // Recalcula e renderiza a aba atual
    if (['entradas', 'saidas', 'extrato'].includes(tipoImportacaoAtual)) {
        executarConciliacaoFinanceira();
        if (abaAtiva === 'financeira' || abaAtiva === 'dashboard') renderizarAbaAtiva();
    } else if (['estoqueEntradas', 'estoqueSaidas'].includes(tipoImportacaoAtual)) {
        executarConciliacaoBens();
        if (abaAtiva === 'bens' || abaAtiva === 'dashboard') renderizarAbaAtiva();
    }
}

function mostrarErroImportacao(mensagemPrincipal, listaErros = []) {
    const container = document.getElementById('erros-importacao-container');
    const lista = document.getElementById('lista-erros-importacao');
    container.classList.remove('hidden');
    lista.innerHTML = ''; // Limpa erros anteriores
    
    const p = document.createElement('p');
    p.textContent = mensagemPrincipal;
    lista.appendChild(p);
    
    if (listaErros.length > 0) {
        listaErros.forEach(erro => {
            const li = document.createElement('li');
            li.textContent = erro;
            lista.appendChild(li);
        });
    }
}

function ocultarErroImportacao() {
    document.getElementById('erros-importacao-container').classList.add('hidden');
    document.getElementById('lista-erros-importacao').innerHTML = '';
}

// --- Funções de Exportação (Implementação Pendente) ---

function gerarModeloExcel(tipo) {
    console.log(`Gerando modelo Excel para: ${tipo}`);
    const colunas = COLUNAS_ESPERADAS[tipo] || [];
    if (colunas.length === 0) return;

    const ws = XLSX.utils.aoa_to_sheet([colunas]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo');

    // Adiciona exemplos (opcional)
    // ... (lógica para adicionar linhas de exemplo)

    const nomeArquivo = `Modelo_${tipo}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
    console.log(`Modelo ${nomeArquivo} gerado.`);
}

function exportarRelatorio(tipo) {
    console.log(`Exportando relatório para: ${tipo}`);
    // Lógica para gerar e baixar o relatório em Excel
    // Usar resultadoConciliacaoFinanceira ou resultadoConciliacaoBens
    // Criar múltiplas abas no Excel (Resumo, Gaps, Dados Completos, etc.)
    alert(`Funcionalidade de exportar relatório (${tipo}) ainda não implementada.`);
}

// --- Funções Utilitárias ---

function normalizarString(str) {
    if (!str) return '';
    return String(str).toLowerCase().normalize("NFD").replace(/["\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '');
}

function converterParaData(valor) {
    if (!valor) return null;
    if (valor instanceof Date) return valor;
    
    // Tenta formatos comuns (DD/MM/AAAA, AAAA-MM-DD, MM/DD/AAAA)
    try {
        let data;
        if (String(valor).includes('/')) {
            const partes = String(valor).split('/');
            if (partes.length === 3) {
                // Tenta DD/MM/AAAA
                data = new Date(`${partes[2]}-${partes[1]}-${partes[0]}T00:00:00`);
                if (!isNaN(data)) return data;
                // Tenta MM/DD/AAAA
                data = new Date(`${partes[2]}-${partes[0]}-${partes[1]}T00:00:00`);
                if (!isNaN(data)) return data;
            }
        } else if (String(valor).includes('-')) {
             // Tenta AAAA-MM-DD
             data = new Date(`${valor}T00:00:00`);
             if (!isNaN(data)) return data;
        }
        
        // Tenta converter número serial do Excel (se for número)
        if (typeof valor === 'number') {
             data = XLSX.SSF.parse_date_code(valor);
             if (data) return new Date(data.y, data.m - 1, data.d);
        }

    } catch (e) {
        console.warn(`Erro ao converter data: ${valor}`, e);
    }
    return null; // Retorna null se não conseguir converter
}

function converterParaNumero(valor) {
    if (valor === null || valor === undefined || String(valor).trim() === '') return NaN;
    if (typeof valor === 'number') return valor;
    
    // Remove R$, pontos de milhar e substitui vírgula por ponto
    const valorLimpo = String(valor)
        .replace(/R\$\s?/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
        
    const numero = parseFloat(valorLimpo);
    return isNaN(numero) ? NaN : numero;
}

function formatarValorMonetario(valor) {
    if (isNaN(valor) || valor === null) return 'N/A';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data) {
    if (!data || !(data instanceof Date) || isNaN(data)) return 'N/A';
    return data.toLocaleDateString('pt-BR');
}

function formatarDataExcel(data) {
    // Formato específico para exibição de datas lidas do Excel
    if (!data || !(data instanceof Date) || isNaN(data)) return '';
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function getStatusClass(status) {
    switch (status) {
        case 'conciliado': return 'status-conciliado';
        case 'pendente': return 'status-pendente';
        case 'divergente': return 'status-divergente';
        case 'nao_identificado': return 'status-nao-identificado';
        default: return '';
    }
}

function getStatusIcon(status) {
    switch (status) {
        case 'conciliado': return 'fas fa-check-circle';
        case 'pendente': return 'fas fa-clock';
        case 'divergente': return 'fas fa-exclamation-triangle';
        case 'nao_identificado': return 'fas fa-question-circle';
        default: return '';
    }
}

// --- Implementação das Funções de Renderização Específicas ---

function renderizarTabela(tbodyId, dados, colunas) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) {
        console.error(`Elemento tbody com ID ${tbodyId} não encontrado.`);
        return;
    }
    tbody.innerHTML = ''; // Limpa tabela

    if (!dados || dados.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = colunas.length;
        td.textContent = 'Nenhum dado para exibir.';
        td.style.textAlign = 'center';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    dados.forEach(item => {
        const tr = document.createElement('tr');
        colunas.forEach(col => {
            const td = document.createElement('td');
            let valor = item[col.key];
            
            if (col.format === 'date') {
                valor = formatarData(valor);
            } else if (col.format === 'currency') {
                valor = formatarValorMonetario(valor);
            } else if (col.format === 'status') {
                const statusClass = getStatusClass(valor);
                const iconClass = getStatusIcon(valor);
                td.innerHTML = `<span class="status-tag ${statusClass}"><i class="${iconClass}"></i> ${valor || 'N/A'}</span>`;
                tr.appendChild(td);
                return; // Pula o textContent padrão
            } else if (col.key === 'instrucao') {
                 td.innerHTML = valor || '-'; // Permite HTML na instrução se necessário
                 tr.appendChild(td);
                 return; // Pula o textContent padrão
            }
            
            td.textContent = valor !== undefined && valor !== null ? valor : '-';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// Exemplo de chamada para renderizar tabela de lançamentos internos
function renderizarTabelaLancamentosInternos(lancamentos) {
    const colunas = [
        { key: 'data', format: 'date' },
        { key: 'descricao' },
        { key: 'valor', format: 'currency' },
        { key: 'statusConciliacao', format: 'status' }
    ];
    renderizarTabela('tabela-lancamentos-tbody', lancamentos, colunas); // Assumindo que o tbody tem id='tabela-lancamentos-tbody'
}

// Adicionar IDs aos tbodys no HTML:
// <tbody id="tabela-lancamentos-tbody"> ... </tbody>
// <tbody id="tabela-extrato-tbody"> ... </tbody>
// <tbody id="tabela-gaps-financeiro-tbody"> ... </tbody>
// <tbody id="tabela-estoque-entradas-tbody"> ... </tbody>
// <tbody id="tabela-estoque-saidas-tbody"> ... </tbody>
// <tbody id="tabela-saldo-estoque-tbody"> ... </tbody>
// <tbody id="tabela-top-divergencias-tbody"> ... </tbody>

// TODO: Implementar as demais funções de renderização (Resumos, Status, Dashboard, etc.)
// TODO: Implementar a lógica de conciliação em executarConciliacaoFinanceira e executarConciliacaoBens
// TODO: Implementar a lógica de filtragem em filtrarDadosFinanceiros e filtrarDadosBens
// TODO: Implementar a lógica de exportação em exportarRelatorio
// TODO: Adicionar gráficos ao dashboard usando Chart.js

console.log('conciliacao.js carregado.');
