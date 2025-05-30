/**
 * Funções de Renderização para o Módulo de Conciliação
 * 
 * Este arquivo contém as funções para renderizar os elementos visuais
 * do módulo de conciliação, como tabelas, resumos, gráficos e status.
 */

// --- Funções de Renderização para Conciliação Financeira ---

/**
 * Renderiza os cards de resumo da conciliação financeira
 * @param {Object} dados - Dados da conciliação financeira
 */
function renderizarResumoFinanceiro(dados) {
    console.log('Renderizando resumo financeiro...');
    const container = document.getElementById('resumo-financeiro');
    if (!container) return;
    
    const resumo = dados.resumo || {};
    
    container.innerHTML = `
        <div class="resumo-card resumo-card-conciliado">
            <h3>Conciliado</h3>
            <div class="valor">${formatarValorMonetario(resumo.totalConciliado || 0)}</div>
            <div class="percentual">
                <i class="fas fa-chart-pie"></i>
                ${formatarPercentual(resumo.percentualConciliado || 0)}
            </div>
        </div>
        
        <div class="resumo-card resumo-card-pendente">
            <h3>Pendente</h3>
            <div class="valor">${formatarValorMonetario(resumo.totalPendente || 0)}</div>
            <div class="percentual">
                <i class="fas fa-clock"></i>
                ${formatarPercentual((resumo.totalPendente / resumo.totalInterno * 100) || 0)}
            </div>
        </div>
        
        <div class="resumo-card resumo-card-divergente">
            <h3>Divergente</h3>
            <div class="valor">${formatarValorMonetario(resumo.totalDivergente || 0)}</div>
            <div class="percentual">
                <i class="fas fa-exclamation-triangle"></i>
                ${formatarPercentual((resumo.totalDivergente / resumo.totalInterno * 100) || 0)}
            </div>
        </div>
        
        <div class="resumo-card resumo-card-nao-identificado">
            <h3>Não Identificado</h3>
            <div class="valor">${formatarValorMonetario(resumo.totalNaoIdentificado || 0)}</div>
            <div class="percentual">
                <i class="fas fa-question-circle"></i>
                ${formatarPercentual((resumo.totalNaoIdentificado / Math.abs(resumo.totalExtrato) * 100) || 0)}
            </div>
        </div>
        
        <div class="resumo-card resumo-card-saldo">
            <h3>Diferença Total</h3>
            <div class="valor">${formatarValorMonetario(resumo.diferencaTotal || 0)}</div>
            <div class="percentual">
                <i class="fas fa-balance-scale"></i>
                ${formatarPercentual((Math.abs(resumo.diferencaTotal) / Math.abs(resumo.totalInterno) * 100) || 0)}
            </div>
        </div>
    `;
}

/**
 * Renderiza a tabela de lançamentos internos
 * @param {Array} lancamentos - Array de lançamentos internos
 */
function renderizarTabelaLancamentosInternos(lancamentos) {
    console.log('Renderizando tabela de lançamentos internos...');
    const tbody = document.querySelector('#tabela-lancamentos tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!lancamentos || lancamentos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">Nenhum lançamento interno encontrado.</td>
            </tr>
        `;
        return;
    }
    
    lancamentos.forEach(lancamento => {
        const tr = document.createElement('tr');
        
        // Classe da linha baseada no status
        if (lancamento.statusConciliacao) {
            tr.classList.add(`status-${lancamento.statusConciliacao}-row`);
        }
        
        tr.innerHTML = `
            <td>${formatarData(lancamento.data)}</td>
            <td>${lancamento.descricao || '-'}</td>
            <td class="${lancamento.valor < 0 ? 'text-danger' : 'text-success'}">${formatarValorMonetario(lancamento.valor)}</td>
            <td>
                <span class="status-tag ${getStatusClass(lancamento.statusConciliacao)}">
                    <i class="${getStatusIcon(lancamento.statusConciliacao)}"></i>
                    ${formatarStatus(lancamento.statusConciliacao)}
                </span>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Renderiza a tabela de extrato bancário
 * @param {Array} extrato - Array de lançamentos do extrato
 */
function renderizarTabelaExtrato(extrato) {
    console.log('Renderizando tabela de extrato...');
    const tbody = document.querySelector('#tabela-extrato tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!extrato || extrato.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">Nenhum lançamento de extrato encontrado.</td>
            </tr>
        `;
        return;
    }
    
    extrato.forEach(lancamento => {
        const tr = document.createElement('tr');
        
        // Classe da linha baseada no status
        if (lancamento.statusConciliacao) {
            tr.classList.add(`status-${lancamento.statusConciliacao}-row`);
        }
        
        tr.innerHTML = `
            <td>${formatarData(lancamento.data)}</td>
            <td>${lancamento.descricao || '-'}</td>
            <td class="${lancamento.valor < 0 ? 'text-danger' : 'text-success'}">${formatarValorMonetario(lancamento.valor)}</td>
            <td>
                <span class="status-tag ${getStatusClass(lancamento.statusConciliacao)}">
                    <i class="${getStatusIcon(lancamento.statusConciliacao)}"></i>
                    ${formatarStatus(lancamento.statusConciliacao)}
                </span>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Renderiza a tabela de gaps financeiros
 * @param {Array} gaps - Array de gaps financeiros
 */
function renderizarTabelaGapsFinanceiros(gaps) {
    console.log('Renderizando tabela de gaps financeiros...');
    const tbody = document.querySelector('#tabela-gaps-financeiro tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!gaps || gaps.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Nenhuma divergência encontrada.</td>
            </tr>
        `;
        return;
    }
    
    gaps.forEach(gap => {
        const tr = document.createElement('tr');
        
        // Classe da linha baseada no status
        if (gap.status) {
            tr.classList.add(`status-${gap.status}-row`);
        }
        
        // Determina qual valor mostrar
        let valorExibir = gap.valor;
        if (gap.tipo === 'Diferença de Valor') {
            valorExibir = gap.diferenca;
        }
        
        tr.innerHTML = `
            <td>${gap.tipo}</td>
            <td class="${valorExibir < 0 ? 'text-danger' : 'text-success'}">${formatarValorMonetario(valorExibir)}</td>
            <td>${formatarData(gap.data || gap.dataInterna)}</td>
            <td>
                <span class="status-tag ${getStatusClass(gap.status)}">
                    <i class="${getStatusIcon(gap.status)}"></i>
                    ${formatarStatus(gap.status)}
                </span>
            </td>
            <td>${gap.instrucao || '-'}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Renderiza o status geral da conciliação
 * @param {Object} dados - Dados da conciliação
 * @param {string} tipo - Tipo de conciliação ('financeira' ou 'bens')
 */
function renderizarStatusConciliacao(dados, tipo) {
    console.log(`Renderizando status de conciliação ${tipo}...`);
    const container = document.getElementById(`status-conciliacao-${tipo}`);
    if (!container) return;
    
    const resumo = dados.resumo || {};
    let percentualConciliado = resumo.percentualConciliado || 0;
    let mensagem = '';
    let classe = '';
    
    if (percentualConciliado >= 90) {
        classe = 'status-conciliacao-success';
        mensagem = 'A conciliação está quase completa! Resolva as poucas divergências restantes para finalizar.';
    } else if (percentualConciliado >= 50) {
        classe = 'status-conciliacao-warning';
        mensagem = 'A conciliação está em andamento. Continue resolvendo as divergências para melhorar o percentual.';
    } else {
        classe = 'status-conciliacao-warning';
        mensagem = 'A conciliação está no início. Importe todos os dados necessários e comece a resolver as divergências.';
    }
    
    container.className = `status-conciliacao ${classe}`;
    
    container.innerHTML = `
        <div class="status-conciliacao-header">
            <h3>
                <i class="fas fa-chart-line"></i>
                Status da Conciliação
            </h3>
            <div class="percentual">${formatarPercentual(percentualConciliado)}</div>
        </div>
        <p>${mensagem}</p>
    `;
}

// --- Funções de Renderização para Conciliação de Bens ---

/**
 * Renderiza os cards de resumo da conciliação de bens
 * @param {Object} dados - Dados da conciliação de bens
 */
function renderizarResumoBens(dados) {
    console.log('Renderizando resumo de bens...');
    const container = document.getElementById('resumo-bens');
    if (!container) return;
    
    const resumo = dados.resumo || {};
    
    container.innerHTML = `
        <div class="resumo-card resumo-card-conciliado">
            <h3>Itens Conciliados</h3>
            <div class="valor">${resumo.totalConciliado || 0}</div>
            <div class="percentual">
                <i class="fas fa-chart-pie"></i>
                ${formatarPercentual(resumo.percentualConciliado || 0)}
            </div>
        </div>
        
        <div class="resumo-card resumo-card-pendente">
            <h3>Itens Pendentes</h3>
            <div class="valor">${resumo.totalPendente || 0}</div>
            <div class="percentual">
                <i class="fas fa-clock"></i>
                ${formatarPercentual((resumo.totalPendente / resumo.totalItens * 100) || 0)}
            </div>
        </div>
        
        <div class="resumo-card resumo-card-divergente">
            <h3>Itens Divergentes</h3>
            <div class="valor">${resumo.totalDivergente || 0}</div>
            <div class="percentual">
                <i class="fas fa-exclamation-triangle"></i>
                ${formatarPercentual((resumo.totalDivergente / resumo.totalItens * 100) || 0)}
            </div>
        </div>
        
        <div class="resumo-card resumo-card-saldo">
            <h3>Total de Itens</h3>
            <div class="valor">${resumo.totalItens || 0}</div>
            <div class="percentual">
                <i class="fas fa-boxes"></i>
                ${resumo.totalQuantidadeEntradas || 0} entradas / ${resumo.totalQuantidadeSaidas || 0} saídas
            </div>
        </div>
    `;
}

/**
 * Renderiza a tabela de entradas de estoque
 * @param {Array} entradas - Array de entradas de estoque
 */
function renderizarTabelaEstoqueEntradas(entradas) {
    console.log('Renderizando tabela de entradas de estoque...');
    const tbody = document.querySelector('#tabela-estoque-entradas tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!entradas || entradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Nenhuma entrada de estoque encontrada.</td>
            </tr>
        `;
        return;
    }
    
    entradas.forEach(entrada => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${formatarData(entrada.data)}</td>
            <td>${entrada.item || '-'}</td>
            <td>${entrada.quantidade || 0}</td>
            <td>${entrada.origem || '-'}</td>
            <td>
                <span class="status-tag ${getStatusClass(entrada.status || 'pendente')}">
                    <i class="${getStatusIcon(entrada.status || 'pendente')}"></i>
                    ${formatarStatus(entrada.status || 'pendente')}
                </span>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Renderiza a tabela de saídas de estoque
 * @param {Array} saidas - Array de saídas de estoque
 */
function renderizarTabelaEstoqueSaidas(saidas) {
    console.log('Renderizando tabela de saídas de estoque...');
    const tbody = document.querySelector('#tabela-estoque-saidas tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!saidas || saidas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Nenhuma saída de estoque encontrada.</td>
            </tr>
        `;
        return;
    }
    
    saidas.forEach(saida => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${formatarData(saida.data)}</td>
            <td>${saida.item || '-'}</td>
            <td>${saida.quantidade || 0}</td>
            <td>${saida.destino || '-'}</td>
            <td>
                <span class="status-tag ${getStatusClass(saida.status || 'pendente')}">
                    <i class="${getStatusIcon(saida.status || 'pendente')}"></i>
                    ${formatarStatus(saida.status || 'pendente')}
                </span>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Renderiza a tabela de saldo de estoque
 * @param {Array} saldos - Array de saldos de estoque
 */
function renderizarTabelaSaldoEstoque(saldos) {
    console.log('Renderizando tabela de saldo de estoque...');
    const tbody = document.querySelector('#tabela-saldo-estoque tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!saldos || saldos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Nenhum item de estoque encontrado.</td>
            </tr>
        `;
        return;
    }
    
    saldos.forEach(saldo => {
        const tr = document.createElement('tr');
        
        // Classe da linha baseada no status
        if (saldo.status) {
            tr.classList.add(`status-${saldo.status}-row`);
        }
        
        tr.innerHTML = `
            <td>${saldo.item || '-'}</td>
            <td>${saldo.totalEntradas || 0}</td>
            <td>${saldo.totalSaidas || 0}</td>
            <td class="${saldo.saldo < 0 ? 'text-danger' : saldo.saldo > 0 ? 'text-success' : ''}">${saldo.saldo || 0}</td>
            <td>
                <span class="status-tag ${getStatusClass(saldo.status)}">
                    <i class="${getStatusIcon(saldo.status)}"></i>
                    ${formatarStatus(saldo.status)}
                </span>
            </td>
            <td>${saldo.observacao || '-'}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

// --- Funções de Renderização para Dashboard ---

/**
 * Renderiza o gráfico de conciliação financeira
 * @param {Object} dados - Dados da conciliação financeira
 */
function renderizarGraficoFinanceiro(dados) {
    console.log('Renderizando gráfico financeiro...');
    const container = document.getElementById('grafico-financeiro');
    if (!container) return;
    
    // Limpa o container
    container.innerHTML = '<canvas id="chart-financeiro"></canvas>';
    
    const resumo = dados?.resumo || {};
    
    // Prepara os dados para o gráfico
    const chartData = {
        labels: ['Conciliado', 'Pendente', 'Divergente', 'Não Identificado'],
        datasets: [{
            data: [
                Math.abs(resumo.totalConciliado || 0),
                Math.abs(resumo.totalPendente || 0),
                Math.abs(resumo.totalDivergente || 0),
                Math.abs(resumo.totalNaoIdentificado || 0)
            ],
            backgroundColor: [
                '#4caf50', // Verde para conciliado
                '#ff9800', // Laranja para pendente
                '#f44336', // Vermelho para divergente
                '#9e9e9e'  // Cinza para não identificado
            ],
            borderWidth: 1
        }]
    };
    
    // Configurações do gráfico
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };
    
    // Cria o gráfico
    const ctx = document.getElementById('chart-financeiro').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: chartOptions
    });
}

/**
 * Renderiza as estatísticas financeiras
 * @param {Object} dados - Dados da conciliação financeira
 */
function renderizarStatsFinanceiro(dados) {
    console.log('Renderizando estatísticas financeiras...');
    const container = document.getElementById('stats-financeiro');
    if (!container) return;
    
    const resumo = dados?.resumo || {};
    
    container.innerHTML = `
        <div class="stat-item">
            <div class="label">Total Interno</div>
            <div class="value">${formatarValorMonetario(resumo.totalInterno || 0)}</div>
        </div>
        <div class="stat-item">
            <div class="label">Total Extrato</div>
            <div class="value">${formatarValorMonetario(resumo.totalExtrato || 0)}</div>
        </div>
        <div class="stat-item">
            <div class="label">Diferença</div>
            <div class="value ${(resumo.diferencaTotal || 0) !== 0 ? 'text-danger' : 'text-success'}">${formatarValorMonetario(resumo.diferencaTotal || 0)}</div>
        </div>
        <div class="stat-item">
            <div class="label">Conciliado</div>
            <div class="value">${formatarPercentual(resumo.percentualConciliado || 0)}</div>
        </div>
    `;
}

/**
 * Renderiza o gráfico de conciliação de bens
 * @param {Object} dados - Dados da conciliação de bens
 */
function renderizarGraficoBens(dados) {
    console.log('Renderizando gráfico de bens...');
    const container = document.getElementById('grafico-bens');
    if (!container) return;
    
    // Limpa o container
    container.innerHTML = '<canvas id="chart-bens"></canvas>';
    
    const resumo = dados?.resumo || {};
    
    // Prepara os dados para o gráfico
    const chartData = {
        labels: ['Conciliado', 'Pendente', 'Divergente'],
        datasets: [{
            data: [
                resumo.totalConciliado || 0,
                resumo.totalPendente || 0,
                resumo.totalDivergente || 0
            ],
            backgroundColor: [
                '#4caf50', // Verde para conciliado
                '#ff9800', // Laranja para pendente
                '#f44336'  // Vermelho para divergente
            ],
            borderWidth: 1
        }]
    };
    
    // Configurações do gráfico
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };
    
    // Cria o gráfico
    const ctx = document.getElementById('chart-bens').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: chartOptions
    });
}

/**
 * Renderiza as estatísticas de bens
 * @param {Object} dados - Dados da conciliação de bens
 */
function renderizarStatsBens(dados) {
    console.log('Renderizando estatísticas de bens...');
    const container = document.getElementById('stats-bens');
    if (!container) return;
    
    const resumo = dados?.resumo || {};
    
    container.innerHTML = `
        <div class="stat-item">
            <div class="label">Total de Itens</div>
            <div class="value">${resumo.totalItens || 0}</div>
        </div>
        <div class="stat-item">
            <div class="label">Entradas</div>
            <div class="value">${resumo.totalQuantidadeEntradas || 0}</div>
        </div>
        <div class="stat-item">
            <div class="label">Saídas</div>
            <div class="value">${resumo.totalQuantidadeSaidas || 0}</div>
        </div>
        <div class="stat-item">
            <div class="label">Conciliado</div>
            <div class="value">${formatarPercentual(resumo.percentualConciliado || 0)}</div>
        </div>
    `;
}

/**
 * Renderiza a tabela de top divergências
 * @param {Object} dadosFinanceiros - Dados da conciliação financeira
 * @param {Object} dadosBens - Dados da conciliação de bens
 */
function renderizarTopDivergencias(dadosFinanceiros, dadosBens) {
    console.log('Renderizando top divergências...');
    const tbody = document.querySelector('#tabela-top-divergencias tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Combina gaps financeiros e de bens
    const gapsFinanceiros = (dadosFinanceiros?.gaps || []).map(gap => ({
        ...gap,
        origem: 'financeiro',
        impacto: Math.abs(gap.valor || gap.diferenca || 0)
    }));
    
    const gapsBens = (dadosBens?.gaps || []).map(gap => ({
        ...gap,
        origem: 'bens',
        impacto: gap.quantidade || 0
    }));
    
    const todosGaps = [...gapsFinanceiros, ...gapsBens];
    
    // Ordena por impacto
    todosGaps.sort((a, b) => b.impacto - a.impacto);
    
    // Pega os top 10
    const topGaps = todosGaps.slice(0, 10);
    
    if (topGaps.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Nenhuma divergência encontrada.</td>
            </tr>
        `;
        return;
    }
    
    topGaps.forEach(gap => {
        const tr = document.createElement('tr');
        
        // Classe da linha baseada no status
        if (gap.status) {
            tr.classList.add(`status-${gap.status}-row`);
        }
        
        // Formata o valor/quantidade
        let valorExibir = '';
        if (gap.origem === 'financeiro') {
            valorExibir = formatarValorMonetario(gap.valor || gap.diferenca || 0);
        } else {
            valorExibir = `${gap.quantidade || 0} unidades`;
        }
        
        tr.innerHTML = `
            <td>${gap.tipo} ${gap.origem === 'bens' ? '(Estoque)' : ''}</td>
            <td>${valorExibir}</td>
            <td>
                <span class="status-tag ${getStatusClass(gap.status)}">
                    <i class="${getStatusIcon(gap.status)}"></i>
                    ${formatarStatus(gap.status)}
                </span>
            </td>
            <td>${formatarImpacto(gap.impacto, gap.origem)}</td>
            <td>${gap.instrucao || '-'}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Renderiza o progresso da conciliação
 * @param {Object} dadosFinanceiros - Dados da conciliação financeira
 * @param {Object} dadosBens - Dados da conciliação de bens
 */
function renderizarProgressoConciliacao(dadosFinanceiros, dadosBens) {
    console.log('Renderizando progresso da conciliação...');
    const container = document.getElementById('progresso-conciliacao');
    if (!container) return;
    
    const resumoFinanceiro = dadosFinanceiros?.resumo || {};
    const resumoBens = dadosBens?.resumo || {};
    
    // Calcula o percentual geral de conciliação
    const percentualFinanceiro = resumoFinanceiro.percentualConciliado || 0;
    const percentualBens = resumoBens.percentualConciliado || 0;
    const percentualGeral = (percentualFinanceiro + percentualBens) / 2;
    
    // Estima o tempo restante
    const tempoEstimado = estimarTempoRestante(percentualGeral);
    
    container.innerHTML = `
        <h3><i class="fas fa-tasks"></i> Progresso da Conciliação</h3>
        
        <div class="progresso-header">
            <span>Financeira</span>
            <span>${formatarPercentual(percentualFinanceiro)}</span>
        </div>
        <div class="progresso-bar">
            <div class="progresso-fill" style="width: ${percentualFinanceiro}%"></div>
        </div>
        
        <div class="progresso-header">
            <span>Bens</span>
            <span>${formatarPercentual(percentualBens)}</span>
        </div>
        <div class="progresso-bar">
            <div class="progresso-fill" style="width: ${percentualBens}%"></div>
        </div>
        
        <div class="progresso-header">
            <span>Geral</span>
            <span>${formatarPercentual(percentualGeral)}</span>
        </div>
        <div class="progresso-bar">
            <div class="progresso-fill" style="width: ${percentualGeral}%"></div>
        </div>
        
        <div class="progresso-info">
            <p>Tempo estimado para conclusão: <span class="highlight">${tempoEstimado}</span></p>
            <p>Total de divergências: <span class="highlight">${(dadosFinanceiros?.gaps?.length || 0) + (dadosBens?.gaps?.length || 0)}</span></p>
            ${percentualGeral >= 100 ? '<p class="success">Conciliação completa! Pronto para fechar o período.</p>' : ''}
        </div>
    `;
}

// --- Funções Utilitárias ---

/**
 * Formata um valor monetário
 * @param {number} valor - Valor a ser formatado
 * @returns {string} Valor formatado como moeda
 */
function formatarValorMonetario(valor) {
    if (valor === null || valor === undefined || isNaN(valor)) return 'R$ 0,00';
    
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

/**
 * Formata uma data
 * @param {Date} data - Data a ser formatada
 * @returns {string} Data formatada
 */
function formatarData(data) {
    if (!data || !(data instanceof Date) || isNaN(data)) return '-';
    
    return data.toLocaleDateString('pt-BR');
}

/**
 * Formata um percentual
 * @param {number} valor - Valor percentual
 * @returns {string} Percentual formatado
 */
function formatarPercentual(valor) {
    if (valor === null || valor === undefined || isNaN(valor)) return '0%';
    
    return `${valor.toFixed(1)}%`;
}

/**
 * Formata o status de conciliação
 * @param {string} status - Status de conciliação
 * @returns {string} Status formatado
 */
function formatarStatus(status) {
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
 * Retorna a classe CSS para um status
 * @param {string} status - Status de conciliação
 * @returns {string} Classe CSS
 */
function getStatusClass(status) {
    if (!status) return '';
    
    const classMap = {
        'conciliado': 'status-conciliado',
        'pendente': 'status-pendente',
        'divergente': 'status-divergente',
        'nao_identificado': 'status-nao-identificado'
    };
    
    return classMap[status] || '';
}

/**
 * Retorna o ícone para um status
 * @param {string} status - Status de conciliação
 * @returns {string} Classe do ícone
 */
function getStatusIcon(status) {
    if (!status) return 'fas fa-question';
    
    const iconMap = {
        'conciliado': 'fas fa-check-circle',
        'pendente': 'fas fa-clock',
        'divergente': 'fas fa-exclamation-triangle',
        'nao_identificado': 'fas fa-question-circle'
    };
    
    return iconMap[status] || 'fas fa-question';
}

/**
 * Formata o impacto de uma divergência
 * @param {number} valor - Valor do impacto
 * @param {string} origem - Origem da divergência ('financeiro' ou 'bens')
 * @returns {string} Impacto formatado
 */
function formatarImpacto(valor, origem) {
    if (valor === null || valor === undefined || isNaN(valor)) return '-';
    
    if (origem === 'financeiro') {
        // Classifica o impacto financeiro
        if (valor >= 1000) return 'Alto';
        if (valor >= 100) return 'Médio';
        return 'Baixo';
    } else {
        // Classifica o impacto em estoque
        if (valor >= 50) return 'Alto';
        if (valor >= 10) return 'Médio';
        return 'Baixo';
    }
}

/**
 * Estima o tempo restante para concluir a conciliação
 * @param {number} percentualConciliado - Percentual já conciliado
 * @returns {string} Tempo estimado
 */
function estimarTempoRestante(percentualConciliado) {
    if (percentualConciliado >= 100) return 'Concluído';
    if (percentualConciliado <= 0) return 'Indeterminado';
    
    // Estimativa simples baseada no percentual
    const percentualRestante = 100 - percentualConciliado;
    
    if (percentualRestante <= 10) return 'Menos de 1 hora';
    if (percentualRestante <= 30) return '1-2 horas';
    if (percentualRestante <= 50) return '2-4 horas';
    if (percentualRestante <= 70) return '4-8 horas';
    
    return 'Mais de 1 dia';
}

// Exporta as funções para uso no conciliacao.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderizarResumoFinanceiro,
        renderizarTabelaLancamentosInternos,
        renderizarTabelaExtrato,
        renderizarTabelaGapsFinanceiros,
        renderizarStatusConciliacao,
        renderizarResumoBens,
        renderizarTabelaEstoqueEntradas,
        renderizarTabelaEstoqueSaidas,
        renderizarTabelaSaldoEstoque,
        renderizarGraficoFinanceiro,
        renderizarStatsFinanceiro,
        renderizarGraficoBens,
        renderizarStatsBens,
        renderizarTopDivergencias,
        renderizarProgressoConciliacao
    };
} else {
    // No ambiente do navegador, adiciona ao objeto window
    window.RenderizacaoConciliacao = {
        renderizarResumoFinanceiro,
        renderizarTabelaLancamentosInternos,
        renderizarTabelaExtrato,
        renderizarTabelaGapsFinanceiros,
        renderizarStatusConciliacao,
        renderizarResumoBens,
        renderizarTabelaEstoqueEntradas,
        renderizarTabelaEstoqueSaidas,
        renderizarTabelaSaldoEstoque,
        renderizarGraficoFinanceiro,
        renderizarStatsFinanceiro,
        renderizarGraficoBens,
        renderizarStatsBens,
        renderizarTopDivergencias,
        renderizarProgressoConciliacao
    };
}
