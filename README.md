# 📋 Sistema de Visualização de Currículos - Auto Posto Estrela D'Alva

Sistema web para visualização e gerenciamento de currículos recebidos, integrado com Supabase e DataTables em português brasileiro.

## 🚀 Funcionalidades

- ✅ **Visualização de PDFs** - Abre currículos diretamente no navegador
- ✅ **Controle de Visualização** - Registra data/hora quando foi visualizado
- ✅ **Filtros Avançados** - Por cargo, data inicial e final
- ✅ **Interface Responsiva** - Funciona em desktop e mobile
- ✅ **DataTables** - Paginação, busca e ordenação em português
- ✅ **Integração Supabase** - Banco de dados em tempo real
- ✅ **Design Personalizado** - Cores da marca Auto Posto Estrela D'Alva

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Banco de Dados**: Supabase PostgreSQL
- **Bibliotecas**: 
  - Bootstrap 5.3
  - DataTables 1.13.6
  - Font Awesome 6.0
  - jQuery 3.7.0

## 📁 Estrutura do Projeto

```
visualizar_curriculos/
├── index.html          # Página principal
├── style.css           # Estilos personalizados
├── script.js           # Lógica JavaScript
└── README.md           # Este arquivo
```

## ⚙️ Configuração

### 1. Banco de Dados (Supabase)

Execute este SQL no Supabase para criar a tabela:

```sql
-- Criar tabela de currículos
CREATE TABLE curriculos (
    id SERIAL PRIMARY KEY,
    nome TEXT,
    email TEXT,
    telefone TEXT,
    cargo TEXT,
    arquivo_url TEXT,
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_visualizacao TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Desativar RLS (Row Level Security) para permitir operações
ALTER TABLE curriculos DISABLE ROW LEVEL SECURITY;

-- Opcional: Criar índice para consultas mais rápidas
CREATE INDEX idx_curriculos_data_visualizacao ON curriculos(data_visualizacao);
```

### 2. Configuração do Supabase

No arquivo `script.js`, atualize as credenciais:

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-aqui';
```

## 🎯 Como Usar

1. **Acesse** o arquivo `index.html` no navegador
2. **Visualize** a lista de currículos recebidos
3. **Filtre** por cargo ou período de data
4. **Clique no olho** 👁️ para visualizar o PDF do currículo
5. **Acompanhe** a coluna "Visualizado" para controle

## 🎨 Personalização

### Cores da Marca
- **Vermelho**: `#dc3545` (cor primária)
- **Amarelo/Dourado**: `#ffc107` (cor secundária)
- **Gradientes**: Combinações harmoniosas entre as cores

### Responsividade
- **Desktop**: Layout completo com todos os recursos
- **Tablet**: Interface adaptada para telas médias
- **Mobile**: Design otimizado para smartphones

## 📊 Estrutura da Tabela

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL | Identificador único |
| `nome` | TEXT | Nome do candidato |
| `email` | TEXT | Email de contato |
| `telefone` | TEXT | Telefone formatado |
| `cargo` | TEXT | Cargo de interesse |
| `arquivo_url` | TEXT | URL do PDF do currículo |
| `data_envio` | TIMESTAMP | Data de envio do currículo |
| `data_visualizacao` | TIMESTAMP | Data da primeira visualização |

## 🔧 Recursos Técnicos

- **DataTables** em português brasileiro
- **Formatação automática** de telefone e data
- **Controle de visualização** com update automático no banco
- **Fallback** para dados de exemplo se Supabase estiver indisponível
- **Auto-refresh** a cada 5 minutos
- **Tratamento de erros** robusto

## 📱 Compatibilidade

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## 🚀 Deploy

### GitHub Pages
1. Vá em **Settings** > **Pages**
2. Selecione **Deploy from a branch**
3. Escolha **main** branch
4. Acesse via: `https://f2nn1k.github.io/verificar_curriculos/`

### Outros Hosts
- Netlify
- Vercel
- Servidor web tradicional

## 👨‍💻 Desenvolvedor

**F2nn1K** - leo.vdf3@gmail.com

## 📄 Licença

Este projeto é de uso privado para Auto Posto Estrela D'Alva.

---

> 💡 **Dica**: Para modificar as credenciais do Supabase, edite apenas o arquivo `script.js` nas linhas 2-3. 