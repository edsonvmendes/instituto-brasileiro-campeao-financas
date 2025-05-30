/**
 * Funções para exportação de relatórios em Excel
 * 
 * Este arquivo contém as funções para gerar e exportar relatórios
 * de conciliação em formato Excel.
 */

/**
 * Exporta um relatório de conciliação financeira
 * @param {Object} dadosConciliacao - Dados da conciliação financeira
 */
function exportarRelatorioFinanceiro(dadosConciliacao) {
    console.log('Exportando relatório financeiro...');
    
    // Cria um novo workbook
    const wb = XLSX.utils.book_new();
    
    // Adiciona a aba de resumo
    adicionarAbaResumoFinanceiro(wb, dadosConciliacao);
    
    // Adiciona a aba de lançamentos internos
    adicionarAbaLancamentosInternos(wb, dadosConciliacao.lancamentosInternos);
    
    // Adiciona a aba de extrato
    adicionarAbaExtrato(wb, dadosConciliacao.extrato);
    
    // Adiciona a aba de gaps
    adicionarAbaGapsFinanceiros(wb, dadosConciliacao.gaps);
    
    // Gera o arquivo e faz o download
    const dataAtual = formatarDataArquivo(new Date());
    XLSX.writeFile(wb, `Conciliacao_Financeira_${dataAtual}.xlsx`);
    
    console.log('Relatório financeiro exportado com sucesso.');
}

/**
 * Exporta um relatório de conciliação de bens
 * @param {Object} dadosConciliacao - Dados da conciliação de bens
 */
function exportarRelatorioBens(dadosConciliacao) {
    console.log('Exportando relatório de bens...');
    
    // Cria um novo workbook
    const wb = XLSX.utils.book_new();
    
    // Adiciona a aba de resumo
    adicionarAbaResumoBens(wb, dadosConciliacao);
    
    // Adiciona a aba de entradas
    adicionarAbaEntradasEstoque(wb, dadosConciliacao.entradas);
    
    // Adiciona a aba de saídas
    adicionarAbaSaidasEstoque(wb, dadosConciliacao.saidas);
    
    // Adiciona a aba de saldo
    adicionarAbaSaldoEstoque(wb, dadosConciliacao.saldoEstoque);
    
    // Adiciona a aba de gaps
    adicionarAbaGapsBens(wb, dadosConciliacao.gaps);
    
    // Gera o arquivo e faz o download
    const dataAtual = formatarDataArquivo(new Date());
    XLSX.writeFile(wb, `Conciliacao_Bens_${dataAtual}.xlsx`);
    
    console.log('Relatório de bens exportado com sucesso.');
}

/**
 * Exporta um relatório completo de conciliação
 * @param {Object} dadosFinanceiros - Dados da conciliação financeira
 * @param {Object} dadosBens - Dados da conciliação de bens
 */
function exportarRelatorioCompleto(dadosFinanceiros, dadosBens) {
    console.log('Exportando relatório completo...');
    
    // Cria um novo workbook
    const wb = XLSX.utils.book_new();
    
    // Adiciona as abas financeiras
    adicionarAbaResumoFinanceiro(wb, dadosFinanceiros);
    adicionarAbaLancamentosInternos(wb, dadosFinanceiros.lancamentosInternos);
    adicionarAbaExtrato(wb, dadosFinanceiros.extrato);
    adicionarAbaGapsFinanceiros(wb, dadosFinanceiros.gaps);
    
    // Adiciona as abas de bens
    adicionarAbaResumoBens(wb, dadosBens);
    adicionarAbaEntradasEstoque(wb, dadosBens.entradas);
    adicionarAbaSaidasEstoque(wb, dadosBens.saidas);
    adicionarAbaSaldoEstoque(wb, dadosBens.saldoEstoque);
    adicionarAbaGapsBens(wb, dadosBens.gaps);
    
    // Adiciona uma aba de resumo geral
    adicionarAbaResumoGeral(wb, dadosFinanceiros, dadosBens);
    
    // Gera o arquivo e faz o download
    const dataAtual = formatarDataArquivo(new Date());
    XLSX.writeFile(wb, `Conciliacao_Completa_${dataAtual}.xlsx`);
    
    console.log('Relatório completo exportado com sucesso.');
}

/**
 * Gera um modelo de Excel para importação
 * @param {string} tipo - Tipo de modelo ('entradas', 'saidas', 'extrato', 'estoqueEntradas', 'estoqueSaidas')
 */
function gerarModeloExcel(tipo) {
    console.log(`Gerando modelo Excel para: ${tipo}`);
    
    // Cria um novo workbook
    const wb = XLSX.utils.book_new();
    
    // Define as colunas com base no tipo
    let colunas = [];
    let exemplos = [];
    
    switch (tipo) {
        case 'entradas':
            colunas = ['data', 'descricao', 'valor'];
            exemplos = [
                ['10/05/2025', 'Doação Empresa XYZ', 5000],
                ['15/05/2025', 'Doação Pessoa Física', 1000],
                ['20/05/2025', 'Patrocínio Evento', 3500]
            ];
            break;
            
        case 'saidas':
            colunas = ['data', 'descricao', 'valor'];
            exemplos = [
                ['12/05/2025', 'Pagamento Fornecedor', 2000],
                ['18/05/2025', 'Aluguel Sede', 1500],
                ['25/05/2025', 'Material Esportivo', 3000]
            ];
            break;
            
        case 'extrato':
            colunas = ['data', 'descricao', 'valor'];
            exemplos = [
                ['10/05/2025', 'TED RECEBIDA - Empresa XYZ', 5000],
                ['12/05/2025', 'PAGTO BOLETO - Fornecedor', -2000],
                ['15/05/2025', 'PIX RECEBIDO - Doação', 1000],
                ['18/05/2025', 'DEBITO AUTOMATICO - Aluguel', -1500],
                ['20/05/2025', 'TED RECEBIDA - Patrocínio', 3500],
                ['25/05/2025', 'COMPRA CARTAO - Material', -3000],
                ['30/05/2025', 'TARIFA BANCARIA', -89.90]
            ];
            break;
            
        case 'estoqueEntradas':
            colunas = ['data', 'item', 'quantidade', 'origem'];
            exemplos = [
                ['05/05/2025', 'Camisetas', 100, 'Doação Empresa ABC'],
                ['10/05/2025', 'Bolas de Futebol', 50, 'Compra Fornecedor XYZ'],
                ['15/05/2025', 'Kits Escolares', 200, 'Doação Secretaria Educação']
            ];
            break;
            
        case 'estoqueSaidas':
            colunas = ['data', 'item', 'quantidade', 'destino'];
            exemplos = [
                ['08/05/2025', 'Camisetas', 60, 'Evento Comunitário'],
                ['12/05/2025', 'Bolas de Futebol', 30, 'Escola Municipal'],
                ['20/05/2025', 'Kits Escolares', 150, 'Distribuição Comunidade']
            ];
            break;
            
        default:
            console.error(`Tipo de modelo desconhecido: ${tipo}`);
            return;
    }
    
    // Cria a planilha com cabeçalho
    const ws = XLSX.utils.aoa_to_sheet([colunas]);
    
    // Adiciona exemplos
    if (exemplos.length > 0) {
        XLSX.utils.sheet_add_aoa(ws, exemplos, { origin: 1 });
    }
    
    // Adiciona a planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo');
    
    // Gera o arquivo e faz o download
    XLSX.writeFile(wb, `Modelo_${tipo}.xlsx`);
    
    console.log(`Modelo Excel para ${tipo} gerado com sucesso.`);
}

// --- Funções auxiliares para adicionar abas ao workbook ---

/**
 * Adiciona uma aba de resumo financeiro ao workbook
 * @param {Object} wb - Workbook do Excel
 * @param {Object} dados - Dados da conciliação financeira
 */
function adicionarAbaResumoFinanceiro(wb, dados) {
    const resumo = dados.resumo || {};
    
    // Prepara os dados para a aba
    const aoa = [
        ['RESUMO DA CONCILIAÇÃO FINANCEIRA'],
        [],
        ['Descrição', 'Valor', 'Percentual'],
        ['Total Interno', formatarValorExcel(resumo.totalInterno), '100%'],
        ['Total Extrato', formatarValorExcel(resumo.totalExtrato), '100%'],
        ['Conciliado', formatarValorExcel(resumo.totalConciliado), formatarPercentualExcel(resumo.percentualConciliado)],
        ['Pendente', formatarValorExcel(resumo.totalPendente), formatarPercentualExcel(resumo.totalPendente / resumo.totalInterno * 100)],
        ['Divergente', formatarValorExcel(resumo.totalDivergente), formatarPercentualExcel(resumo.totalDivergente / resumo.totalInterno * 100)],
        ['Não Identificado', formatarValorExcel(resumo.totalNaoIdentificado), formatarPercentualExcel(resumo.totalNaoIdentificado / Math.abs(resumo.totalExtrato) * 100)],
        [],
        ['Diferença Total', formatarValorExcel(resumo.diferencaTotal), formatarPercentualExcel(Math.abs(resumo.diferencaTotal) / Math.abs(resumo.totalInterno) * 100)],
        [],
        ['Data do Relatório', formatarDataExcel(new Date())]
    ];
    
    // Cria a planilha
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    
    // Adiciona a planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Resumo Financeiro');
}

/**
 * Adiciona uma aba de lançamentos internos ao workbook
 * @param {Object} wb - Workbook do Excel
 * @param {Array} lancamentos - Array de lançamentos internos
 */
function adicionarAbaLancamentosInternos(wb, lancamentos) {
    // Prepara o cabeçalho
    const cabecalho = ['Data', 'Descrição', 'Valor', 'Tipo', 'Status'];
    
    // Prepara os dados
    const dados = lancamentos.map(l => [
        formatarDataExcel(l.data),
        l.descricao,
        formatarValorExcel(l.valor),
        l.tipo === 'entrada' ? 'Entrada' : 'Saída',
        formatarStatusExcel(l.statusConciliacao)
    ]);
    
    // Cria a planilha
    const ws = XLSX.utils.aoa_to_sheet([cabecalho, ...dados]);
    
    // Adiciona a planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Lançamentos Internos');
}

/**
 * Adiciona uma aba de extrato ao workbook
 * @param {Object} wb - Workbook do Excel
 * @param {Array} extrato - Array de lançamentos do extrato
 */
function adicionarAbaExtrato(wb, extrato) {
    // Prepara o cabeçalho
    const cabecalho = ['Data', 'Descrição', 'Valor', 'Status'];
    
    // Prepara os dados
    const dados = extrato.map(l => [
        formatarDataExcel(l.data),
        l.descricao,
        formatarValorExcel(l.valor),
        formatarStatusExcel(l.statusConciliacao)
    ]);
    
    // Cria a planilha
    const ws = XLSX.utils.aoa_to_sheet([cabecalho, ...dados]);
    
    // Adiciona a planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Extrato Bancário');
}

/**
 * Adiciona uma aba de gaps financeiros ao workbook
 * @param {Object} wb - Workbook do Excel
 * @param {Array} gaps - Array de gaps financeiros
 */
function adicionarAbaGapsFinanceiros(wb, gaps) {
    // Prepara o cabeçalho
    const cabecalho = ['Tipo', 'Descrição', 'Valor', 'Data', 'Status', 'Instrução'];
    
    // Prepara os dados
    const dados = gaps.map(g => {
        // Determina qual valor mostrar
        let valor = g.valor;
        if (g.tipo === 'Diferença de Valor') {
            valor = g.diferenca;
        }
        
        return [
            g.tipo,
            g.descricao,
            formatarValorExcel(valor),
            formatarDataExcel(g.data || g.dataInterna),
            formatarStatusExcel(g.status),
            g.instrucao
        ];
    });
    
    // Cria a planilha
    const ws = XLSX.utils.aoa_to_sheet([cabecalho, ...dados]);
    
    // Adiciona a planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Gaps Financeiros');
}

/**
 * Adiciona uma aba de resumo de bens ao workbook
 * @param {Object} wb - Workbook do Excel
 * @param {Object} dados - Dados da conciliação de bens
 */
function adicionarAbaResumoBens(wb, dados) {
    const resumo = dados.resumo || {};
    
    // Prepara os dados para a aba
    const aoa = [
        ['RESUMO DA CONCILIAÇÃO DE BENS'],
        [],
        ['Descrição', 'Quantidade', 'Percentual'],
        ['Total de Itens', resumo.totalItens, '100%'],
        ['Itens Conciliados', resumo.totalConciliado, formatarPercentualExcel(resumo.percentualConciliado)],
        ['Itens Pendentes', resumo.totalPendente, formatarPercentualExcel(resumo.totalPendente / resumo.totalItens * 100)],
        ['Itens Divergentes', resumo.totalDivergente, formatarPercentualExcel(resumo.totalDivergente / resumo.totalItens * 100)],
        [],
        ['Total de Entradas', resumo.totalQuantidadeEntradas, ''],
        ['Total de Saídas', resumo.totalQuantidadeSaidas, ''],
        ['Saldo Total', resumo.saldoTotal, ''],
        [],
        ['Data do Relatório', formatarDataExcel(new Date())]
    ];
    
    // Cria a planilha
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    
    // Adiciona a planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Resumo Bens');
}

/**
 * Adiciona uma aba de entradas de estoque ao workbook
 * @param {Object} wb - Workbook do Excel
 * @param {Array} entradas - Array de entradas de estoque
 */
function adicionarAbaEntradasEstoque(wb, entradas) {
    // Prepara o cabeçalho
    const cabecalho = ['Data', 'Item', 'Quantidade', 'Origem', 'Status'];
    
    // Prepara os dados
    const dados = entradas.map(e => [
        formatarDataExcel(e.data),
        e.item,
        e.quantidade,
        e.origem,
        formatarStatusExcel(e.status || 'pendente')
    ]);
    
    // Cria a planilha
    const ws = XLSX.utils.aoa_to_sheet([cabecalho, ...dados]);
    
    // Adiciona a planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Entradas Estoque');
}

/**
 * Adiciona uma aba de saídas de estoque ao workbook
 * @param {Object} wb - Workbook do Excel
 * @param {Array} saidas - Array de saídas de estoque
 */
function adicionarAbaSaidasEstoque(wb, saidas) {
    // Prepara o cabeçalho
    const cabecalho = ['Data', 'Item', 'Quantidade', 'Destino', 'Status'];
    
    // Prepara os dados
    const dados = saidas.map(s => [
        formatarDataExcel(s.data),
        s.item,
        s.quantidade,
        s.destino,
        formatarStatusExcel(s.status || 'pendente')
    ]);
    
    // Cria a planilha
    const ws = XLSX.utils.aoa_to_sheet([cabecalho, ...dados]);
    
    // Adiciona a planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Saídas Estoque');
}

/**
 * Adiciona uma aba de saldo de estoque ao workbook
 * @param {Object} wb - Workbook do Excel
 * @param {Array} saldos - Array de saldos de estoque
 */
function adicionarAbaSaldoEstoque(wb, saldos) {
    // Prepara o cabeçalho
    const cabecalho = ['Item', 'Entradas', 'Saídas', 'Saldo', 'Status', 'Observação'];
    
    // Prepara os dados
    const dados = saldos.map(s => [
        s.item,
        s.totalEntradas,
        s.totalSaidas,
        s.saldo,
        formatarStatusExcel(s.status),
        s.observacao
    ]);
    
    // Cria a planilha
    const ws = XLSX.utils.aoa_to_sheet([cabecalho, ...dados]);
    
    // Adiciona a planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Saldo Estoque');
}

/**
 * Adiciona uma aba de gaps de bens ao workbook
 * @param {Object} wb - Workbook do Excel
 * @param {Array} gaps - Array de gaps de bens
 */
function adicionarAbaGapsBens(wb, gaps) {
    // Prepara o cabeçalho
    const cabecalho = ['Tipo', 'Item', 'Quantidade', 'Data', 'Status', 'Instrução'];
    
    // Prepara os dados
    const dados = gaps.map(g => [
        g.tipo,
        g.item,
        g.quantidade,
        formatarDataExcel(g.data),
        formatarStatusExcel(g.status),
        g.instrucao
    ]);
    
    // Cria a planilha
    const ws = XLSX.utils.aoa_to_sheet([cabecalho, ...dados]);
    
    // Adiciona a planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Gaps Bens');
}

/**
 * Adiciona uma aba de resumo geral ao workbook
 * @param {Object} wb - Workbook do Excel
 * @param {Object} dadosFinanceiros - Dados da conciliação financeira
 * @param {Object} dadosBens - Dados da conciliação de bens
 */
function adicionarAbaResumoGeral(wb, dadosFinanceiros, dadosBens) {
    const resumoFinanceiro = dadosFinanceiros.resumo || {};
    const resumoBens = dadosBens.resumo || {};
    
    // Calcula o percentual geral de conciliação
    const percentualFinanceiro = resumoFinanceiro.percentualConciliado || 0;
    const percentualBens = resumoBens.percentualConciliado || 0;
    const percentualGeral = (percentualFinanceiro + percentualBens) / 2;
    
    // Prepara os dados para a aba
    const aoa = [
        ['RESUMO GERAL DA CONCILIAÇÃO'],
        [],
        ['Tipo', 'Percentual Conciliado', 'Total Divergências'],
        ['Financeira', formatarPercentualExcel(percentualFinanceiro), dadosFinanceiros.gaps?.length || 0],
        ['Bens', formatarPercentualExcel(percentualBens), dadosBens.gaps?.length || 0],
        ['Geral', formatarPercentualExcel(percentualGeral), (dadosFinanceiros.gaps?.length || 0) + (dadosBens.gaps?.length || 0)],
        [],
        ['Resumo Financeiro'],
        ['Total Interno', formatarValorExcel(resumoFinanceiro.totalInterno)],
        ['Total Extrato', formatarValorExcel(resumoFinanceiro.totalExtrato)],
        ['Diferença', formatarValorExcel(resumoFinanceiro.diferencaTotal)],
        [],
        ['Resumo Bens'],
        ['Total de Itens', resumoBens.totalItens],
        ['Entradas', resumoBens.totalQuantidadeEntradas],
        ['Saídas', resumoBens.totalQuantidadeSaidas],
        ['Saldo', resumoBens.saldoTotal],
        [],
        ['Data do Relatório', formatarDataExcel(new Date())]
    ];
    
    // Cria a planilha
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    
    // Adiciona a planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Resumo Geral');
}

// --- Funções utilitárias para formatação ---

/**
 * Formata uma data para exibição no Excel
 * @param {Date} data - Data a ser formatada
 * @returns {string} Data formatada
 */
function formatarDataExcel(data) {
    if (!data || !(data instanceof Date) || isNaN(data)) return '';
    
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    
    return `${dia}/${mes}/${ano}`;
}

/**
 * Formata um valor para exibição no Excel
 * @param {number} valor - Valor a ser formatado
 * @returns {number|string} Valor formatado
 */
function formatarValorExcel(valor) {
    if (valor === null || valor === undefined || isNaN(valor)) return 0;
    
    // Retorna o valor numérico para que o Excel possa formatá-lo
    return valor;
}

/**
 * Formata um percentual para exibição no Excel
 * @param {number} valor - Valor percentual
 * @returns {string} Percentual formatado
 */
function formatarPercentualExcel(valor) {
    if (valor === null || valor === undefined || isNaN(valor)) return '0%';
    
    return `${valor.toFixed(1)}%`;
}

/**
 * Formata um status para exibição no Excel
 * @param {string} status - Status de conciliação
 * @returns {string} Status formatado
 */
function formatarStatusExcel(status) {
    if (!status) return 'Desconhecido';
    
    const statusMap = {
        'conciliado': 'Conciliado',
        'pendente': 'Pendente',
        'divergente': 'Divergente',
        'nao_identificado': 'Não Identificado'
    };
    
    return statusMap[status] || status;
}

/**
 * Formata uma data para uso em nome de arquivo
 * @param {Date} data - Data a ser formatada
 * @returns {string} Data formatada
 */
function formatarDataArquivo(data) {
    if (!data || !(data instanceof Date) || isNaN(data)) return '';
    
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    
    return `${dia}-${mes}-${ano}`;
}

// Exporta as funções para uso no conciliacao.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        exportarRelatorioFinanceiro,
        exportarRelatorioBens,
        exportarRelatorioCompleto,
        gerarModeloExcel
    };
} else {
    // No ambiente do navegador, adiciona ao objeto window
    window.ExportacaoExcel = {
        exportarRelatorioFinanceiro,
        exportarRelatorioBens,
        exportarRelatorioCompleto,
        gerarModeloExcel
    };
}
