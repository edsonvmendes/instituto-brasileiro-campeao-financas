/**
 * Integração dos Módulos de Conciliação
 * 
 * Este arquivo integra todos os módulos do sistema de conciliação,
 * garantindo que os scripts sejam carregados na ordem correta e
 * que as funções sejam chamadas adequadamente.
 */

// Verifica se todos os scripts necessários foram carregados
document.addEventListener('DOMContentLoaded', function() {
    console.log('Verificando dependências do módulo de conciliação...');
    
    // Verifica se as bibliotecas externas estão disponíveis
    if (typeof XLSX === 'undefined') {
        console.error('Biblioteca XLSX não encontrada. Verifique se o script foi incluído.');
        mostrarErroCarregamento('Biblioteca XLSX não encontrada. Verifique sua conexão com a internet ou contate o suporte.');
        return;
    }
    
    if (typeof saveAs === 'undefined' && typeof FileSaver === 'undefined') {
        console.error('Biblioteca FileSaver não encontrada. Verifique se o script foi incluído.');
        mostrarErroCarregamento('Biblioteca FileSaver não encontrada. Verifique sua conexão com a internet ou contate o suporte.');
        return;
    }
    
    if (typeof Chart === 'undefined') {
        console.error('Biblioteca Chart.js não encontrada. Verifique se o script foi incluído.');
        mostrarErroCarregamento('Biblioteca Chart.js não encontrada. Verifique sua conexão com a internet ou contate o suporte.');
        return;
    }
    
    // Carrega os scripts do módulo de conciliação em ordem
    carregarScript('algoritmos-conciliacao.js', function() {
        carregarScript('renderizacao-conciliacao.js', function() {
            carregarScript('exportacao-excel.js', function() {
                inicializarModuloConciliacao();
            });
        });
    });
});

/**
 * Carrega um script dinamicamente
 * @param {string} url - URL do script a ser carregado
 * @param {Function} callback - Função a ser chamada após o carregamento
 */
function carregarScript(url, callback) {
    console.log(`Carregando script: ${url}`);
    
    // Verifica se o script já foi carregado
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes(url)) {
            console.log(`Script ${url} já carregado.`);
            if (callback) callback();
            return;
        }
    }
    
    // Cria o elemento script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    
    // Define o callback para quando o script for carregado
    if (callback) {
        script.onload = function() {
            console.log(`Script ${url} carregado com sucesso.`);
            callback();
        };
        
        script.onerror = function() {
            console.error(`Erro ao carregar script: ${url}`);
            mostrarErroCarregamento(`Erro ao carregar ${url}. Verifique sua conexão com a internet ou contate o suporte.`);
        };
    }
    
    // Adiciona o script ao documento
    document.head.appendChild(script);
}

/**
 * Mostra uma mensagem de erro de carregamento
 * @param {string} mensagem - Mensagem de erro
 */
function mostrarErroCarregamento(mensagem) {
    // Cria um elemento para mostrar o erro
    const erroDiv = document.createElement('div');
    erroDiv.className = 'erro-carregamento';
    erroDiv.innerHTML = `
        <div class="erro-carregamento-conteudo">
            <h3><i class="fas fa-exclamation-triangle"></i> Erro ao Carregar Módulo</h3>
            <p>${mensagem}</p>
            <p>Tente recarregar a página. Se o problema persistir, contate o suporte técnico.</p>
            <button onclick="location.reload()">Recarregar Página</button>
        </div>
    `;
    
    // Adiciona estilos
    const style = document.createElement('style');
    style.textContent = `
        .erro-carregamento {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        .erro-carregamento-conteudo {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 500px;
            text-align: center;
        }
        .erro-carregamento h3 {
            color: #f44336;
            margin-bottom: 15px;
        }
        .erro-carregamento button {
            background-color: #6a1b9a;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 15px;
        }
        .erro-carregamento button:hover {
            background-color: #38006b;
        }
    `;
    
    // Adiciona ao documento
    document.head.appendChild(style);
    document.body.appendChild(erroDiv);
}

/**
 * Inicializa o módulo de conciliação
 */
function inicializarModuloConciliacao() {
    console.log('Inicializando módulo de conciliação...');
    
    // Verifica se os objetos necessários foram carregados
    if (!window.AlgoritmosConciliacao) {
        console.error('Módulo AlgoritmosConciliacao não encontrado.');
        mostrarErroCarregamento('Erro ao carregar os algoritmos de conciliação. Tente recarregar a página.');
        return;
    }
    
    if (!window.RenderizacaoConciliacao) {
        console.error('Módulo RenderizacaoConciliacao não encontrado.');
        mostrarErroCarregamento('Erro ao carregar as funções de renderização. Tente recarregar a página.');
        return;
    }
    
    if (!window.ExportacaoExcel) {
        console.error('Módulo ExportacaoExcel não encontrado.');
        mostrarErroCarregamento('Erro ao carregar as funções de exportação. Tente recarregar a página.');
        return;
    }
    
    // Integra os módulos ao objeto global
    window.Conciliacao = {
        algoritmos: window.AlgoritmosConciliacao,
        renderizacao: window.RenderizacaoConciliacao,
        exportacao: window.ExportacaoExcel
    };
    
    // Substitui as funções pendentes no conciliacao.js
    substituirFuncoesPendentes();
    
    console.log('Módulo de conciliação inicializado com sucesso!');
}

/**
 * Substitui as funções pendentes no conciliacao.js
 */
function substituirFuncoesPendentes() {
    console.log('Substituindo funções pendentes...');
    
    // Funções de algoritmos
    if (typeof executarConciliacaoFinanceira === 'function') {
        const originalExecutarConciliacaoFinanceira = executarConciliacaoFinanceira;
        window.executarConciliacaoFinanceira = function() {
            console.log('Chamando função de conciliação financeira integrada...');
            resultadoConciliacaoFinanceira = window.Conciliacao.algoritmos.executarConciliacaoFinanceira(
                entradasFinanceiras, 
                saidasFinanceiras, 
                extratoBancario
            );
            return resultadoConciliacaoFinanceira;
        };
    }
    
    if (typeof executarConciliacaoBens === 'function') {
        const originalExecutarConciliacaoBens = executarConciliacaoBens;
        window.executarConciliacaoBens = function() {
            console.log('Chamando função de conciliação de bens integrada...');
            resultadoConciliacaoBens = window.Conciliacao.algoritmos.executarConciliacaoBens(
                estoqueEntradas, 
                estoqueSaidas
            );
            return resultadoConciliacaoBens;
        };
    }
    
    // Funções de renderização
    const renderizacaoFuncoes = [
        'renderizarResumoFinanceiro',
        'renderizarTabelaLancamentosInternos',
        'renderizarTabelaExtrato',
        'renderizarTabelaGapsFinanceiros',
        'renderizarStatusConciliacao',
        'renderizarResumoBens',
        'renderizarTabelaEstoqueEntradas',
        'renderizarTabelaEstoqueSaidas',
        'renderizarTabelaSaldoEstoque',
        'renderizarGraficoFinanceiro',
        'renderizarStatsFinanceiro',
        'renderizarGraficoBens',
        'renderizarStatsBens',
        'renderizarTopDivergencias',
        'renderizarProgressoConciliacao'
    ];
    
    renderizacaoFuncoes.forEach(funcao => {
        if (typeof window[funcao] === 'function') {
            window[funcao] = window.Conciliacao.renderizacao[funcao];
        }
    });
    
    // Funções de exportação
    if (typeof exportarRelatorio === 'function') {
        const originalExportarRelatorio = exportarRelatorio;
        window.exportarRelatorio = function(tipo) {
            console.log(`Chamando função de exportação integrada para: ${tipo}`);
            if (tipo === 'financeiro') {
                window.Conciliacao.exportacao.exportarRelatorioFinanceiro(resultadoConciliacaoFinanceira);
            } else if (tipo === 'bens') {
                window.Conciliacao.exportacao.exportarRelatorioBens(resultadoConciliacaoBens);
            } else if (tipo === 'completo') {
                window.Conciliacao.exportacao.exportarRelatorioCompleto(resultadoConciliacaoFinanceira, resultadoConciliacaoBens);
            }
        };
    }
    
    if (typeof gerarModeloExcel === 'function') {
        window.gerarModeloExcel = window.Conciliacao.exportacao.gerarModeloExcel;
    }
    
    console.log('Funções pendentes substituídas com sucesso!');
}

// Adiciona estilos para o erro de carregamento
const style = document.createElement('style');
style.textContent = `
    .erro-carregamento {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }
    .erro-carregamento-conteudo {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 500px;
        text-align: center;
    }
    .erro-carregamento h3 {
        color: #f44336;
        margin-bottom: 15px;
    }
    .erro-carregamento button {
        background-color: #6a1b9a;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 15px;
    }
    .erro-carregamento button:hover {
        background-color: #38006b;
    }
`;
document.head.appendChild(style);

console.log('Script de integração carregado.');
