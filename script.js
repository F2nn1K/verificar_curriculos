// Configuração do Supabase
const SUPABASE_URL = 'https://ezpjdywoywtpxtiynseg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cGpkeXdveXd0cHh0aXluc2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NjE3MjgsImV4cCI6MjA2ODQzNzcyOH0.qiVX5Lti7kpOoJEEAlU795P9OmXFBDqOKKxUBW4cFc8';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variáveis globais
let dataTable;
let curriculosData = [];
let currentCandidato = null;

// Configuração do DataTables em português
const dataTablesConfig = {
    language: {
        "decimal": "",
        "emptyTable": "Nenhum currículo encontrado",
        "info": "Mostrando _START_ a _END_ de _TOTAL_ currículos",
        "infoEmpty": "Mostrando 0 a 0 de 0 currículos",
        "infoFiltered": "(filtrado de _MAX_ currículos totais)",
        "infoPostFix": "",
        "thousands": ".",
        "lengthMenu": "Mostrar _MENU_ currículos",
        "loadingRecords": "Carregando...",
        "processing": "Processando...",
        "search": "Buscar:",
        "zeroRecords": "Nenhum currículo correspondente encontrado",
        "paginate": {
            "first": "Primeiro",
            "last": "Último",
            "next": "Próximo",
            "previous": "Anterior"
        },
        "aria": {
            "sortAscending": ": ativar para classificar a coluna em ordem crescente",
            "sortDescending": ": ativar para classificar a coluna em ordem decrescente"
        }
    },
    responsive: true,
    pageLength: 10,
    lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],
    order: [[4, 'desc']], // Ordenar por data de envio (mais recente primeiro)
    columnDefs: [
        {
            targets: 6, // Coluna de ações (agora é a 6ª coluna)
            orderable: false,
            searchable: false,
            className: 'text-center',
            width: '80px'
        },
        {
            targets: 5, // Coluna Visualizado
            className: 'text-center',
            width: '120px'
        }
    ]
};

// Função para mostrar/esconder loading
function toggleLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    const tabela = document.getElementById('tabela-container');
    
    if (show) {
        spinner.classList.remove('d-none');
        tabela.classList.add('loading');
    } else {
        spinner.classList.add('d-none');
        tabela.classList.remove('loading');
    }
}



// Função para formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Função para formatar telefone
function formatarTelefone(telefone) {
    if (!telefone) return '';
    
    // Remove caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');
    
    // Aplica máscara baseada no tamanho
    if (numeros.length === 11) {
        return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numeros.length === 10) {
        return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return telefone;
}

// Função para carregar dados do Supabase
async function carregarCurriculos(mostrarNotificacao = false) {
    try {
        toggleLoading(true);
        
        const { data, error } = await supabase
            .from('curriculos')
            .select('id, nome, email, telefone, cargo, arquivo_url, data_envio, data_visualizacao')
            .order('data_envio', { ascending: false });
        
        if (error) {
            throw error;
        }
        
        curriculosData = data || [];
        atualizarTabela();
        atualizarFiltros();
        atualizarContador();
        

        
    } catch (error) {
        console.error('Erro ao carregar currículos:', error);
        // Carregar dados de exemplo para demonstração
        carregarDadosExemplo();
        
    } finally {
        toggleLoading(false);
    }
}

// Função para atualizar contador
function atualizarContador() {
    const contador = document.querySelector('#contador-curriculos .badge');
    contador.textContent = curriculosData.length;
}

// Função para atualizar filtros
function atualizarFiltros() {
    const filtro = document.getElementById('filtro-cargo');
    const cargos = [...new Set(curriculosData.map(c => c.cargo))].filter(Boolean);
    
    // Limpar opções existentes (exceto a primeira)
    filtro.innerHTML = '<option value="">Todos os cargos</option>';
    
    // Adicionar cargos únicos
    cargos.sort().forEach(cargo => {
        const option = document.createElement('option');
        option.value = cargo;
        option.textContent = cargo;
        filtro.appendChild(option);
    });
}

// Função para atualizar tabela
function atualizarTabela(dadosFiltrados = null) {
    const dados = dadosFiltrados || curriculosData;
    
    if (dataTable) {
        dataTable.destroy();
    }
    
    const tbody = document.querySelector('#tabela-curriculos tbody');
    tbody.innerHTML = '';
    
    dados.forEach(curriculo => {
        const row = tbody.insertRow();
        
        row.innerHTML = `
            <td class="fw-semibold">${curriculo.nome || 'N/A'}</td>
            <td>${curriculo.email || 'N/A'}</td>
            <td>${formatarTelefone(curriculo.telefone)}</td>
            <td><span class="badge bg-primary">${curriculo.cargo || 'N/A'}</span></td>
            <td>${formatarData(curriculo.data_envio)}</td>
            <td class="text-center">
                ${curriculo.data_visualizacao ? 
                    `<small class="text-success">
                        <i class="fas fa-check-circle me-1"></i>
                        ${formatarData(curriculo.data_visualizacao)}
                    </small>` : 
                    `<small class="text-muted">
                        <i class="fas fa-minus-circle me-1"></i>
                        Não visualizado
                    </small>`
                }
            </td>
            <td>
                ${curriculo.arquivo_url ? `
                    <button class="btn btn-sm btn-outline-primary btn-action single" 
                            onclick="visualizarCurriculo('${curriculo.arquivo_url}', '${curriculo.nome}', ${curriculo.id})" 
                            title="Visualizar currículo">
                        <i class="fas fa-eye"></i>
                    </button>
                ` : `
                    <button class="btn btn-sm btn-outline-secondary btn-action single" 
                            disabled 
                            title="Arquivo não disponível">
                        <i class="fas fa-eye-slash"></i>
                    </button>
                `}
            </td>
        `;
    });
    
    // Inicializar DataTables
    dataTable = $('#tabela-curriculos').DataTable(dataTablesConfig);
}

// Função para abrir modal de detalhes
function abrirDetalhes(curriculoId) {
    const curriculo = curriculosData.find(c => c.id === curriculoId);
    
    if (!curriculo) {
        return;
    }
    
    currentCandidato = curriculo;
    
    // Preencher dados do modal
    document.getElementById('modal-nome').textContent = curriculo.nome || 'N/A';
    document.getElementById('modal-email').textContent = curriculo.email || 'N/A';
    document.getElementById('modal-telefone').textContent = formatarTelefone(curriculo.telefone);
    document.getElementById('modal-cargo').textContent = curriculo.cargo || 'N/A';
    document.getElementById('modal-data').textContent = formatarData(curriculo.data_envio);
    
    // Configurar botões de ação
    const btnBaixar = document.getElementById('btn-baixar-curriculo');
    const btnVisualizar = document.getElementById('btn-visualizar-curriculo');
    
    if (curriculo.arquivo_url) {
        btnBaixar.disabled = false;
        btnBaixar.onclick = () => baixarCurriculo(curriculo.arquivo_url, curriculo.nome);
        
        if (btnVisualizar) {
            btnVisualizar.disabled = false;
            btnVisualizar.onclick = () => visualizarCurriculo(curriculo.arquivo_url, curriculo.nome);
        }
    } else {
        btnBaixar.disabled = true;
        btnBaixar.onclick = null;
        
        if (btnVisualizar) {
            btnVisualizar.disabled = true;
            btnVisualizar.onclick = null;
        }
    }
    
    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById('modal-detalhes'));
    modal.show();
}

// Função para visualizar currículo no navegador
function visualizarCurriculo(url, nome, curriculoId) {
    try {
        // Registrar visualização no banco de dados
        registrarVisualizacao(curriculoId);
        
        // Abrir PDF em nova aba para visualização
        const novaAba = window.open(url, '_blank');
        
        if (novaAba) {
            novaAba.focus();
        } else {
            // Se popup foi bloqueado, tentar alternativa
            // Alternativa: usar iframe em modal
            abrirModalVisualizacao(url, nome);
        }
    } catch (error) {
        console.error('Erro ao visualizar currículo:', error);
    }
}

// Função para baixar currículo
function baixarCurriculo(url, nome) {
    try {
        const link = document.createElement('a');
        link.href = url;
        link.download = `Curriculo_${nome?.replace(/\s+/g, '_') || 'Candidato'}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        

    } catch (error) {
        console.error('Erro ao baixar currículo:', error);
    }
}

// Função para aplicar filtros
function aplicarFiltros() {
    const cargo = document.getElementById('filtro-cargo').value;
    const dataInicio = document.getElementById('filtro-data-inicio').value;
    const dataFim = document.getElementById('filtro-data-fim').value;
    
    let dadosFiltrados = [...curriculosData];
    
    // Filtro por cargo
    if (cargo) {
        dadosFiltrados = dadosFiltrados.filter(c => c.cargo === cargo);
    }
    
    // Filtro por data
    if (dataInicio) {
        const inicio = new Date(dataInicio);
        dadosFiltrados = dadosFiltrados.filter(c => new Date(c.data_envio) >= inicio);
    }
    
    if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999); // Incluir todo o dia
        dadosFiltrados = dadosFiltrados.filter(c => new Date(c.data_envio) <= fim);
    }
    
    atualizarTabela(dadosFiltrados);
}

// Função para limpar filtros
function limparFiltros() {
    document.getElementById('filtro-cargo').value = '';
    document.getElementById('filtro-data-inicio').value = '';
    document.getElementById('filtro-data-fim').value = '';
    
    atualizarTabela();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados iniciais
    carregarCurriculos();
    
    // Botão atualizar
    document.getElementById('btn-atualizar').addEventListener('click', function() {
        this.querySelector('i').classList.add('fa-spin');
        carregarCurriculos(true).finally(() => {
            this.querySelector('i').classList.remove('fa-spin');
        });
    });
    
    // Botões de filtro
    document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
    document.getElementById('btn-limpar-filtros').addEventListener('click', limparFiltros);
    
    // Filtros automáticos ao alterar valores
    document.getElementById('filtro-cargo').addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-data-inicio').addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-data-fim').addEventListener('change', aplicarFiltros);
    
    // Tecla Enter nos campos de data
    document.getElementById('filtro-data-inicio').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') aplicarFiltros();
    });
    
    document.getElementById('filtro-data-fim').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') aplicarFiltros();
    });
});

// Função para abrir modal de visualização (alternativa para popups bloqueados)
function abrirModalVisualizacao(url, nome) {
    // Criar modal dinamicamente se não existir
    let modal = document.getElementById('modal-visualizacao');
    if (!modal) {
        criarModalVisualizacao();
        modal = document.getElementById('modal-visualizacao');
    }
    
    // Configurar conteúdo do modal
    const iframe = modal.querySelector('#iframe-curriculo');
    const titulo = modal.querySelector('#modal-titulo-curriculo');
    
    titulo.textContent = `Currículo - ${nome}`;
    iframe.src = url;
    
    // Mostrar modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    

}

// Função para criar modal de visualização
function criarModalVisualizacao() {
    const modalHtml = `
        <div class="modal fade" id="modal-visualizacao" tabindex="-1" aria-labelledby="modalVisualizacaoLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header text-white">
                        <h5 class="modal-title" id="modal-titulo-curriculo">
                            <i class="fas fa-file-pdf me-2"></i>
                            Visualizar Currículo
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
                    </div>
                    <div class="modal-body p-0">
                        <iframe id="iframe-curriculo" 
                                src="" 
                                style="width: 100%; height: 80vh; border: none;"
                                title="Visualizador de PDF">
                        </iframe>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-success" onclick="baixarCurriculoAtual()">
                            <i class="fas fa-download me-1"></i>
                            Baixar PDF
                        </button>
                        <button type="button" class="btn btn-primary" onclick="abrirEmNovaAba()">
                            <i class="fas fa-external-link-alt me-1"></i>
                            Abrir em Nova Aba
                        </button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Função para baixar currículo atual do modal
function baixarCurriculoAtual() {
    const iframe = document.getElementById('iframe-curriculo');
    const titulo = document.getElementById('modal-titulo-curriculo');
    
    if (iframe && iframe.src) {
        const nome = titulo.textContent.replace('Currículo - ', '');
        baixarCurriculo(iframe.src, nome);
    }
}

// Função para abrir currículo em nova aba a partir do modal
function abrirEmNovaAba() {
    const iframe = document.getElementById('iframe-curriculo');
    
    if (iframe && iframe.src) {
        window.open(iframe.src, '_blank');

    }
}

// Funções globais para uso nos botões da tabela
window.abrirDetalhes = abrirDetalhes;
window.baixarCurriculo = baixarCurriculo;
window.visualizarCurriculo = visualizarCurriculo;
window.baixarCurriculoAtual = baixarCurriculoAtual;
window.abrirEmNovaAba = abrirEmNovaAba;

// Função para registrar visualização no Supabase
async function registrarVisualizacao(curriculoId) {
    try {
        const agora = new Date().toISOString();
        
        const { data, error } = await supabase
            .from('curriculos')
            .update({ data_visualizacao: agora })
            .eq('id', curriculoId)
            .select('id, data_visualizacao');
        
        if (error) {
            console.error('Erro ao registrar visualização:', error);
        } else {
            // Forçar atualização completa dos dados
            await carregarCurriculos(false);
        }
    } catch (error) {
        console.error('Erro na função registrarVisualizacao:', error);
    }
}

// Função para carregar dados de exemplo (para demonstração)
function carregarDadosExemplo() {
    
    curriculosData = [
        {
            id: 1,
            nome: 'João Silva Santos',
            email: 'joao.silva@email.com',
            telefone: '11999887766',
            cargo: 'Frentista',
            arquivo_url: 'https://exemplo.com/curriculo1.pdf',
            data_envio: new Date().toISOString(),
            data_visualizacao: new Date(Date.now() - 3600000).toISOString() // 1 hora atrás
        },
        {
            id: 2,
            nome: 'Maria Oliveira Costa',
            email: 'maria.oliveira@email.com',
            telefone: '11888776655',
            cargo: 'Caixa',
            arquivo_url: null,
            data_envio: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
            data_visualizacao: null
        },
        {
            id: 3,
            nome: 'Carlos Eduardo Lima',
            email: 'carlos.lima@email.com',
            telefone: '11777665544',
            cargo: 'Gerente',
            arquivo_url: 'https://exemplo.com/curriculo3.pdf',
            data_envio: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
            data_visualizacao: null
        },
        {
            id: 4,
            nome: 'Ana Paula Ferreira',
            email: 'ana.ferreira@email.com',
            telefone: '11666554433',
            cargo: 'Frentista',
            arquivo_url: 'https://exemplo.com/curriculo4.pdf',
            data_envio: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
            data_visualizacao: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
        }
    ];
    
    atualizarTabela();
    atualizarFiltros();
    atualizarContador();
    

}









// Auto-refresh a cada 5 minutos (opcional)
setInterval(function() {
    if (document.visibilityState === 'visible') {
        carregarCurriculos(false); // Sem notificação no auto-refresh
    }
}, 5 * 60 * 1000);

// Controle de visibilidade da página
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // Página ficou visível, recarregar dados sem notificação
        carregarCurriculos(false);
    }
});

// Tratamento de erros globais
window.addEventListener('error', function(e) {
    console.error('Erro JavaScript:', e.error);
});

// Tratamento de erros de promessas não capturadas
window.addEventListener('unhandledrejection', function(e) {
    console.error('Erro de promessa não capturada:', e.reason);
});

 