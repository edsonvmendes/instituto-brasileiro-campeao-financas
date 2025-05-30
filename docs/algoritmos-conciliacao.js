/**
 * Algoritmos de Conciliação para o Instituto Brasileiro Campeão
 * 
 * Este arquivo contém as funções para conciliação financeira e de bens,
 * adaptadas do TypeScript para JavaScript puro.
 */

// Constantes para configuração da conciliação
const CONFIG = {
    // Tolerância em dias para considerar datas próximas como correspondentes
    TOLERANCIA_DIAS: 3,
    
    // Tolerância em percentual para considerar valores próximos como correspondentes
    TOLERANCIA_VALOR_PERCENTUAL: 0.01, // 1%
    
    // Valor mínimo para considerar como taxa bancária
    VALOR_MINIMO_TAXA: 5.00,
    
    // Valor máximo para considerar como taxa bancária
    VALOR_MAXIMO_TAXA: 200.00
};

/**
 * Executa a conciliação financeira entre lançamentos internos e extrato bancário
 * @param {Array} entradas - Array de objetos com as entradas financeiras
 * @param {Array} saidas - Array de objetos com as saídas financeiras
 * @param {Array} extrato - Array de objetos com os lançamentos do extrato bancário
 * @returns {Object} Resultado da conciliação financeira
 */
function executarConciliacaoFinanceira(entradas, saidas, extrato) {
    console.log('Executando conciliação financeira...');
    console.log(`Entradas: ${entradas.length}, Saídas: ${saidas.length}, Extrato: ${extrato.length}`);
    
    // Normaliza os dados para garantir formato consistente
    const entradasNormalizadas = normalizarDadosFinanceiros(entradas, 'entrada');
    const saidasNormalizadas = normalizarDadosFinanceiros(saidas, 'saida');
    const extratoNormalizado = normalizarDadosExtrato(extrato);
    
    // Combina entradas e saídas em um único array de lançamentos internos
    const lancamentosInternos = [...entradasNormalizadas, ...saidasNormalizadas];
    
    // Cria cópias para manipulação durante a conciliação
    const lancamentosInternosCopia = [...lancamentosInternos];
    const extratoCopia = [...extratoNormalizado];
    
    // Arrays para armazenar os resultados da conciliação
    const lancamentosConciliados = [];
    const lancamentosPendentes = [];
    const lancamentosDivergentes = [];
    const extratoNaoIdentificado = [];
    const gaps = [];
    
    // Primeira passagem: conciliação exata (data e valor iguais)
    conciliacaoExata(lancamentosInternosCopia, extratoCopia, lancamentosConciliados, gaps);
    
    // Segunda passagem: conciliação por proximidade de data (mesmo valor, data próxima)
    conciliacaoPorProximidadeData(lancamentosInternosCopia, extratoCopia, lancamentosConciliados, gaps);
    
    // Terceira passagem: conciliação por proximidade de valor (valor próximo, mesma data)
    conciliacaoPorProximidadeValor(lancamentosInternosCopia, extratoCopia, lancamentosConciliados, lancamentosDivergentes, gaps);
    
    // Quarta passagem: identificação de taxas bancárias
    identificarTaxasBancarias(extratoCopia, extratoNaoIdentificado, gaps);
    
    // Os lançamentos que sobraram são pendentes (internos) ou não identificados (extrato)
    lancamentosInternosCopia.forEach(lancamento => {
        lancamento.statusConciliacao = 'pendente';
        lancamentosPendentes.push(lancamento);
        
        gaps.push({
            tipo: 'Lançamento Pendente',
            descricao: lancamento.descricao,
            valor: lancamento.valor,
            data: lancamento.data,
            status: 'pendente',
            instrucao: `Verifique se o ${lancamento.tipo === 'entrada' ? 'recebimento' : 'pagamento'} foi realmente efetivado ou se está agendado para data futura.`
        });
    });
    
    extratoCopia.forEach(lancamento => {
        lancamento.statusConciliacao = 'nao_identificado';
        extratoNaoIdentificado.push(lancamento);
        
        gaps.push({
            tipo: 'Lançamento Não Identificado',
            descricao: lancamento.descricao,
            valor: lancamento.valor,
            data: lancamento.data,
            status: 'nao_identificado',
            instrucao: 'Registre este lançamento no sistema interno ou verifique se é uma transação desconhecida.'
        });
    });
    
    // Combina todos os lançamentos processados
    const todosLancamentosInternos = [...lancamentosConciliados.map(l => l.interno), ...lancamentosPendentes, ...lancamentosDivergentes.map(l => l.interno)];
    const todosLancamentosExtrato = [...lancamentosConciliados.map(l => l.extrato), ...extratoNaoIdentificado, ...lancamentosDivergentes.map(l => l.extrato)];
    
    // Calcula totais para o resumo
    const totalInterno = calcularTotal(todosLancamentosInternos);
    const totalExtrato = calcularTotal(todosLancamentosExtrato);
    const totalConciliado = calcularTotal(lancamentosConciliados.map(l => l.interno));
    const totalPendente = calcularTotal(lancamentosPendentes);
    const totalDivergente = calcularTotal(lancamentosDivergentes.map(l => l.interno));
    const totalNaoIdentificado = calcularTotal(extratoNaoIdentificado);
    
    // Ordena os gaps por impacto (valor absoluto) decrescente
    gaps.sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor));
    
    // Resultado final da conciliação
    const resultado = {
        lancamentosInternos: todosLancamentosInternos,
        extrato: todosLancamentosExtrato,
        gaps: gaps,
        resumo: {
            totalInterno,
            totalExtrato,
            totalConciliado,
            totalPendente,
            totalDivergente,
            totalNaoIdentificado,
            percentualConciliado: totalInterno > 0 ? (totalConciliado / totalInterno) * 100 : 0,
            diferencaTotal: totalInterno - totalExtrato
        }
    };
    
    console.log('Conciliação financeira concluída:', resultado.resumo);
    return resultado;
}

/**
 * Executa a conciliação de bens (estoque) entre entradas e saídas de materiais
 * @param {Array} entradas - Array de objetos com as entradas de estoque
 * @param {Array} saidas - Array de objetos com as saídas de estoque
 * @returns {Object} Resultado da conciliação de bens
 */
function executarConciliacaoBens(entradas, saidas) {
    console.log('Executando conciliação de bens...');
    console.log(`Entradas: ${entradas.length}, Saídas: ${saidas.length}`);
    
    // Normaliza os dados para garantir formato consistente
    const entradasNormalizadas = normalizarDadosEstoque(entradas, 'entrada');
    const saidasNormalizadas = normalizarDadosEstoque(saidas, 'saida');
    
    // Agrupa por item para calcular saldos
    const itensPorNome = agruparItensPorNome(entradasNormalizadas, saidasNormalizadas);
    
    // Arrays para armazenar os resultados
    const saldoEstoque = [];
    const gaps = [];
    
    // Calcula saldo e status para cada item
    Object.entries(itensPorNome).forEach(([nomeItem, dados]) => {
        const totalEntradas = dados.entradas.reduce((sum, item) => sum + item.quantidade, 0);
        const totalSaidas = dados.saidas.reduce((sum, item) => sum + item.quantidade, 0);
        const saldo = totalEntradas - totalSaidas;
        
        let status = 'conciliado';
        let observacao = 'Saldo correto.';
        
        if (saldo > 0) {
            status = 'pendente';
            observacao = `Há ${saldo} unidades disponíveis em estoque.`;
        } else if (saldo < 0) {
            status = 'divergente';
            observacao = `Saldo negativo de ${Math.abs(saldo)} unidades. Verifique se todas as entradas foram registradas.`;
            
            gaps.push({
                tipo: 'Saldo Negativo',
                item: nomeItem,
                quantidade: Math.abs(saldo),
                status: 'divergente',
                instrucao: `Registre a entrada de ${Math.abs(saldo)} unidades ou verifique se houve erro no registro de saídas.`
            });
        }
        
        saldoEstoque.push({
            item: nomeItem,
            totalEntradas,
            totalSaidas,
            saldo,
            status,
            observacao
        });
    });
    
    // Identifica entradas sem saída (estoque parado)
    entradasNormalizadas.forEach(entrada => {
        const item = saldoEstoque.find(i => i.item === entrada.item);
        if (item && item.saldo > 0) {
            const diasEmEstoque = calcularDiasEmEstoque(entrada.data);
            if (diasEmEstoque > 30) { // Mais de 30 dias em estoque
                gaps.push({
                    tipo: 'Estoque Parado',
                    item: entrada.item,
                    quantidade: entrada.quantidade,
                    data: entrada.data,
                    status: 'pendente',
                    instrucao: `Item em estoque há ${diasEmEstoque} dias. Considere distribuir ou verificar se a saída não foi registrada.`
                });
            }
        }
    });
    
    // Ordena o saldo de estoque por nome do item
    saldoEstoque.sort((a, b) => a.item.localeCompare(b.item));
    
    // Ordena os gaps por impacto (quantidade) decrescente
    gaps.sort((a, b) => b.quantidade - a.quantidade);
    
    // Calcula totais para o resumo
    const totalItens = saldoEstoque.length;
    const totalConciliado = saldoEstoque.filter(item => item.status === 'conciliado').length;
    const totalPendente = saldoEstoque.filter(item => item.status === 'pendente').length;
    const totalDivergente = saldoEstoque.filter(item => item.status === 'divergente').length;
    const totalQuantidadeEntradas = saldoEstoque.reduce((sum, item) => sum + item.totalEntradas, 0);
    const totalQuantidadeSaidas = saldoEstoque.reduce((sum, item) => sum + item.totalSaidas, 0);
    
    // Resultado final da conciliação
    const resultado = {
        entradas: entradasNormalizadas,
        saidas: saidasNormalizadas,
        saldoEstoque,
        gaps,
        resumo: {
            totalItens,
            totalConciliado,
            totalPendente,
            totalDivergente,
            totalQuantidadeEntradas,
            totalQuantidadeSaidas,
            saldoTotal: totalQuantidadeEntradas - totalQuantidadeSaidas,
            percentualConciliado: totalItens > 0 ? (totalConciliado / totalItens) * 100 : 0
        }
    };
    
    console.log('Conciliação de bens concluída:', resultado.resumo);
    return resultado;
}

// --- Funções auxiliares para conciliação financeira ---

/**
 * Normaliza os dados financeiros para formato padrão
 * @param {Array} dados - Array de objetos com dados financeiros
 * @param {string} tipo - Tipo de lançamento ('entrada' ou 'saida')
 * @returns {Array} Dados normalizados
 */
function normalizarDadosFinanceiros(dados, tipo) {
    return dados.map(item => {
        // Garante que a data seja um objeto Date
        const data = item.data instanceof Date ? item.data : converterParaData(item.data);
        
        // Garante que o valor seja um número
        let valor = converterParaNumero(item.valor);
        
        // Para saídas, garante que o valor seja negativo
        if (tipo === 'saida' && valor > 0) {
            valor = -valor;
        }
        
        // Para entradas, garante que o valor seja positivo
        if (tipo === 'entrada' && valor < 0) {
            valor = Math.abs(valor);
        }
        
        return {
            data,
            descricao: String(item.descricao || '').trim(),
            valor,
            tipo,
            statusConciliacao: 'pendente' // Status inicial
        };
    }).filter(item => item.data && !isNaN(item.valor)); // Remove itens com data inválida ou valor NaN
}

/**
 * Normaliza os dados do extrato bancário para formato padrão
 * @param {Array} dados - Array de objetos com dados do extrato
 * @returns {Array} Dados normalizados
 */
function normalizarDadosExtrato(dados) {
    return dados.map(item => {
        // Garante que a data seja um objeto Date
        const data = item.data instanceof Date ? item.data : converterParaData(item.data);
        
        // Garante que o valor seja um número
        const valor = converterParaNumero(item.valor);
        
        return {
            data,
            descricao: String(item.descricao || '').trim(),
            valor,
            statusConciliacao: 'nao_identificado' // Status inicial
        };
    }).filter(item => item.data && !isNaN(item.valor)); // Remove itens com data inválida ou valor NaN
}

/**
 * Realiza a primeira passagem de conciliação: correspondência exata de data e valor
 */
function conciliacaoExata(lancamentosInternos, extrato, lancamentosConciliados, gaps) {
    for (let i = lancamentosInternos.length - 1; i >= 0; i--) {
        const lancamentoInterno = lancamentosInternos[i];
        
        for (let j = extrato.length - 1; j >= 0; j--) {
            const lancamentoExtrato = extrato[j];
            
            // Verifica se data e valor são exatamente iguais
            if (
                saoDatasMesmoDia(lancamentoInterno.data, lancamentoExtrato.data) &&
                lancamentoInterno.valor === lancamentoExtrato.valor
            ) {
                // Marca como conciliado
                lancamentoInterno.statusConciliacao = 'conciliado';
                lancamentoExtrato.statusConciliacao = 'conciliado';
                
                // Adiciona ao array de conciliados
                lancamentosConciliados.push({
                    interno: lancamentoInterno,
                    extrato: lancamentoExtrato
                });
                
                // Remove dos arrays originais
                lancamentosInternos.splice(i, 1);
                extrato.splice(j, 1);
                
                break; // Passa para o próximo lançamento interno
            }
        }
    }
}

/**
 * Realiza a segunda passagem de conciliação: mesmo valor, data próxima
 */
function conciliacaoPorProximidadeData(lancamentosInternos, extrato, lancamentosConciliados, gaps) {
    for (let i = lancamentosInternos.length - 1; i >= 0; i--) {
        const lancamentoInterno = lancamentosInternos[i];
        
        for (let j = extrato.length - 1; j >= 0; j--) {
            const lancamentoExtrato = extrato[j];
            
            // Verifica se o valor é igual e a data está dentro da tolerância
            if (
                lancamentoInterno.valor === lancamentoExtrato.valor &&
                estaoDatasDentroTolerancia(lancamentoInterno.data, lancamentoExtrato.data, CONFIG.TOLERANCIA_DIAS)
            ) {
                // Marca como conciliado
                lancamentoInterno.statusConciliacao = 'conciliado';
                lancamentoExtrato.statusConciliacao = 'conciliado';
                
                // Adiciona ao array de conciliados
                lancamentosConciliados.push({
                    interno: lancamentoInterno,
                    extrato: lancamentoExtrato
                });
                
                // Adiciona um gap de diferença de data
                if (!saoDatasMesmoDia(lancamentoInterno.data, lancamentoExtrato.data)) {
                    gaps.push({
                        tipo: 'Diferença de Data',
                        descricao: lancamentoInterno.descricao,
                        valor: lancamentoInterno.valor,
                        dataInterna: lancamentoInterno.data,
                        dataExtrato: lancamentoExtrato.data,
                        status: 'conciliado',
                        instrucao: 'Considere ajustar a data do lançamento interno para corresponder ao extrato.'
                    });
                }
                
                // Remove dos arrays originais
                lancamentosInternos.splice(i, 1);
                extrato.splice(j, 1);
                
                break; // Passa para o próximo lançamento interno
            }
        }
    }
}

/**
 * Realiza a terceira passagem de conciliação: valor próximo, mesma data
 */
function conciliacaoPorProximidadeValor(lancamentosInternos, extrato, lancamentosConciliados, lancamentosDivergentes, gaps) {
    for (let i = lancamentosInternos.length - 1; i >= 0; i--) {
        const lancamentoInterno = lancamentosInternos[i];
        
        for (let j = extrato.length - 1; j >= 0; j--) {
            const lancamentoExtrato = extrato[j];
            
            // Verifica se a data é a mesma e o valor está dentro da tolerância
            if (
                saoDatasMesmoDia(lancamentoInterno.data, lancamentoExtrato.data) &&
                estaoValoresDentroTolerancia(lancamentoInterno.valor, lancamentoExtrato.valor, CONFIG.TOLERANCIA_VALOR_PERCENTUAL)
            ) {
                // Marca como divergente
                lancamentoInterno.statusConciliacao = 'divergente';
                lancamentoExtrato.statusConciliacao = 'divergente';
                
                // Adiciona ao array de divergentes
                lancamentosDivergentes.push({
                    interno: lancamentoInterno,
                    extrato: lancamentoExtrato
                });
                
                // Adiciona um gap de diferença de valor
                const diferenca = lancamentoExtrato.valor - lancamentoInterno.valor;
                gaps.push({
                    tipo: 'Diferença de Valor',
                    descricao: lancamentoInterno.descricao,
                    valorInterno: lancamentoInterno.valor,
                    valorExtrato: lancamentoExtrato.valor,
                    diferenca: diferenca,
                    data: lancamentoInterno.data,
                    status: 'divergente',
                    instrucao: diferenca > 0 
                        ? 'O valor no extrato é maior. Verifique se há taxas incluídas ou ajuste o valor no sistema.'
                        : 'O valor no extrato é menor. Verifique se houve desconto ou ajuste o valor no sistema.'
                });
                
                // Remove dos arrays originais
                lancamentosInternos.splice(i, 1);
                extrato.splice(j, 1);
                
                break; // Passa para o próximo lançamento interno
            }
        }
    }
}

/**
 * Identifica possíveis taxas bancárias no extrato
 */
function identificarTaxasBancarias(extrato, extratoNaoIdentificado, gaps) {
    for (let i = extrato.length - 1; i >= 0; i--) {
        const lancamento = extrato[i];
        
        // Verifica se é uma possível taxa bancária (valor negativo dentro de um intervalo)
        if (
            lancamento.valor < 0 &&
            Math.abs(lancamento.valor) >= CONFIG.VALOR_MINIMO_TAXA &&
            Math.abs(lancamento.valor) <= CONFIG.VALOR_MAXIMO_TAXA &&
            (
                lancamento.descricao.toLowerCase().includes('tarifa') ||
                lancamento.descricao.toLowerCase().includes('taxa') ||
                lancamento.descricao.toLowerCase().includes('cobran') ||
                lancamento.descricao.toLowerCase().includes('manutencao') ||
                lancamento.descricao.toLowerCase().includes('cesta') ||
                lancamento.descricao.toLowerCase().includes('pacote') ||
                lancamento.descricao.toLowerCase().includes('ted') ||
                lancamento.descricao.toLowerCase().includes('doc')
            )
        ) {
            // Marca como não identificado (será tratado depois)
            lancamento.statusConciliacao = 'nao_identificado';
            extratoNaoIdentificado.push(lancamento);
            
            // Adiciona um gap de taxa bancária
            gaps.push({
                tipo: 'Taxa Bancária',
                descricao: lancamento.descricao,
                valor: lancamento.valor,
                data: lancamento.data,
                status: 'nao_identificado',
                instrucao: 'Registre esta taxa como despesa administrativa na categoria "Taxas Bancárias".'
            });
            
            // Remove do array original
            extrato.splice(i, 1);
        }
    }
}

// --- Funções auxiliares para conciliação de bens ---

/**
 * Normaliza os dados de estoque para formato padrão
 * @param {Array} dados - Array de objetos com dados de estoque
 * @param {string} tipo - Tipo de movimento ('entrada' ou 'saida')
 * @returns {Array} Dados normalizados
 */
function normalizarDadosEstoque(dados, tipo) {
    return dados.map(item => {
        // Garante que a data seja um objeto Date
        const data = item.data instanceof Date ? item.data : converterParaData(item.data);
        
        // Garante que a quantidade seja um número positivo
        const quantidade = Math.abs(converterParaNumero(item.quantidade));
        
        return {
            data,
            item: String(item.item || '').trim(),
            quantidade,
            origem: String(item.origem || '').trim(),
            destino: String(item.destino || '').trim(),
            tipo
        };
    }).filter(item => item.data && !isNaN(item.quantidade) && item.item); // Remove itens inválidos
}

/**
 * Agrupa itens de estoque por nome para calcular saldos
 */
function agruparItensPorNome(entradas, saidas) {
    const itensPorNome = {};
    
    // Processa entradas
    entradas.forEach(entrada => {
        const nomeNormalizado = normalizarNomeItem(entrada.item);
        if (!itensPorNome[nomeNormalizado]) {
            itensPorNome[nomeNormalizado] = {
                entradas: [],
                saidas: []
            };
        }
        itensPorNome[nomeNormalizado].entradas.push(entrada);
    });
    
    // Processa saídas
    saidas.forEach(saida => {
        const nomeNormalizado = normalizarNomeItem(saida.item);
        if (!itensPorNome[nomeNormalizado]) {
            itensPorNome[nomeNormalizado] = {
                entradas: [],
                saidas: []
            };
        }
        itensPorNome[nomeNormalizado].saidas.push(saida);
    });
    
    return itensPorNome;
}

/**
 * Normaliza o nome do item para evitar duplicidades por diferenças de capitalização ou espaços
 */
function normalizarNomeItem(nome) {
    return String(nome || '')
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/\s+/g, ' '); // Normaliza espaços
}

/**
 * Calcula quantos dias um item está em estoque
 */
function calcularDiasEmEstoque(dataEntrada) {
    const hoje = new Date();
    const diffTime = Math.abs(hoje - dataEntrada);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// --- Funções utilitárias gerais ---

/**
 * Verifica se duas datas são do mesmo dia
 */
function saoDatasMesmoDia(data1, data2) {
    return (
        data1.getDate() === data2.getDate() &&
        data1.getMonth() === data2.getMonth() &&
        data1.getFullYear() === data2.getFullYear()
    );
}

/**
 * Verifica se duas datas estão dentro da tolerância especificada
 */
function estaoDatasDentroTolerancia(data1, data2, toleranciaDias) {
    const diffTime = Math.abs(data2 - data1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= toleranciaDias;
}

/**
 * Verifica se dois valores estão dentro da tolerância percentual especificada
 */
function estaoValoresDentroTolerancia(valor1, valor2, toleranciaPercentual) {
    const maiorValor = Math.max(Math.abs(valor1), Math.abs(valor2));
    const diferenca = Math.abs(valor1 - valor2);
    return diferenca <= (maiorValor * toleranciaPercentual);
}

/**
 * Calcula o total de um array de lançamentos
 */
function calcularTotal(lancamentos) {
    return lancamentos.reduce((total, lancamento) => total + lancamento.valor, 0);
}

/**
 * Converte um valor para data
 */
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
             // Implementação simplificada para números seriais do Excel
             // Excel: dias desde 01/01/1900 (Windows) ou 01/01/1904 (Mac)
             // Para uma implementação completa, use biblioteca como XLSX
             const dataBase = new Date(1900, 0, 1); // 01/01/1900
             const dataExcel = new Date(dataBase.getTime() + (valor - 1) * 24 * 60 * 60 * 1000);
             if (!isNaN(dataExcel)) return dataExcel;
        }

    } catch (e) {
        console.warn(`Erro ao converter data: ${valor}`, e);
    }
    return null; // Retorna null se não conseguir converter
}

/**
 * Converte um valor para número
 */
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

// Exporta as funções para uso no conciliacao.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        executarConciliacaoFinanceira,
        executarConciliacaoBens
    };
} else {
    // No ambiente do navegador, adiciona ao objeto window
    window.AlgoritmosConciliacao = {
        executarConciliacaoFinanceira,
        executarConciliacaoBens
    };
}
