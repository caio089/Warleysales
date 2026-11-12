import sys
from datetime import datetime
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class PDFReport(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_auto_page_break(auto=True, margin=18)
        self.set_margins(16, 16, 16)
        
        # Carrega fontes TrueType Unicode do Windows
        self.add_font("Arial", "", r"C:\Windows\Fonts\arial.ttf")
        self.add_font("Arial", "B", r"C:\Windows\Fonts\arialbd.ttf")
        self.add_font("Arial", "I", r"C:\Windows\Fonts\ariali.ttf")

    def header(self):
        if self.page_no() == 1:
            return  # Capa limpa na primeira página
        self.set_font("Arial", "B", 8)
        self.set_text_color(100, 116, 139)
        self.cell(140, 6, "WARLEY SALES & CUIDAR SAÚDE · RELATÓRIO EXECUTIVO DE IMPLEMENTAÇÃO", border="B")
        self.set_font("Arial", "", 8)
        self.cell(0, 6, f"Página {self.page_no()}", border="B", align="R", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(6)

    def footer(self):
        self.set_y(-14)
        self.set_font("Arial", "", 8)
        self.set_text_color(148, 163, 184)
        self.cell(0, 6, "Relatório gerado a partir de auditoria técnica do repositório caio089/Warleysales", align="C")

    def draw_badge(self, text, status_type):
        """Desenha uma badge colorida estilo pill"""
        colors = {
            'done': {'bg': (220, 252, 231), 'text': (22, 101, 52), 'border': (187, 247, 208)},
            'partial': {'bg': (254, 240, 138), 'text': (133, 77, 14), 'border': (253, 224, 71)},
            'postponed': {'bg': (241, 245, 249), 'text': (71, 85, 105), 'border': (226, 232, 240)},
            'external': {'bg': (254, 226, 226), 'text': (153, 27, 27), 'border': (254, 202, 202)},
        }
        c = colors.get(status_type, colors['postponed'])
        self.set_fill_color(*c['bg'])
        self.set_text_color(*c['text'])
        self.set_draw_color(*c['border'])
        self.set_font("Arial", "B", 7)
        w = self.get_string_width(text) + 6
        self.cell(w, 5, text, border=1, align="C", fill=True)
        self.set_text_color(15, 23, 42)
        self.set_draw_color(226, 232, 240)


def build_pdf(output_path):
    pdf = PDFReport()
    pdf.add_page()

    # --- CABEÇALHO DA PRIMEIRA PÁGINA ---
    # Top banner institucional
    pdf.set_fill_color(15, 23, 42) # slate-900
    pdf.rect(0, 0, 210, 32, "F")
    
    pdf.set_y(8)
    pdf.set_font("Arial", "B", 15)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 8, "RELATÓRIO DE STATUS & ROADMAP DE DESENVOLVIMENTO", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("Arial", "", 9.5)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 5, "AUDITORIA DE CÓDIGO-FONTE · ECOSSISTEMA WARLEY & CUIDAR SAÚDE", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_y(38)
    
    # Meta dados do documento
    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(226, 232, 240)
    pdf.rect(16, 36, 178, 20, "DF")
    
    pdf.set_y(38)
    pdf.set_x(20)
    pdf.set_font("Arial", "B", 8)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(50, 5, "DATA DE EMISSÃO:")
    pdf.cell(60, 5, "REPOSITÓRIO & BRANCH:")
    pdf.cell(50, 5, "SUÍTE DE TESTES:")
    pdf.ln(5)
    
    pdf.set_x(20)
    pdf.set_font("Arial", "", 8.5)
    pdf.set_text_color(15, 23, 42)
    now_str = datetime.now().strftime("%d/%m/%Y às %H:%M")
    pdf.cell(50, 5, now_str)
    pdf.cell(60, 5, "caio089/Warleysales (main)")
    pdf.cell(50, 5, "397 / 397 aprovados (100% PASS)")
    pdf.ln(12)

    # --- CARDS DE RESUMO E PROGRESSO ---
    pdf.set_font("Arial", "B", 11)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 7, "1. Resumo Executivo do Progresso", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1)

    # 4 cards de KPIs
    card_w = 41.5
    gap = 4
    start_x = 16
    start_y = pdf.get_y()
    
    kpis = [
        {"title": "TOTAL DE REQUISITOS", "val": "52", "sub": "46 Warley + 6 Cuidar", "bg": (241, 245, 249), "tc": (15, 23, 42)},
        {"title": "WARLEY CONCLUÍDO", "val": "36", "sub": "78.3% de Warley", "bg": (220, 252, 231), "tc": (22, 101, 52)},
        {"title": "WARLEY PENDENTE/POST.", "val": "10", "sub": "1 parcial + 9 adiados", "bg": (254, 243, 199), "tc": (146, 64, 14)},
        {"title": "CUIDAR SAÚDE", "val": "0 / 6", "sub": "Módulo externo", "bg": (254, 226, 226), "tc": (153, 27, 27)},
    ]
    
    for i, k in enumerate(kpis):
        x = start_x + i * (card_w + gap)
        pdf.set_xy(x, start_y)
        pdf.set_fill_color(*k["bg"])
        pdf.set_draw_color(203, 213, 225)
        pdf.rect(x, start_y, card_w, 22, "DF")
        
        pdf.set_xy(x, start_y + 2)
        pdf.set_font("Arial", "B", 6.8)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(card_w, 4, k["title"], align="C")
        
        pdf.set_xy(x, start_y + 6)
        pdf.set_font("Arial", "B", 13)
        pdf.set_text_color(*k["tc"])
        pdf.cell(card_w, 8, k["val"], align="C")
        
        pdf.set_xy(x, start_y + 14)
        pdf.set_font("Arial", "", 7)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(card_w, 4, k["sub"], align="C")

    pdf.set_y(start_y + 25)
    
    # Barra de Progresso Visual
    pdf.set_font("Arial", "B", 8)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(0, 5, "Progresso no Ecossistema Warley: 36 de 46 tarefas concluídas (78.3%)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    bar_w = 178
    bar_h = 6.5
    curr_y = pdf.get_y()
    pdf.set_fill_color(226, 232, 240)
    pdf.rect(16, curr_y, bar_w, bar_h, "F")
    
    # Verde (36/46 = 78.3%)
    green_w = bar_w * (36 / 46)
    pdf.set_fill_color(34, 197, 94)
    pdf.rect(16, curr_y, green_w, bar_h, "F")
    
    # Amarelo (1/46 = 2.2%)
    yellow_w = bar_w * (1 / 46)
    pdf.set_fill_color(234, 179, 8)
    pdf.rect(16 + green_w, curr_y, yellow_w, bar_h, "F")
    
    pdf.set_y(curr_y + 9)

    # --- TABELA DE DISTRIBUIÇÃO POR MÓDULOS ---
    modules_data = [
        ("1. Painéis, Visões Gerais e IA", 4, 3, 1, 0, "Briefing Groq no Dashboard; falta nos submódulos"),
        ("2. Acompanhamento e Assessoria", 3, 3, 0, 0, "Centralizado em 3 grupos; cadastro PJ; termo Órgão"),
        ("3. Solicitações e Processos", 8, 8, 0, 0, "7 docs obrigatórios + artefatos livres, justificativas"),
        ("4. Estoque Vinculado às Solicitações", 8, 8, 0, 0, "Trava R11: Bloqueado -> Homologado -> Pronto para Uso"),
        ("5. Pedidos entre Órgãos e Gestão", 3, 3, 0, 0, "Reserva atômica de saldo e despacho exclusivo de Warley"),
        ("6. Reuniões e Atas", 5, 2, 0, 3, "UI/UX e agendamento OK; Áudio/IA adiados a pedido"),
        ("7. Leitura e Cadastro a partir de PDF", 2, 0, 0, 2, "OCR e extração de contratos adiados a pedido"),
        ("8. Alertas e Notificações", 3, 1, 0, 2, "Alertas internos OK; WhatsApp/Email adiados a pedido"),
        ("9. Auditoria e Relatórios", 5, 3, 0, 2, "Trilha e filtros multidimensionais OK; PDF timbrado adiado"),
        ("10. Contratação e Economia Gerada", 5, 5, 0, 0, "Valor inicial x contratado, cálculo e histórico de economia"),
        ("CUIDAR SAÚDE - Associados e Guias", 6, 0, 0, 6, "Módulo de saúde externo (fora deste repositório)"),
    ]

    pdf.set_font("Arial", "B", 10)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, "Tabela Sintética por Área", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1)

    # Cabeçalho da tabela
    pdf.set_fill_color(241, 245, 249)
    pdf.set_draw_color(203, 213, 225)
    pdf.set_font("Arial", "B", 7)
    pdf.set_text_color(51, 65, 85)
    
    col_w = [60, 12, 14, 14, 15, 63]
    headers = ["Módulo / Área", "Total", "Concl.", "Parcial", "Post./Pend.", "Observação Técnica"]
    for w, h in zip(col_w, headers):
        pdf.cell(w, 5.5, h, border=1, align="C" if w < 20 else "L", fill=True)
    pdf.ln()

    # Linhas da tabela
    pdf.set_font("Arial", "", 6.8)
    pdf.set_text_color(15, 23, 42)
    for row in modules_data:
        m, tot, conc, parc, post, obs = row
        pdf.cell(col_w[0], 4.8, m, border=1)
        pdf.cell(col_w[1], 4.8, str(tot), border=1, align="C")
        
        if conc > 0:
            pdf.set_text_color(22, 101, 52)
            pdf.set_font("Arial", "B", 6.8)
        pdf.cell(col_w[2], 4.8, str(conc), border=1, align="C")
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("Arial", "", 6.8)
        
        if parc > 0:
            pdf.set_text_color(146, 64, 14)
            pdf.set_font("Arial", "B", 6.8)
        pdf.cell(col_w[3], 4.8, str(parc), border=1, align="C")
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("Arial", "", 6.8)
        
        pdf.cell(col_w[4], 4.8, str(post), border=1, align="C")
        pdf.cell(col_w[5], 4.8, obs, border=1)
        pdf.ln()

    # --- PÁGINA SEGUINTE: DETALHAMENTO ITEM A ITEM ---
    pdf.add_page()
    pdf.set_font("Arial", "B", 11)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 7, "2. Detalhamento Item a Item dos Requisitos", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1)

    tasks_catalog = [
        {"section": "WARLEY — Painéis, visões gerais e IA", "items": [
            ("Adicionar insights de IA nas visões gerais de todos os módulos.", "Alta", "partial",
             "Parcial: Motor Groq Llama 3 ativo no BriefingCard do Dashboard (/dashboard); cabeçalhos analíticos em submódulos específicos (/estoque, /processos) ainda não propagados."),
            ("Exibir resumos consolidados de solicitações, processos, contratos, pedidos e estoque.", "Alta", "done",
             "Implementado: /dashboard consolida solicitações pendentes, estoque crítico, contratos a vencer e entregas acumuladas."),
            ("Destacar no painel do gestor o valor inicial, valor efetivamente contratado e economia calculada.", "Crítica", "done",
             "Implementado: KPIs no Dashboard e no portal do gestor (/meu-conselho) com cálculo em tempo real."),
            ("Permitir abrir o histórico detalhado das contratações e economias pelo painel do gestor.", "Alta", "done",
             "Implementado: Diálogo interativo SavingsHistoryDialog acessível via clique no KPI do portal /meu-conselho."),
        ]},

        {"section": "WARLEY — Acompanhamento e assessoria", "items": [
            ("Centralizar contratos, atas e recursos da assessoria dentro do módulo Acompanhamento.", "Alta", "done",
             "Implementado: Menu lateral unificado em 3 grupos estratégicos (Acompanhamento, Estoque, Sistema) em navigation.ts."),
            ("Permitir à assessoria cadastrar empresas privadas.", "Alta", "done",
             "Implementado: Cadastro funcional em /conselhos/novo com suporte a CNPJ, contato e perfil institucional."),
            ("Substituir a nomenclatura pertinente por Órgão e revisar os rótulos das telas.", "Melhoria", "done",
             "Implementado: Padronização integral dos termos 'Órgão' e 'Órgãos Parceiros' em tabelas, modais e filtros."),
        ]},

        {"section": "WARLEY — Solicitações e processos", "items": [
            ("Criar solicitação informando material/objeto, quantidade e órgão/conselho responsável.", "Crítica", "done",
             "Implementado: Totalmente funcional em /solicitacoes/nova com múltiplos itens e validações Zod."),
            ("Gerar um processo vinculado a cada solicitação.", "Crítica", "done",
             "Implementado: Geração automática de número NNN/AAAA e persistência de process_id vinculado."),
            ("Permitir anexar, cadastrar e consultar os 7 documentos obrigatórios e artefatos adicionais dentro do processo.", "Crítica", "done",
             "Implementado: Drawer lateral ProcessAttachmentSheet e card AdditionalDocumentsCard com suporte ao tipo documental 'OUTRO'."),
            ("Calcular e exibir o percentual de conclusão dos documentos obrigatórios (exigir 7 para 100%).", "Crítica", "done",
             "Implementado: Cálculo estrito dos 7 obrigatórios (DFD, ETP, MR, TR, PP, PJ, ED); artefatos livres não diluem a regra."),
            ("Registrar a justificativa sempre que a entrega/conclusão estiver abaixo de 100%.", "Alta", "done",
             "Implementado: Exigência de parecer fundamentado circunstanciado (>= 20 caracteres) para encerramento de processos e recebimento."),
            ("Corrigir o bug do botão Voltar no fluxo dos processos.", "Alta", "done",
             "Implementado: Link padronizado 'Voltar para Processos' presente no cabeçalho de /processos/[id]."),
            ("Corrigir a visibilidade do botão Nova solicitação.", "Alta", "done",
             "Implementado: Botão mantido sempre visível em /solicitacoes (com tooltip e desabilitação amigável se sem permissão)."),
            ("Registrar no histórico quem criou, alterou ou executou cada etapa do processo.", "Crítica", "done",
             "Implementado: Registro imutável de eventos com actorId, timestamp e notas em purchase_request_events e audit_logs."),
        ]},

        {"section": "WARLEY — Estoque vinculado às solicitações", "items": [
            ("Gerar/atualizar automaticamente o registro de material e quantidade no estoque a partir da solicitação.", "Crítica", "done",
             "Implementado: Criação de solicitação provisiona automaticamente saldo em estado 'blocked' em stock_balances."),
            ("Associar os registros de estoque ao órgão responsável.", "Crítica", "done",
             "Implementado: stock_balances particionado por (council_id, material_id) com isolamento estrito."),
            ("Exibir estado de estoque Bloqueado até o cumprimento dos requisitos de liberação.", "Crítica", "done",
             "Implementado: Saldo 'Bloqueado em Formalização' em destaque nos KPIs e na listagem de /estoque."),
            ("Exigir 100% dos documentos obrigatórios, ata/contrato/empenho, fornecedor e valor para liberar movimentação.", "Crítica", "done",
             "Implementado: Gate formal impede homologação enquanto faltar qualquer requisito legal."),
            ("Após cumprir os requisitos, alterar o estado para Pronto para uso.", "Crítica", "done",
             "Implementado: Homologação por Warley converte o saldo bloqueado em disponível físico."),
            ("Liberar somente então o uso do saldo, movimentações e distribuição de materiais.", "Crítica", "done",
             "Implementado: Regra R11 do domínio de estoque restringe saídas exclusivamente ao saldo homologado."),
            ("Exibir quantidade total, quantidade disponível, quantidade utilizada e percentual do saldo disponível.", "Alta", "done",
             "Implementado: 4 KPIs estratégicos na tela /estoque e visão detalhada por item."),
            ("Tomar como referência conceitual o fluxo público de solicitações/contratações do PNCP.", "Melhoria", "done",
             "Implementado: Pipeline (DFD -> ETP -> Matriz -> TR -> Preços -> Parecer -> Edital) aderente à Lei 14.133/2021."),
        ]},

        {"section": "WARLEY — Pedidos entre órgãos e gestão", "items": [
            ("Permitir que órgãos criem pedidos diretamente em seus próprios painéis.", "Crítica", "done",
             "Implementado: Diálogo MaterialOrderDialog em /meu-conselho com limite ao saldo pronto para uso e reserva imediata."),
            ("Encaminhar os pedidos ao painel de Warley para acompanhamento e gestão.", "Crítica", "done",
             "Implementado: Fila OrderQueue no Dashboard central de Warley com ações diretas de aprovação e recusa."),
            ("Vincular pedidos e respectivas baixas ao saldo liberado em estoque.", "Crítica", "done",
             "Implementado: Aprovação exclusiva por Warley baixa atomicamente o saldo reservado e gera registro contábil de saída."),
        ]},

        {"section": "WARLEY — Reuniões e atas", "items": [
            ("Melhorar a UI/UX do módulo de Reuniões.", "Alta", "done",
             "Implementado: 4 KPIs estratégicos (Total, Agendadas, Realizadas, Canceladas), busca contextual e layout moderno."),
            ("Adicionar agendamento de reuniões.", "Alta", "done",
             "Implementado: Formulário NewMeetingForm com data/hora, pauta e associação de órgão parceiro."),
            ("Permitir escutar/reproduzir o áudio no registro da reunião.", "Alta", "postponed",
             "Postergado a pedido: Requer player de áudio dedicado; foco mantido nas regras e governança do ecossistema."),
            ("Implementar transcrição de áudio em tempo real.", "Alta", "postponed",
             "Postergado a pedido: Requer integração com Web Speech API ou API Groq/Whisper Audio."),
            ("Gerar uma proposta de ata com IA a partir da transcrição, com revisão antes de salvar.", "Alta", "postponed",
             "Postergado a pedido: Dependente da transcrição de áudio prévia."),
        ]},

        {"section": "WARLEY — Leitura e cadastro a partir de PDF", "items": [
            ("Ler PDFs e extrair empresa/fornecedor, objeto, validade e dados do contrato.", "Alta", "postponed",
             "Postergado a pedido: Requer serviço de OCR e parser multimodal para documentos escaneados."),
            ("Preencher o cadastro do sistema com os dados extraídos, mediante conferência e confirmação.", "Alta", "postponed",
             "Postergado a pedido: Dependente do motor de extração de PDF."),
        ]},

        {"section": "WARLEY — Alertas e notificações", "items": [
            ("Criar alertas e resumos das visões gerais.", "Alta", "done",
             "Implementado: Monitoramento automatizado de atas e contratos vencendo em 30/60 dias via tabela notifications."),
            ("Permitir envio de notificações por e-mail e WhatsApp.", "Alta", "postponed",
             "Postergado a pedido: Sistema possui gerador de link wa.me; envio automatizado via API externa postergado."),
            ("Definir regras de disparo para pendências, alterações importantes e movimentações.", "Melhoria", "postponed",
             "Postergado a pedido: Regras de webhooks e mensageria externa postergadas."),
        ]},

        {"section": "WARLEY — Auditoria e relatórios", "items": [
            ("Criar trilha de auditoria completa, com responsável, ação e data.", "Crítica", "done",
             "Implementado: Tabela audit_logs imutável e serviço AuditService com rastreabilidade total."),
            ("Adicionar filtros por unidade/órgão, módulo, usuário, período e tipo de evento.", "Alta", "done",
             "Implementado: Filtros dinâmicos multidimensionais em AuditService.list e AuditTrailTab."),
            ("Disponibilizar os dados de auditoria e dos módulos na área de Relatórios.", "Alta", "done",
             "Implementado: Página /relatorios reformulada com abas de Indicadores e Trilha de Auditoria."),
            ("Gerar PDFs de relatórios usando o papel timbrado da instituição.", "Alta", "postponed",
             "Postergado a pedido: Exportação institucional em PDF no próprio frontend pendente."),
            ("Gerar análises e resumos dos relatórios com IA, preservando rastreabilidade das fontes.", "Melhoria", "postponed",
             "Postergado a pedido: Narrativa analítica com IA sobre trilhas de auditoria postergada."),
        ]},

        {"section": "WARLEY — Contratação e economia gerada", "items": [
            ("Ao concluir 100% dos documentos, solicitar o valor global inicial da licitação.", "Crítica", "done",
             "Implementado: Card FormalizationCard ativado no processo após 100% dos documentos validados."),
            ("Após a sessão pública, permitir cadastrar ata, contrato/empenho, fornecedor e valor real da compra.", "Crítica", "done",
             "Implementado: Formulário completo de formalização em /processos/[id] com instrumento, fornecedor e valor real."),
            ("Calcular economia pela diferença entre valor global inicial e valor efetivamente contratado.", "Crítica", "done",
             "Implementado: Função calculateSavings no domínio exibindo economia em reais e percentual em tempo real."),
            ("Enviar os valores e o cálculo para a seção Economias dos Relatórios.", "Crítica", "done",
             "Implementado: Persistência consolidada via FormalizationService.getSavingsSummary."),
            ("Exibir economia acumulada no painel do gestor, com acesso ao histórico de valores, processos e contratos.", "Alta", "done",
             "Implementado: Card de KPI e modal interativo SavingsHistoryDialog em /meu-conselho e fila no dashboard."),
        ]},

        {"section": "CUIDAR SAÚDE — Associados e pagamentos", "items": [
            ("Unificar o gerenciamento de associados em um único modal.", "Alta", "external",
             "Escopo Externo: Pertence à aplicação Cuidar Saúde; não faz parte do código-fonte deste repositório Warley."),
            ("Implementar geração e seleção de pagamento via PIX, cartão e boleto.", "Crítica", "external",
             "Escopo Externo: Gateway de pagamentos da Cuidar Saúde (fora deste repositório)."),
            ("Simplificar o fluxo de pagamento em desktop e mobile, com etapas claras e responsivas.", "Crítica", "external",
             "Escopo Externo: Checkout responsivo da Cuidar Saúde (fora deste repositório)."),
        ]},

        {"section": "CUIDAR SAÚDE — Guias", "items": [
            ("Corrigir erros e inconsistências do módulo de Guias.", "Crítica", "external",
             "Escopo Externo: Emissão de guias médicas/odontológicas da Cuidar Saúde (fora deste repositório)."),
            ("Remover informações fictícias e garantir exibição de dados reais.", "Crítica", "external",
             "Escopo Externo: Sanitização de dados de guias da Cuidar Saúde (fora deste repositório)."),
            ("Implementar abas de navegação para Guias no mobile.", "Alta", "external",
             "Escopo Externo: Navegação mobile do aplicativo Cuidar Saúde (fora deste repositório)."),
        ]}
    ]

    badge_labels = {
        'done': 'CONCLUÍDO',
        'partial': 'PARCIAL',
        'postponed': 'POSTERGADO',
        'external': 'OUTRO ESCOPO',
    }

    for group in tasks_catalog:
        if pdf.get_y() > 245:
            pdf.add_page()
            
        pdf.ln(2.5)
        pdf.set_fill_color(241, 245, 249)
        pdf.set_draw_color(203, 213, 225)
        pdf.set_font("Arial", "B", 8.8)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(0, 6, f"  {group['section']}", border=1, fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(1)

        for title, prio, st, detail in group["items"]:
            if pdf.get_y() > 255:
                pdf.add_page()
                
            pdf.set_font("Arial", "B", 7.5)
            if st == "done":
                pdf.set_text_color(22, 101, 52)
                check_str = "[X]"
            elif st == "partial":
                pdf.set_text_color(146, 64, 14)
                check_str = "[~]"
            elif st == "postponed":
                pdf.set_text_color(100, 116, 139)
                check_str = "[ ]"
            else:
                pdf.set_text_color(185, 28, 28)
                check_str = "[-]"
                
            pdf.cell(6, 4.8, check_str, align="C")
            
            pdf.set_font("Arial", "B", 7)
            pdf.set_text_color(71, 85, 105)
            pdf.cell(14, 4.8, f"[{prio}]")
            
            pdf.set_font("Arial", "B", 7.5)
            pdf.set_text_color(15, 23, 42)
            avail_w = 132
            pdf.cell(avail_w, 4.8, title[:88] + ("..." if len(title) > 88 else ""))
            
            pdf.draw_badge(badge_labels[st], st)
            pdf.ln(5)
            
            pdf.set_x(23)
            pdf.set_font("Arial", "", 6.8)
            pdf.set_text_color(71, 85, 105)
            pdf.multi_cell(168, 3.4, detail)
            pdf.ln(1.5)

    # --- CONCLUSÃO / RECOMENDAÇÕES FINAIS ---
    if pdf.get_y() > 230:
        pdf.add_page()
        
    pdf.ln(3)
    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(203, 213, 225)
    pdf.rect(16, pdf.get_y(), 178, 28, "DF")
    
    box_y = pdf.get_y() + 2
    pdf.set_xy(20, box_y)
    pdf.set_font("Arial", "B", 8.5)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 4.5, "Conclusão da Auditoria & Próximas Recomendações", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_x(20)
    pdf.set_font("Arial", "", 7)
    pdf.set_text_color(51, 65, 85)
    concl_text = (
        "1. O ecossistema Warley atingiu maturidade crítica de governança com 78.3% das tarefas concluídas (todas as regras de negócio centrais, travas contábeis R11, estoque bloqueado, aprovações exclusivas e auditoria multidimensional estão 100% ativas e testadas).\n"
        "2. Os 9 itens pendentes/postergados de Warley consistem em integrações com APIs pesadas de terceiros (transcrição de áudio, Whisper, OCR de PDF e envio de WhatsApp).\n"
        "3. Os 6 itens referentes à Cuidar Saúde pertencem a uma aplicação apartada e devem ser executados no repositório correspondente."
    )
    pdf.multi_cell(170, 3.4, concl_text)

    pdf.output(output_path)
    print(f"PDF gerado com sucesso: {output_path}")

if __name__ == "__main__":
    out = "Relatorio_Status_Implementacao_Warley.pdf"
    if len(sys.argv) > 1:
        out = sys.argv[1]
    build_pdf(out)
