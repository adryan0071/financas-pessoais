# 💰 Finanças Pessoais - Controle Financeiro Inteligente

<div align="center">

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.13-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4.8-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Uma aplicação web moderna e completa para controle de finanças pessoais**

[🚀 Demo](#-como-usar) • [📖 Documentação](./DOCUMENTACAO_TECNICA.md) • [🛠️ Instalação](#-instalação)

</div>

## 📋 Sobre o Projeto

O **Finanças Pessoais** é um aplicativo web desenvolvido em React que oferece uma solução completa para gestão financeira pessoal. Com interface moderna e intuitiva, o sistema permite controlar contas, transações, orçamentos, metas e gerar relatórios analíticos detalhados.

### ✨ Principais Funcionalidades

- 🔐 **Sistema de Autenticação** - Login seguro com persistência de sessão
- 💳 **Gerenciamento de Contas** - Controle de contas bancárias, cartões e dinheiro
- 📊 **Controle de Transações** - Receitas e despesas com categorização automática
- 🎯 **Orçamentos Inteligentes** - Limites por categoria com alertas automáticos
- 🏆 **Metas Financeiras** - Objetivos com acompanhamento de progresso
- 📈 **Relatórios Avançados** - Gráficos interativos e análises automáticas
- 🔔 **Notificações** - Alertas inteligentes baseados em comportamento
- 📱 **Design Responsivo** - Interface adaptável para todos os dispositivos

## 🎯 Demonstração

### Dashboard Principal
- **Visão consolidada** das finanças com métricas importantes
- **Gráficos interativos** de tendências e distribuição de gastos
- **Notificações inteligentes** sobre orçamentos e metas
- **Transações recentes** e status de objetivos financeiros

### Módulos Principais

| Módulo | Funcionalidades | Status |
|--------|-----------------|--------|
| **Contas** | CRUD de contas, saldos automáticos, indicadores visuais | ✅ Completo |
| **Transações** | CRUD de transações, categorização, filtros avançados | ✅ Completo |
| **Orçamentos** | Limites por categoria, alertas, gráficos comparativos | ✅ Completo |
| **Relatórios** | Análises temporais, insights automáticos, exportação | ✅ Completo |
| **Metas** | Objetivos financeiros, progresso visual, alertas de prazo | ✅ Completo |

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3.1** - Framework principal com hooks e context
- **JavaScript ES6+** - Linguagem moderna com features avançadas
- **Vite 5.4.8** - Build tool rápido com hot reload
- **React Router 6.26.2** - Roteamento SPA

### UI/UX
- **Tailwind CSS 3.4.13** - Framework CSS utility-first
- **shadcn/ui** - Biblioteca de componentes acessíveis
- **Lucide React 0.447.0** - Ícones modernos e consistentes
- **Recharts 2.12.7** - Gráficos interativos para React

### Formulários e Validação
- **React Hook Form 7.53.0** - Gerenciamento eficiente de formulários
- **Validação client-side** - Feedback imediato ao usuário

### Utilitários
- **date-fns 4.1.0** - Manipulação de datas
- **localStorage** - Persistência de dados local

## 🚀 Instalação

### Pré-requisitos
- Node.js 18.0.0 ou superior
- npm ou pnpm (recomendado)

### Passos de Instalação

```bash
# 1. Clone o repositório ou acesse o diretório
cd financas-pessoais

# 2. Instale as dependências
pnpm install

# 3. Execute o servidor de desenvolvimento
pnpm run dev

# 4. Acesse a aplicação
# http://localhost:5173
```

### Scripts Disponíveis

```bash
pnpm run dev      # Servidor de desenvolvimento
pnpm run build    # Build de produção
pnpm run preview  # Preview do build
pnpm run lint     # Verificação de código
```

## 💡 Como Usar

### 1. Acesso ao Sistema
- Acesse `http://localhost:5173`
- Use uma das contas de teste ou crie uma nova conta

### Contas de Teste
| Email | Senha | Perfil |
|-------|-------|--------|
| `admin@financas.com` | `123456` | Administrador |
| `user@financas.com` | `123456` | Usuário Padrão |
| `demo@financas.com` | `demo123` | Conta Demo |

### 2. Configuração Inicial
1. **Adicione suas contas** - Cadastre contas bancárias, cartões e dinheiro
2. **Configure categorias** - Personalize categorias de receitas e despesas
3. **Defina orçamentos** - Estabeleça limites mensais por categoria
4. **Crie metas** - Defina objetivos financeiros com prazos

### 3. Uso Diário
1. **Registre transações** - Adicione receitas e despesas conforme ocorrem
2. **Acompanhe orçamentos** - Monitore gastos em tempo real
3. **Verifique metas** - Acompanhe progresso dos objetivos
4. **Analise relatórios** - Use insights para melhorar suas finanças

## 📊 Estrutura do Projeto

```
financas-pessoais/
├── public/                 # Arquivos públicos
├── src/
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes base (shadcn/ui)
│   │   ├── auth/          # Sistema de autenticação
│   │   ├── accounts/      # Gerenciamento de contas
│   │   ├── transactions/  # Sistema de transações
│   │   ├── budgets/       # Controle de orçamentos
│   │   ├── reports/       # Relatórios e análises
│   │   └── dashboard/     # Dashboard principal
│   ├── contexts/          # Context API (estado global)
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Funções utilitárias
│   ├── App.jsx           # Componente raiz
│   └── main.jsx          # Ponto de entrada
├── DOCUMENTACAO_TECNICA.md # Documentação completa
└── README.md             # Este arquivo
```

## 🎨 Design e UX

### Princípios de Design
- **Minimalismo** - Interface limpa e focada no essencial
- **Consistência** - Padrões visuais uniformes em todo o sistema
- **Acessibilidade** - Componentes acessíveis e navegação por teclado
- **Responsividade** - Adaptação perfeita a diferentes tamanhos de tela

### Paleta de Cores
- **Verde** - Receitas e valores positivos
- **Vermelho** - Despesas e alertas
- **Azul** - Informações e navegação
- **Amarelo** - Avisos e atenção
- **Roxo** - Metas e objetivos

### Componentes Visuais
- **Cards informativos** com métricas importantes
- **Gráficos interativos** para análise visual
- **Barras de progresso** para metas e orçamentos
- **Badges coloridos** para status e categorias
- **Alertas contextuais** para notificações

## 📈 Funcionalidades Detalhadas

### Sistema de Contas
- **Tipos suportados:** Corrente, Poupança, Cartão de Crédito, Dinheiro
- **Cálculos automáticos:** Saldo total, patrimônio líquido, utilização de limite
- **Indicadores visuais:** Cores por tipo, alertas de limite, status de conta

### Controle de Transações
- **Categorização inteligente** com ícones e cores
- **Filtros avançados** por período, categoria, conta e status
- **Sistema de tags** para organização adicional
- **Busca textual** em descrições e notas

### Orçamentos e Alertas
- **Status automático:** No orçamento (verde), Atenção (amarelo), Ultrapassado (vermelho)
- **Gráficos comparativos** entre orçado e realizado
- **Alertas proativos** quando próximo do limite
- **Histórico mensal** de performance

### Relatórios Analíticos
- **Tendências temporais** com gráficos de linha
- **Distribuição por categoria** com gráficos de pizza
- **Análise por conta** com performance individual
- **Insights automáticos** com recomendações personalizadas

### Metas Financeiras
- **Tipos de meta:** Reserva de emergência, viagens, compras, investimentos
- **Acompanhamento visual** com barras de progresso
- **Alertas de prazo** para metas próximas do vencimento
- **Cálculo automático** de valor mensal necessário

## 🔒 Segurança e Privacidade

### Medidas de Segurança
- **Validação client-side** em todos os formulários
- **Sanitização de dados** de entrada
- **Proteção de rotas** com sistema de autenticação
- **Armazenamento local seguro** com localStorage

### Privacidade dos Dados
- **Dados locais** - Todas as informações ficam no navegador
- **Sem transmissão** - Nenhum dado é enviado para servidores externos
- **Controle total** - Usuário tem controle completo sobre seus dados
- **Backup manual** - Exportação de dados quando necessário

## 🚧 Limitações Conhecidas

- **Armazenamento local** - Dados limitados ao navegador atual
- **Sem sincronização** - Não há sincronização entre dispositivos
- **Moeda única** - Suporte apenas ao Real brasileiro (BRL)
- **Backup manual** - Não há backup automático na nuvem

## 🔮 Roadmap Futuro

### Próximas Funcionalidades
- [ ] **Modo escuro** - Tema dark para melhor experiência
- [ ] **Exportação avançada** - Excel, JSON, XML
- [ ] **Importação de dados** - OFX, CSV bancários
- [ ] **Calculadora financeira** - Juros compostos, financiamentos

### Melhorias Planejadas
- [ ] **Backend API** - Sincronização na nuvem
- [ ] **PWA** - Aplicativo web progressivo
- [ ] **Integração bancária** - Open Banking
- [ ] **Inteligência artificial** - Insights automáticos avançados

## 🤝 Contribuição

Este projeto foi desenvolvido como uma demonstração completa de aplicação React moderna. Para sugestões de melhorias ou reportar problemas:

1. Analise a [documentação técnica](./DOCUMENTACAO_TECNICA.md)
2. Verifique as funcionalidades implementadas
3. Teste as diferentes funcionalidades
4. Forneça feedback construtivo

## 📄 Licença

Este projeto é licenciado sob a **MIT License** - veja o arquivo LICENSE para detalhes.

## 👨‍💻 Desenvolvedor

**Desenvolvido por:** Adryan Rodrigues 
**Tecnologia:** React + JavaScript + Tailwind CSS  
**Versão:** 1.0.0  
**Data:** Outubro 2025

---

<div align="center">

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**

[🚀 Começar Agora](#-instalação) • [📖 Documentação](./DOCUMENTACAO_TECNICA.md) • [💡 Como Usar](#-como-usar)

</div>
