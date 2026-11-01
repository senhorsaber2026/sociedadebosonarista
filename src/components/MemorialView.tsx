import React, { useState, useEffect } from 'react';
import { 
  Award, 
  BookOpen, 
  Sparkles, 
  Flame, 
  Quote, 
  Compass, 
  Heart, 
  Search, 
  Share2, 
  ExternalLink, 
  ChevronRight, 
  Library, 
  Landmark, 
  GraduationCap, 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  Info, 
  Check, 
  HelpCircle,
  Clock,
  Globe2,
  Flag
} from 'lucide-react';
import { User } from '../types';
import { showToast } from './Toast';

interface MemorialFigure {
  id: string;
  name: string;
  title: string;
  country: string;
  countryFlag: string;
  category: 'filosofo' | 'brasil' | 'mundo' | 'economia';
  period: string;
  image: string;
  quote: string;
  summary: string;
  fullBio: string;
  keyContributions: string[];
  keyWorks: { title: string; year?: string; desc: string }[];
  principles: string[];
  featured?: boolean;
}

const MEMORIAL_FIGURES: MemorialFigure[] = [
  {
    id: 'olavo_de_carvalho',
    name: 'Olavo de Carvalho',
    title: 'O Filósofo do Renascimento Cultural Brasileiro',
    country: 'Brasil',
    countryFlag: '🇧🇷',
    category: 'filosofo',
    period: '1947 — 2022',
    image: '/assets/memorial/olavo_de_carvalho.jpg',
    quote: 'A sabedoria começa na honestidade da própria percepção. Não queira vencer um debate, queira descobrir a verdade.',
    summary: 'Filósofo, escritor e ensaísta brasileiro. Principal responsável pelo renascimento do pensamento conservador e da alta cultura clássica no Brasil no século XXI.',
    fullBio: 'Olavo Luiz Pimentel de Carvalho (Campinas, 1947 — Richmond, 2022) foi um dos mais influentes pensadores da história recente do Brasil. Rompeu com o monopólio cultural marxista que dominava as universidades e a imprensa brasileira desde os anos 1970. Criador do Seminário de Filosofia (COF), que formou mais de 20 mil alunos em clássicos gregos, escolástica medieval e filosofia moderna. Foi o primeiro a documentar e denunciar a existência do Foro de São Paulo nos anos 1990 quando toda a grande mídia negava ou silenciava. Sua obra abrange epistemologia, psicologia das 12 camadas, crítica da revolução cultural e defesa intransigente da busca sincera pela verdade acima de qualquer ideologia.',
    keyContributions: [
      'Ruptura pioneira da hegemonia marxista cultural na intelectualidade brasileira',
      'Criação do Seminário de Filosofia (COF), resgatando a alta cultura clássica',
      'Denúncia do Foro de São Paulo e diagnóstico do Gramscismo no Brasil',
      'Formulação da Teoria dos Quatro Discursos (Poética, Retórica, Dialética e Lógica)',
      'Teoria das 12 Camadas da Personalidade humana',
      'Despertar cívico de milhões de patriotas e intelectuais conservadores'
    ],
    keyWorks: [
      { title: 'O Mínimo que Você Precisa Saber para Não Ser um Idiota', year: '2013', desc: 'Coletânea essencial de ensaios e artigos dissecando a farsa do esquerdismo, a degradação da educação e a moralidade pública.' },
      { title: 'O Jardim das Aflições', year: '1995', desc: 'Tratado monumental sobre a ideia de Império, o globalismo moderno e o esmagamento da consciência individual pelo Estado.' },
      { title: 'A Dialética Simbólica', year: '1996', desc: 'Estudos profundos sobre o simbolismo tradicional, metafísica e a estrutura da cognição humana.' },
      { title: 'Aristóteles em Nova Perspectiva', year: '1996', desc: 'Revolucionária teoria sobre os quatro discursos de Aristóteles interligados como graus sucessivos de credibilidade.' },
      { title: 'O Imbecil Coletivo', year: '1996', desc: 'Retrato impiedoso e brilhante da decadência moral e intelectual da classe falante brasileira.' }
    ],
    principles: [
      'A primazia da consciência individual sobre o coletivo',
      'A busca da verdade real em detrimento do consenso de grupo',
      'A preservação da herança civilizacional clássica e cristã',
      'Resistência tenaz contra a engenharia social e o totalitarismo ideológico'
    ],
    featured: true
  },
  {
    id: 'jair_bolsonaro',
    name: 'Jair Messias Bolsonaro',
    title: '38º Presidente da República Federativa do Brasil',
    country: 'Brasil',
    countryFlag: '🇧🇷',
    category: 'brasil',
    period: '1955 — Presente',
    image: '/assets/memorial/bolsonaro.jpg',
    quote: 'Brasil acima de tudo, Deus acima de todos. A nossa bandeira jamais será vermelha.',
    summary: 'Capitão da reserva do Exército e líder político nacional que uniu o povo brasileiro em torno da defesa da pátria, família, liberdade econômica e soberania.',
    fullBio: 'Jair Messias Bolsonaro liderou uma virada histórica na política brasileira. Eleito presidente em 2018 com apoio massivo popular e sem grandes recursos partidários, quebrou décadas de domínio da esquerda tradicional. Seu governo priorizou o agronegócio, a redução de ministérios, a desregulamentação, a liberdade para empreender (Lei da Liberdade Econômica), o combate à corrupção sistêmica, a defesa dos valores cristãos e a redução histórica nos índices de homicídios no Brasil.',
    keyContributions: [
      'Restauração do orgulho patriótico, do hino e dos símbolos nacionais',
      'Marco do Saneamento Básico, Ferrogrão e recordes de infraestrutura via concessões',
      'Aprovação da Lei da Liberdade Econômica e desregulamentação desburocratizante',
      'Redução histórica da criminalidade violenta e defesa do direito à legítima defesa',
      'Fortalecimento do agronegócio e defesa da soberania das riquezas brasileiras'
    ],
    keyWorks: [
      { title: 'Projeto de Nação: Brasil Acima de Tudo', year: '2018', desc: 'Diretrizes de governo pautadas no livre mercado, descentralização federativa e valores morais.' },
      { title: 'Lei da Liberdade Econômica (Lei 13.874)', year: '2019', desc: 'Marco legislativo garantindo a livre iniciativa e afastando a interferência indevida do Estado no empreendedorismo.' }
    ],
    principles: [
      'Deus, Pátria, Família e Liberdade',
      'Direito inalienável à legítima defesa e à propriedade',
      'Respeito aos cofres públicos e combate aos privilégios corporativistas',
      'Soberania nacional irrestrita'
    ],
    featured: true
  },
  {
    id: 'edmund_burke',
    name: 'Edmund Burke',
    title: 'O Pai do Conservadorismo Moderno',
    country: 'Reino Unido / Irlanda',
    countryFlag: '🇬🇧',
    category: 'filosofo',
    period: '1729 — 1797',
    image: '/assets/memorial/burke.jpg',
    quote: 'Para que o mal triunfe, basta que os homens de bem não façam nada.',
    summary: 'Estadista britânico, filósofo e orador que previu com precisão matemática os horrores da Revolução Francesa e formulou a prudência conservadora.',
    fullBio: 'Membro do Parlamento britânico, Edmund Burke é universalmente considerado o pai intelectual do conservadorismo moderno. Em sua obra-prima "Reflexões sobre a Revolução na França" (1790), opôs-se frontalmente ao voluntarismo utópico dos jacobinos franceses, demonstrando que destruir de uma hora para outra as tradições, a religião e a ordem civil testada pelos séculos só conduz à tirania e ao terror. Defendeu o contrato social não apenas entre os vivos, mas como uma parceria sagrada entre os que já se foram, os vivos e os que ainda hão de nascer.',
    keyContributions: [
      'Formulação dos princípios da prudência e da continuidade histórica',
      'Crítica magistral à engenharia social utópica e ao racionalismo arrogante',
      'Defesa das "pequenas corporações de afeto" (a família, a igreja local, os bairros)',
      'Conceito da sociedade como pacto intergeracional sagrado'
    ],
    keyWorks: [
      { title: 'Reflexões sobre a Revolução em França', year: '1790', desc: 'A obra fundadora do pensamento conservador, alertando contra os riscos da destruição violenta da tradição.' },
      { title: 'Uma Investigação Filosófica sobre a Origem de Nossas Ideias do Sublime e do Belo', year: '1757', desc: 'Tratado clássico sobre estética, beleza e a reverência diante do sagrado.' }
    ],
    principles: [
      'Prudência como a maior virtude da política',
      'A preservação das instituições que resistiram ao teste do tempo',
      'A rejeição de esquemas abstratos impostos de cima para baixo',
      'A liberdade ordenada sob a lei moral'
    ],
    featured: true
  },
  {
    id: 'thomas_sowell',
    name: 'Thomas Sowell',
    title: 'Mestre da Economia, Filosofia e Razão',
    country: 'Estados Unidos',
    countryFlag: '🇺🇸',
    category: 'filosofo',
    period: '1930 — Presente',
    image: '/assets/memorial/sowell.jpg',
    quote: 'Não há soluções fáceis na vida; existem apenas escolhas e compensações (trade-offs).',
    summary: 'Economista sênior da Hoover Institution (Stanford), filósofo social e autor de mais de 40 livros magistrais desmascarando as falácias da esquerda e do dirigismo estatal.',
    fullBio: 'Thomas Sowell nasceu em extrema pobreza na Carolina do Norte segregada, cresceu no Harlem e tornou-se um dos mais brilhantes intelectuais da humanidade. Doutor pela Universidade de Chicago sob a tutela de Milton Friedman, Sowell foi marxista na juventude até estudar de perto o funcionamento da burocracia governamental. Dedicou a vida a demonstrar com fatos e estatísticas empíricas como as políticas assistencialistas intervencionistas destroem a própria população que dizem proteger, e como a liberdade econômica e a responsabilidade individual são os verdadeiros motores da ascensão social.',
    keyContributions: [
      'A Teoria da "Visão Ungida" vs "Visão Trágica/Restrita" da natureza humana',
      'Desmistificação definitiva de teorias sobre disparidades econômicas e raça',
      'Defesa do papel crucial do sistema de preços como transmissor de conhecimento disperso',
      'Autor de clássicos fundamentais lidos por gerações de conservadores e liberais'
    ],
    keyWorks: [
      { title: 'Conflito de Visões: Origens Ideológicas das Lutas Políticas', year: '1987', desc: 'A explicação mais profunda já escrita sobre o abismo fundamental entre o pensamento de direita e de esquerda.' },
      { title: 'Economia Básica: Um Guia de Economia sem Jargões', year: '2000', desc: 'A maior obra introdutória à economia de mercado, ensinando com clareza cristalina como a prosperidade é gerada.' },
      { title: 'Os Intelectuais e a Sociedade', year: '2009', desc: 'Dissecando o papel destrutivo de intelectuais arrogantes que promovem ideias desastrosas sem pagar custo algum por seus erros.' }
    ],
    principles: [
      'Respeito irrestrito à realidade dos fatos e não a desejos utópicos',
      'O valor inegociável da responsabilidade pessoal',
      'Reconhecimento das limitações do conhecimento de qualquer planejador central',
      'A primazia das leis econômicas e dos incentivos'
    ],
    featured: true
  },
  {
    id: 'reagan_thatcher',
    name: 'Ronald Reagan & Margaret Thatcher',
    title: 'A Aliança da Liberdade e Vitória contra o Coletivismo',
    country: 'EUA & Reino Unido',
    countryFlag: '🇺🇸 🇬🇧',
    category: 'mundo',
    period: 'Século XX',
    image: '/assets/memorial/reagan_thatcher.jpg',
    quote: 'A liberdade nunca está a mais de uma geração da extinção. Não a transmitimos aos filhos na corrente sanguínea.',
    summary: 'O 40º presidente dos EUA e a Primeira-Ministra britânica ("A Dama de Ferro") formaram a parceria que revitalizou o Ocidente, desregulamentou economias e derrotou o império soviético.',
    fullBio: 'Durante a década de 1980, Ronald Reagan e Margaret Thatcher lideraram uma revolução conservadora global. Thatcher assumiu uma Grã-Bretanha falida pelo socialismo fabiano e sindicatos corporativistas, privatizou estatais ineficientes, derrotou a inflação e reafirmou o orgulho britânico. Reagan reanimou a América com cortes expressivos de impostos, resgate do patriotismo, otimismo cívico e a estratégia corajosa de "Paz através da Força" que culminou no colapso da União Soviética e na libertação de milhões de almas do jugo comunista.',
    keyContributions: [
      'Queda pacífica da Cortina de Ferro e desmantelamento do império comunista',
      'Reaganomics: Cortes profundos de impostos, desregulamentação e renascimento do livre mercado',
      'Revolução Thatcherista de privatizações, propriedade privada popular e livre concorrência',
      'Reafirmação do orgulho e da liderança moral das democracias ocidentais'
    ],
    keyWorks: [
      { title: 'Discurso de Ronald Reagan no Muro de Berlim: "Tear Down This Wall!"', year: '1987', desc: 'O momento histórico em que o presidente americano desafiou Gorbachev a libertar a Europa Oriental.' },
      { title: 'Discurso de Margaret Thatcher em Zurique: O Caminho para a Liberdade', year: '1977', desc: 'O manifesto seminal afirmando que o socialismo só funciona até acabar o dinheiro dos outros.' }
    ],
    principles: [
      'Paz através da força moral e militar',
      'O governo é o problema, não a solução',
      'A dignidade infinita do indivíduo e da livre iniciativa',
      'Defesa inflexível das fronteiras e da identidade nacional'
    ],
    featured: true
  },
  {
    id: 'dom_pedro_ii',
    name: 'Dom Pedro II',
    title: 'Imperador Magnânimo do Brasil',
    country: 'Brasil',
    countryFlag: '🇧🇷',
    category: 'brasil',
    period: '1825 — 1891',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    quote: 'Se eu não fosse imperador, desejaria ser professor. Não conheço missão maior e mais nobre do que dirigir as inteligências juvenis.',
    summary: 'Segundo e último monarca do Império do Brasil. Governou por quase 50 anos com integridade exemplar, tolerância, respeito irrestrito à Constituição e amor à ciência e à educação.',
    fullBio: 'Dom Pedro II consolidou a unidade territorial de um país continental enquanto a América Espanhola se fragmentava em guerras civis. Modelo de probidade pessoal e simplicidade, recusava luxos pessoais e investia do próprio bolso em bibliotecas, institutos históricos e bolsas de estudo para jovens brasileiros. Seu reinado de quase cinco décadas foi caracterizado por estabilidade monetária, liberdade irrestrita de imprensa (nunca censurou um jornal sequer) e consolidação das instituições parlamentares.',
    keyContributions: [
      'Manutenção da unidade territorial do Brasil de dimensões continentais',
      'Estabilidade institucional e monetária por quase meio século',
      'Defesa intransigente da mais plena liberdade de imprensa e de opinião',
      'Apoio decisivo à abolição gradual e definitiva da escravidão (Lei Áurea de 1888)'
    ],
    keyWorks: [
      { title: 'Mensagens do Trono e Diários do Imperador', year: '1840-1889', desc: 'Registros de um estadista com devoção sacerdotal ao dever cívico e ao progresso moral do povo brasileiro.' }
    ],
    principles: [
      'Honradez e austeridade pessoal no trato da coisa pública',
      'Respeito escrupuloso à constituição e separação de poderes',
      'Estabilidade institucional como pré-requisito da paz civil'
    ]
  },
  {
    id: 'jose_bonifacio',
    name: 'José Bonifácio de Andrada e Silva',
    title: 'O Patriarca da Independência do Brasil',
    country: 'Brasil',
    countryFlag: '🇧🇷',
    category: 'brasil',
    period: '1763 — 1838',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80',
    quote: 'A verdadeira liberdade consiste em fazer tudo aquilo que a lei permite, sem prejudicar os outros.',
    summary: 'Cientista de renome europeu, mineralogista, poeta e o grande arquiteto da Independência e da fundação do Estado Nacional brasileiro.',
    fullBio: 'José Bonifácio foi um verdadeiro polímata da Ilustração luso-brasileira. Descobridor de quatro minerais (incluindo a petalita que levou à descoberta do lítio), voltou ao Brasil para liderar o movimento da independência em 1822. Com visão conservadora e realista, arquitetou uma transição ordenada sem a anarquia sanguinolenta das repúblicas hispânicas, mantendo o país unido sob a autoridade constitucional de D. Pedro I. Foi pioneiro ao defender já no início do século XIX a abolição da escravidão, a proteção das florestas e a integração cidadã dos povos indígenas.',
    keyContributions: [
      'Arquiteto intelectual e político da Independência do Brasil em 1822',
      'Preservação da unidade de um império continental frente ao esfacelamento',
      'Primeiro projeto estruturado para a abolição gradual da escravidão e reforma agrária produtiva'
    ],
    keyWorks: [
      { title: 'Representação à Assembleia Geral Constituinte sobre a Escravatura', year: '1823', desc: 'Um dos documentos mais nobres e proféticos da história brasileira, clamando pelo fim do cativeiro e elevação moral do país.' }
    ],
    principles: [
      'Soberania e unidade do Brasil acima de facções',
      'Ordem legal como guardiã da liberdade genuína',
      'Ciência e erudição a serviço da nação'
    ]
  },
  {
    id: 'friedrich_hayek',
    name: 'Friedrich A. Hayek',
    title: 'Prêmio Nobel de Economia & Filósofo da Ordem Espontânea',
    country: 'Áustria / Reino Unido',
    countryFlag: '🇦🇹 🇬🇧',
    category: 'economia',
    period: '1899 — 1992',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    quote: 'A curiosa tarefa da economia é demonstrar aos homens quão pouco eles realmente sabem sobre aquilo que imaginam poder conceber.',
    summary: 'Expoente maior da Escola Austríaca de Economia. Provou que o planejamento central socialista é impossível devido à dispersão do conhecimento na sociedade.',
    fullBio: 'Friedrich Hayek demonstrou no clássico "O Caminho da Servidão" (1944) que qualquer tentativa de planificação econômica socialista conduz inevitavelmente ao totalitarismo e à perda de todas as liberdades individuais. Desenvolveu a teoria da "Ordem Espontânea", provando que as maiores conquistas humanas — a linguagem, o direito consuetudinário, os mercados e a moeda — não foram desenhados por burocratas, mas emergiram da livre cooperação voluntária entre indivíduos.',
    keyContributions: [
      'Demonstração da impossibilidade do cálculo econômico sob o socialismo',
      'Teoria da Ordem Espontânea e do conhecimento disperso',
      'Defesa intransigente do Império da Lei (Rule of Law) contra a discricionariedade estatal'
    ],
    keyWorks: [
      { title: 'O Caminho da Servidão', year: '1944', desc: 'O alerta mais lido do século XX demonstrando que o coletivismo econômico sempre deságua na tirania.' },
      { title: 'Os Fundamentos da Liberdade', year: '1960', desc: 'Monumental tratado sobre a filosofia política da liberdade individual e as instituições que a sustentam.' }
    ],
    principles: [
      'Limitação severa do poder coercitivo do Estado',
      'Humildade epistemológica: ninguém sabe tudo',
      'Mercado livre como mecanismo insubstituível de coordenação'
    ]
  },
  {
    id: 'roger_scruton',
    name: 'Sir Roger Scruton',
    title: 'Filósofo da Beleza, Tradição e Amor ao Lar',
    country: 'Reino Unido',
    countryFlag: '🇬🇧',
    category: 'filosofo',
    period: '1944 — 2020',
    image: 'https://images.unsplash.com/photo-1507842229451-9f75069732f1?auto=format&fit=crop&w=600&q=80',
    quote: 'Conservadorismo vem de um sentimento que qualquer pessoa madura compartilha com facilidade: que coisas boas são facilmente destruídas, mas não são facilmente criadas.',
    summary: 'Um dos mais elegantes filósofos do século XXI. Escreveu sobre estética, arquitetura, música, ecologia conservadora e a defesa da civilização ocidental.',
    fullBio: 'Sir Roger Scruton viajou clandestinamente na década de 1980 para ministrar seminários secretos atrás da Cortina de Ferro na Tchecoslováquia e Polônia, ajudando a rede de dissidentes anti-comunistas. Desenvolveu o conceito central de "Oikofilia" — o amor ao lar, à paisagem local, às comunidades vizinhas e aos costumes compartilhados —, mostrando que o conservadorismo é motivado pelo amor àquilo que já existe de belo, e não pelo ressentimento social.',
    keyContributions: [
      'Formulação do conceito de "Oikofilia" (amor ao lar e ecologia genuína)',
      'Resgate da estética, da arquitetura clássica e da busca pelo sagrado',
      'Apoio corajoso aos dissidentes do totalitarismo soviético no leste europeu',
      'Defesa da sociedade civil e das associações voluntárias'
    ],
    keyWorks: [
      { title: 'Como Ser um Conservador', year: '2014', desc: 'Introdução magistral aos princípios de um conservador moderno em um mundo fragmentado.' },
      { title: 'Beleza: Uma Muito Breve Introdução', year: '2009', desc: 'Manifesto sobre a necessidade espiritual da beleza na vida humana contra a feiura utilitária.' }
    ],
    principles: [
      'Oikofilia: Cuidar daquilo que amamos',
      'A beleza como necessidade vital da alma humana',
      'Tradição como depósito acumulado de sabedoria prática'
    ]
  },
  {
    id: 'roberto_campos',
    name: 'Roberto Campos',
    title: 'O Embaixador da Razão Econômica no Brasil',
    country: 'Brasil',
    countryFlag: '🇧🇷',
    category: 'brasil',
    period: '1917 — 2001',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    quote: 'O Brasil nunca perde a oportunidade de perder uma oportunidade. A esquerda brasileira só lê o que ela mesma escreve.',
    summary: 'Economista, diplomata, ministro do Planejamento e senador. Foi o pioneiro solitário e brilhante na defesa do livre mercado contra o estatismo asfixiante brasileiro.',
    fullBio: 'Roberto de Oliveira Campos participou da delegação brasileira nos acordos de Bretton Woods em 1944. Foi embaixador nos EUA e em Londres. Como ministro, modernizou o sistema financeiro nacional com a criação do Banco Central do Brasil, do FGTS e da correção monetária. Com humor refinado e erudição implacável, combateu por décadas o cartorialismo, o nacionalismo xenófobo retrógrado e o vício brasileiro em soluções estatais ineficientes.',
    keyContributions: [
      'Criação do Banco Central do Brasil e modernização do sistema financeiro',
      'Defesa incansável da privatização, abertura de mercado e desregulamentação',
      'Avisos proféticos sobre o custo da burocracia e do corporativismo estatal'
    ],
    keyWorks: [
      { title: 'A Lanterna na Popa', year: '1994', desc: 'Memórias fundamentais do século XX brasileiro, obra-prima de inteligência, história e perspicácia cívica.' },
      { title: 'O Século Esquisito', year: '1990', desc: 'Reflexões afiadas sobre o colapso das utopias coletivistas no mundo.' }
    ],
    principles: [
      'Liberdade de mercado como pré-requisito da prosperidade',
      'Combate impiedoso ao corporativismo e aos privilégios públicos',
      'Abertura ao mundo e integração com as nações prósperas'
    ]
  },
  {
    id: 'carlos_lacerda',
    name: 'Carlos Lacerda',
    title: 'O Corvo da Guanabara & Grande Tribuno da Liberdade',
    country: 'Brasil',
    countryFlag: '🇧🇷',
    category: 'brasil',
    period: '1914 — 1977',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    quote: 'A mentira dita cem vezes pode parecer verdade, mas basta uma única verdade corajosa para desmoronar o castelo inteiro da impostura.',
    summary: 'Jornalista, escritor, orador genial e governador do Estado da Guanabara. A voz mais vibrante da oposição ao populismo demagógico e à corrupção.',
    fullBio: 'Fundador do jornal "Tribuna da Imprensa", Carlos Lacerda foi sem dúvida o maior orador político do Brasil republicano. Com estilo incisivo, combateu o getulismo e a demagogia populista. Como primeiro governador da Guanabara (Rio de Janeiro), realizou uma das administrações mais eficientes da história da cidade, canalizando rios, construindo o Túnel Rebouças e Santa Bárbara, elevando os padrões da educação pública e criando a Companhia Estadual de Águas (CEDAE). Tradutor primoroso de Shakespeare e autor de múltiplos livros.',
    keyContributions: [
      'Combate frontal à demagogia populista e à corrupção política no Brasil',
      'Gestão modelo de infraestrutura e modernização urbana no Estado da Guanabara',
      'Defesa vigorosa da liberdade de expressão e imprensa independente'
    ],
    keyWorks: [
      { title: 'O Poder das Ideias', year: '1963', desc: 'Discursos e artigos demonstrando a força dos princípios morais na ação pública.' },
      { title: 'Depoimento', year: '1977', desc: 'Memórias políticas indispensáveis para compreender a República brasileira.' }
    ],
    principles: [
      'Coragem cívica inegociável diante do poder',
      'Eficiência administrativa e obras que melhoram a vida real do cidadão',
      'Amor apaixonado pela liberdade e pelo debate aberto'
    ]
  },
  {
    id: 'eneas_carneiro',
    name: 'Dr. Enéas Ferreira Carneiro',
    title: 'O Símbolo do Nacionalismo Cívico e Erudição',
    country: 'Brasil',
    countryFlag: '🇧🇷',
    category: 'brasil',
    period: '1938 — 2007',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80',
    quote: 'O meu nome é Enéas! Um país sem ciência própria, sem tecnologia própria e sem soberania é uma colônia de segunda categoria.',
    summary: 'Médico cardiologista, professor, matemático e deputado federal mais votado da história do Brasil. Ícone da retórica patriótica, soberania das riquezas nacionais e disciplina moral.',
    fullBio: 'Formado pela Escola de Medicina e Cirurgia do Rio de Janeiro, com mestrado em Cardiologia pela UFRJ e autor de livros-texto de eletrocardiografia adotados em todo o país. O Dr. Enéas fundou o Prona e conquistou o Brasil com seus pronunciamentos fulminantes de segundos na televisão. Defendeu a soberania mineral brasileira (especialmente o nióbio e o urânio), a disciplina na educação, a elevação científica do país e a dignidade moral contra a degradação dos costumes e a corrupção generalizada.',
    keyContributions: [
      'Defesa pioneira das riquezas minerais brasileiras e da soberania nacional',
      'Deputado Federal recordista histórico com mais de 1,5 milhão de votos',
      'Erudição ímpar aliada à coragem de falar as verdades duras ao povo brasileiro',
      'Inspiração perene de patriotismo apaixonado e disciplina cívica'
    ],
    keyWorks: [
      { title: 'O Eletrocardiograma', year: '1977', desc: 'Clássico absoluto da literatura médica e diagnóstica cardiológica no Brasil.' },
      { title: 'Um Grande Projeto Nacional', year: '1994', desc: 'Proposta detalhada de reerguimento científico, moral e soberano do Brasil.' }
    ],
    principles: [
      'Soberania incondicional sobre o solo e as riquezas do Brasil',
      'Primazia do estudo, da disciplina e da ciência',
      'Honra, caráter e retidão inegociáveis na vida pública'
    ]
  },
  {
    id: 'winston_churchill',
    name: 'Sir Winston Churchill',
    title: 'O Estadista que Salvou a Civilização Ocidental',
    country: 'Reino Unido',
    countryFlag: '🇬🇧',
    category: 'mundo',
    period: '1874 — 1965',
    image: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&w=600&q=80',
    quote: 'Nunca, no campo dos conflitos humanos, tantos deveram tanto a tão poucos.',
    summary: 'Primeiro-ministro britânico, historiador vencedor do Nobel de Literatura. A muralha inabalável da coragem moral contra o totalitarismo nazista.',
    fullBio: 'Quando quase toda a Europa continental havia caído sob as botas do Terceiro Reich e muitos propunham a rendição, Churchill permaneceu firme, mobilizou a língua inglesa como exército e liderou a Grã-Bretanha e o mundo livre até a vitória final. Também foi o primeiro a alertar o Ocidente sobre a ameaça do comunismo soviético com seu célebre discurso da Cortina de Ferro em Fulton, Missouri (1946).',
    keyContributions: [
      'Liderança inabalável na resistência e derrota do fascismo e nazismo',
      'Alerta pioneiro mundial sobre a "Cortina de Ferro" soviética',
      'Prêmio Nobel de Literatura por seus tratados de história da Segunda Guerra'
    ],
    keyWorks: [
      { title: 'A Segunda Guerra Mundial (6 volumes)', year: '1948-1953', desc: 'Narrativa monumental da vitória da civilização sobre a barbárie.' },
      { title: 'Discursos de Guerra: "Sangue, Suor e Lágrimas"', year: '1940', desc: 'A maior manifestação de liderança moral e oratória da era moderna.' }
    ],
    principles: [
      'Nunca, jamais, em hipótese alguma se render ao mal',
      'A defesa da liberdade requer sacrifício e determinação resoluta',
      'A herança civilizatória ocidental como patrimônio da humanidade'
    ]
  },
  {
    id: 'javier_milei',
    name: 'Javier Milei',
    title: 'Líder da Batalha Cultural e da Liberdade na América Latina',
    country: 'Argentina',
    countryFlag: '🇦🇷',
    category: 'mundo',
    period: '1970 — Presente',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
    quote: 'Viva la libertad, carajo! Não vim para guiar cordeiros, vim para acordar leões.',
    summary: 'Economista da Escola Austríaca e Presidente da Argentina. Lidera a reversão histórica do estatismo e da inflação com coragem e clareza conceitual.',
    fullBio: 'Javier Milei transformou a política sul-americana ao desafiar o peronismo hegemônico que empobreceu uma das nações mais ricas do planeta durante um século. Com base sólida em Ludwig von Mises, Murray Rothbard e Friedrich Hayek, demonstrou no Fórum Econômico Mundial de Davos que o capitalismo de livre iniciativa não é apenas o sistema mais eficiente de geração de riqueza, mas o único moralmente justo, pois é baseado na cooperação pacífica e voluntária.',
    keyContributions: [
      'Primeiro presidente libertário/anarcocapitalista eleito do mundo',
      'Déficit fiscal zero histórico e colapso rápido da hiperinflação argentina',
      'Defesa estrondosa da moralidade do capitalismo no palco global de Davos'
    ],
    keyWorks: [
      { title: 'O Caminho do Libertário', year: '2022', desc: 'A trajetória e as ideias de como quebrar a casta política e devolver a liberdade aos cidadãos.' },
      { title: 'Discurso de Davos', year: '2024', desc: 'Alerta histórico aos líderes mundiais contra as ciladas do socialismo moderno.' }
    ],
    principles: [
      'O respeito irrestrito ao projeto de vida do próximo',
      'O direito à vida, à liberdade e à propriedade privada',
      'O déficit zero e a disciplina orçamentária sagrada'
    ]
  }
];

// O QUE É SER DE DIREITA - 6 PILARES ESTRUTURAIS
const RIGHT_WING_PILLARS = [
  {
    number: '01',
    title: 'Dignidade & Liberdade Individual',
    subtitle: 'O homem como agente moral soberano',
    icon: Scale,
    description: 'A direita compreende que o indivíduo é dotado de direitos naturais inalienáveis (vida, liberdade e busca pela felicidade) conferidos pelo Criador e pela própria natureza, e jamais concedidos por capricho do Estado. Cada ser humano é responsável moralmente por seus atos, suas escolhas e seu destino.',
    keyPoints: [
      'O indivíduo é o fim da sociedade, não um meio para objetivos coletivistas',
      'Liberdade de consciência, de expressão e de crença religiosa irrestrita',
      'A meritocracia e a responsabilidade pessoal como base da maturidade cívica'
    ]
  },
  {
    number: '02',
    title: 'Propriedade Privada & Mercado Livre',
    subtitle: 'A base material da liberdade humana',
    icon: Landmark,
    description: 'Não existe liberdade política duradoura sem liberdade econômica. O direito de desfrutar e herdar o fruto do próprio suor e trabalho é sagrado. A livre concorrência, a desregulamentação e o sistema de preços livres são os maiores instrumentos de erradicação da pobreza e geração de prosperidade que a civilização já produziu.',
    keyPoints: [
      'A propriedade privada como extensão da própria vida humana',
      'Capitalismo de livre mercado baseado em trocas voluntárias e não em conchavos estatais',
      'Redução drástica de tributos e eliminação de burocracias sufocantes'
    ]
  },
  {
    number: '03',
    title: 'Família, Tradição & Raízes Cristãs',
    subtitle: 'A primeira trincheira de defesa do cidadão',
    icon: Heart,
    description: 'A família é a célula mater da sociedade e a guardiã dos valores morais perenes. A herança judaico-cristã moldou a civilização ocidental, ensinando a sacralidade da vida e a solidariedade orgânica. Instituições voluntárias e costumes herdados dos nossos antepassados carregam sabedoria acumulada que nenhuma teoria abstrata pode substituir.',
    keyPoints: [
      'A família como espaço natural de proteção, educação e carinho',
      'Respeito à moralidade pública e aos laços comunitários espontâneos',
      'Preservação da memória histórica contra o cancelamento cultural'
    ]
  },
  {
    number: '04',
    title: 'Governo Limitado & Império da Lei',
    subtitle: 'O Estado como servo da ordem, não senhor da sociedade',
    icon: ShieldCheck,
    description: 'O poder político tende inexoravelmente à expansão e à corrupção se não for rigorosamente contido. A direita defende o princípio da "Subsidiariedade": o que o indivíduo pode fazer por si, a família não deve tirar; o que a comunidade local pode resolver, o governo central não deve usurpar. A lei deve ser justa, igual para todos e previsível.',
    keyPoints: [
      'Separação real de poderes e freios e contrapesos constitucionais',
      'Combate severo à corrupção, impunidade e privilégios corporativos',
      'Segurança pública rigorosa e direito constitucional à legítima defesa'
    ]
  },
  {
    number: '05',
    title: 'Soberania Nacional & Patriotismo',
    subtitle: 'O amor sincero pelo próprio chão e pelo próprio povo',
    icon: Flag,
    description: 'Ser patriota não é odiar as outras nações, mas amar a sua em primeiro lugar. Significa defender as fronteiras, os símbolos nacionais, o idioma, a cultura e a soberania do país contra imposições autoritárias de burocratas globalistas ou organizações transnacionais não eleitas que pretendem ditar o destino do povo brasileiro.',
    keyPoints: [
      'Proteção das fronteiras e das riquezas estratégicas da pátria',
      'Autonomia nacional contra agendas globalistas centralizadoras',
      'Reverência aos heróis nacionais que construíram o Brasil'
    ]
  },
  {
    number: '06',
    title: 'Prudência & Guerra Cultural',
    subtitle: 'Resistência lúcida contra o totalitarismo ideológico',
    icon: GraduationCap,
    description: 'Diferente da esquerda que promete criar um "novo homem" por meio de revoluções e engenharia social destrutiva, a direita reconhece as imperfeições da natureza humana e aposta na melhora contínua e prudente. Na era contemporânea, conforme ensinou Olavo de Carvalho, é dever de todo homem livre combater o aparelhamento cultural e educacional que tenta anestesiar as mentes.',
    keyPoints: [
      'Rejeição às utopias totalitárias que justificam meios brutais em nome de fins nobres',
      'Combate à ocupação de espaços e à destruição da linguagem na educação e na mídia',
      'A sabedoria burkeana: preservar o que é bom, corrigir o que está com defeito'
    ]
  }
];

// PERGUNTAS DO QUIZ DE AFINIDADE PATRIÓTICA
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Qual deve ser a principal função do Estado na sociedade?',
    options: [
      { text: 'Garantir a segurança, a ordem jurídica e preservar a herança moral e as tradições do povo.', profile: 'Conservador Clássico (Burke / Scruton)' },
      { text: 'Garantir a soberania nacional, a grandeza da pátria e combater a corrupção com firmeza.', profile: 'Patriota Nacionalista (Bolsonaro / Enéas)' },
      { text: 'Garantir apenas contratos e direitos de propriedade, deixando o mercado atuar livremente.', profile: 'Liberal / Escola Austríaca (Hayek / Sowell / Milei)' },
      { text: 'Formar homens cultos e honestos que busquem a verdade e resistam à manipulação ideológica.', profile: 'Filosófico Olavista (Olavo de Carvalho)' }
    ]
  },
  {
    id: 2,
    question: 'Onde reside a maior ameaça à liberdade dos cidadãos hoje?',
    options: [
      { text: 'Na perda do senso moral e na destruição deliberada da cultura e da inteligência (Guerra Cultural).', profile: 'Filosófico Olavista (Olavo de Carvalho)' },
      { text: 'No gigantismo estatal, nos impostos abusivos e na emissão monetária que causa inflação.', profile: 'Liberal / Escola Austríaca (Hayek / Sowell / Milei)' },
      { text: 'No avanço do comunismo internacional e das oligarquias que desprezam os valores da família e de Deus.', profile: 'Patriota Nacionalista (Bolsonaro / Enéas)' },
      { text: 'No esquecimento das lições da história e no relativismo que destrói as instituições ancestrais.', profile: 'Conservador Clássico (Burke / Scruton)' }
    ]
  },
  {
    id: 3,
    question: 'Como a riqueza e a justiça social são verdadeiramente alcançadas?',
    options: [
      { text: 'Através da livre concorrência, poupança, respeito aos contratos e liberdade para empreender.', profile: 'Liberal / Escola Austríaca (Hayek / Sowell / Milei)' },
      { text: 'Com trabalho honesto, valorização do produtor rural e proteção ao cidadão de bem que acorda cedo.', profile: 'Patriota Nacionalista (Bolsonaro / Enéas)' },
      { text: 'Pela cooperação orgânica nas comunidades, virtude individual e respeito intergeracional.', profile: 'Conservador Clássico (Burke / Scruton)' },
      { text: 'Com homens intelectualmente maduros que não se deixam enganar por promessas assistencialistas farsescas.', profile: 'Filosófico Olavista (Olavo de Carvalho)' }
    ]
  }
];

export const MemorialView: React.FC<{
  currentUser: User | null;
  onOpenAuth: () => void;
  onNavigate: (view: string, param?: string) => void;
}> = ({ currentUser, onOpenAuth, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'olavo' | 'pantheon' | 'what_is_right' | 'quiz' | 'tributes'>('olavo');
  const [selectedFigure, setSelectedFigure] = useState<MemorialFigure | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'filosofo' | 'brasil' | 'mundo' | 'economia'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tribute flames in LocalStorage
  const [tributesCount, setTributesCount] = useState<{ [key: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('sb_memorial_tributes');
      return saved ? JSON.parse(saved) : {
        olavo_de_carvalho: 154820,
        jair_bolsonaro: 218900,
        edmund_burke: 43210,
        thomas_sowell: 67890,
        reagan_thatcher: 89450,
        eneas_carneiro: 98120
      };
    } catch {
      return { olavo_de_carvalho: 154820, jair_bolsonaro: 218900 };
    }
  });

  const [hasTributed, setHasTributed] = useState<{ [key: string]: boolean }>({});
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: string }>({});
  const [quizResult, setQuizResult] = useState<string | null>(null);

  // Active subtab for Olavo Section
  const [olavoSubTab, setOlavoSubTab] = useState<'legado' | 'obras' | 'conceitos' | 'frases'>('legado');

  useEffect(() => {
    try {
      localStorage.setItem('sb_memorial_tributes', JSON.stringify(tributesCount));
    } catch (e) {
      console.error(e);
    }
  }, [tributesCount]);

  const handleTribute = (figId: string, figName: string) => {
    if (hasTributed[figId]) {
      showToast(`Você já prestou sua homenagem solene a ${figName}.`);
      return;
    }
    setTributesCount(prev => ({
      ...prev,
      [figId]: (prev[figId] || 0) + 1
    }));
    setHasTributed(prev => ({ ...prev, [figId]: true }));
    showToast(`🕯️ Homenagem prestada! A chama perpétua de ${figName} foi renovada.`);
  };

  const handleShareQuote = (quote: string, author: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`"${quote}" — ${author} (Memorial dos Pensadores • Sociedade Bosonarista)`);
      showToast('Citação copiada para a área de transferência!');
    }
  };

  const handleSelectQuizAnswer = (qId: number, profile: string) => {
    const updated = { ...quizAnswers, [qId]: profile };
    setQuizAnswers(updated);

    if (Object.keys(updated).length === QUIZ_QUESTIONS.length) {
      // Calculate most frequent
      const counts: { [k: string]: number } = {};
      Object.values(updated).forEach(p => {
        counts[p] = (counts[p] || 0) + 1;
      });
      let bestProfile = Object.keys(counts)[0];
      let maxC = 0;
      for (const [k, v] of Object.entries(counts)) {
        if (v > maxC) {
          maxC = v;
          bestProfile = k;
        }
      }
      setQuizResult(bestProfile);
      showToast('Resultado calculado com sucesso!');
    }
  };

  const filteredFigures = MEMORIAL_FIGURES.filter(fig => {
    const matchesCategory = categoryFilter === 'all' || fig.category === categoryFilter;
    const matchesQuery = !searchQuery.trim() || 
      fig.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fig.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const olavoFigure = MEMORIAL_FIGURES.find(f => f.id === 'olavo_de_carvalho')!;

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#F5F5F0]">
      
      {/* 1. MONUMENTAL HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/40 shadow-[0_0_35px_rgba(212,175,55,0.15)] bg-[#0A1A12]">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/memorial/memorial_hall.jpg" 
            alt="Memorial Pantheon" 
            className="w-full h-full object-cover object-center opacity-30 filter brightness-90 saturate-120"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07140F] via-[#07140F]/80 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/20 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#174D32]/90 border border-[#D4AF37]/50 text-[#E8CC76] text-xs font-bold tracking-wider uppercase shadow-md">
            <Landmark className="w-4 h-4 text-[#D4AF37]" />
            Ala Memorial & Panteão Cívico
          </div>

          <h1 className="font-serif-patriotic text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D0] via-[#E5AC24] to-[#C99818] tracking-wide drop-shadow-md">
            MEMORIAL DOS PATRIOTAS & PENSADORES
          </h1>

          <p className="text-sm sm:text-base text-[#C5D0C9] max-w-2xl mx-auto leading-relaxed">
            Preservando a honra dos grandes filósofos, a bravura dos estadistas e os valores perenes da <strong className="text-[#E8CC76]">Civilização Ocidental</strong>, da <strong className="text-[#E8CC76]">Liberdade</strong> e da <strong className="text-[#E8CC76]">Pátria Brasileira</strong>.
          </p>

          {/* Quick stats counter */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#A5B2A9]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D4AF37]" />
              <span><strong>14+</strong> Grandes Biografias</span>
            </div>
            <div className="flex items-center gap-2">
              <Library className="w-4 h-4 text-[#D4AF37]" />
              <span><strong>35+</strong> Obras e Tratados Clássicos</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#E5AC24]" />
              <span><strong>{(Object.values(tributesCount).reduce((a, b) => a + b, 0)).toLocaleString('pt-BR')}</strong> Homenagens Cívicas</span>
            </div>
          </div>
        </div>

        {/* TOP TAB NAVIGATION BAR */}
        <div className="relative z-10 border-t border-[#263B30] bg-[#07140F]/90 backdrop-blur-md px-2 py-2 flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveTab('olavo')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
              activeTab === 'olavo'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] shadow-lg shadow-[#D4AF37]/20'
                : 'text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>Olavo de Carvalho</span>
          </button>

          <button
            onClick={() => setActiveTab('pantheon')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
              activeTab === 'pantheon'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] shadow-lg shadow-[#D4AF37]/20'
                : 'text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F]'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 shrink-0" />
            <span>Panteão de Lideranças</span>
          </button>

          <button
            onClick={() => setActiveTab('what_is_right')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
              activeTab === 'what_is_right'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] shadow-lg shadow-[#D4AF37]/20'
                : 'text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Ser de Direita</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] shadow-lg shadow-[#D4AF37]/20'
                : 'text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>Bússola de Valores</span>
          </button>
        </div>
      </div>

      {/* 2. SECTION A: OLAVO DE CARVALHO (DESTAQUE ABSOLUTO) */}
      {activeTab === 'olavo' && (
        <div className="space-y-6">
          
          {/* Main Olavo Banner Card with high detail generated portrait */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#102019] border-2 border-[#D4AF37]/60 shadow-[0_0_40px_rgba(212,175,55,0.18)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#D4AF37]/10 via-[#174D32]/10 to-transparent rounded-bl-full pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Portrait with luxury golden border */}
              <div className="lg:col-span-5 relative group">
                <div className="relative rounded-2xl overflow-hidden border-4 border-[#E5AC24] shadow-2xl shadow-black/80 p-1 bg-gradient-to-b from-[#FFF5D0] via-[#AA8325] to-[#4A380A]">
                  <img 
                    src="/assets/memorial/olavo_de_carvalho.jpg" 
                    alt="Professor Olavo de Carvalho em sua biblioteca" 
                    className="w-full h-[380px] sm:h-[420px] object-cover rounded-xl transition duration-500 group-hover:scale-105"
                  />
                  
                  {/* Memorial plaque at bottom of image */}
                  <div className="absolute bottom-3 left-3 right-3 bg-[#07140F]/90 backdrop-blur-md p-3 rounded-xl border border-[#D4AF37]/50 text-center shadow-lg">
                    <p className="font-serif-patriotic font-bold text-sm text-[#FFF5D0]">
                      Olavo Luiz Pimentel de Carvalho
                    </p>
                    <p className="text-[11px] text-[#D4AF37] tracking-wider uppercase">
                      1947 — 2022 • In Memoriam
                    </p>
                  </div>
                </div>

                {/* Tributo flame button */}
                <div className="mt-4 flex items-center justify-between gap-3 p-3 bg-[#0B1A13] rounded-2xl border border-[#263B30]">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#174D32] border border-[#D4AF37] flex items-center justify-center text-[#E5AC24] shadow">
                      <Flame className="w-5 h-5 fill-current animate-pulse" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#F5F5F0]">
                        {(tributesCount['olavo_de_carvalho'] || 0).toLocaleString('pt-BR')} Homenagens
                      </div>
                      <div className="text-[10px] text-[#A5B2A9]">Chama perpétua acesa</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTribute('olavo_de_carvalho', 'Olavo de Carvalho')}
                    className="px-3.5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-extrabold text-xs rounded-xl hover:brightness-110 active:scale-95 transition shadow"
                  >
                    Acender Vela 🕯️
                  </button>
                </div>
              </div>

              {/* Olavo Narrative and Key Pillars */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#15291F] border border-[#D4AF37]/40 text-[#E8CC76] text-xs font-bold">
                  <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Patrono Intelectual do Conservadorismo Brasileiro
                </div>

                <h2 className="font-serif-patriotic text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F5F5F0] leading-tight">
                  A Voz Solitária que Rompeu Décadas de Hegemonia Cultural
                </h2>

                {/* Big Quote */}
                <div className="p-4 rounded-2xl bg-[#091510] border-l-4 border-[#D4AF37] text-sm italic text-[#E8CC76] relative">
                  <Quote className="w-6 h-6 text-[#D4AF37]/30 absolute right-3 top-3" />
                  "A sabedoria começa na honestidade da própria percepção. Não queira vencer um debate, queira descobrir a verdade."
                </div>

                <p className="text-sm text-[#C5D0C9] leading-relaxed">
                  Olavo de Carvalho realizou no Brasil uma façanha sem paralelo na história intelectual do Ocidente moderno: a partir de artigos de jornal e cursos ministrados independentemente, quebrou o monopólio cultural de esquerda que asfixiava as universidades, a imprensa e a política desde a década de 1970.
                </p>

                <p className="text-sm text-[#C5D0C9] leading-relaxed">
                  Criador do monumental <strong className="text-[#E8CC76]">Seminário de Filosofia (COF)</strong>, resgatou o estudo dos clássicos gregos, de Santo Tomás de Aquino, da fenomenologia e dos maiores pensadores europeus, formando a geração que hoje lidera o renascimento conservador no Brasil.
                </p>

                {/* Subtabs inside Olavo */}
                <div className="pt-2 flex flex-wrap gap-2 border-b border-[#263B30] pb-3">
                  <button
                    onClick={() => setOlavoSubTab('legado')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      olavoSubTab === 'legado' 
                        ? 'bg-[#174D32] text-[#E8CC76] border border-[#D4AF37]/50' 
                        : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                    }`}
                  >
                    🏛️ Contribuições Históricas
                  </button>
                  <button
                    onClick={() => setOlavoSubTab('obras')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      olavoSubTab === 'obras' 
                        ? 'bg-[#174D32] text-[#E8CC76] border border-[#D4AF37]/50' 
                        : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                    }`}
                  >
                    📚 Obras Fundamentais ({olavoFigure.keyWorks.length})
                  </button>
                  <button
                    onClick={() => setOlavoSubTab('conceitos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      olavoSubTab === 'conceitos' 
                        ? 'bg-[#174D32] text-[#E8CC76] border border-[#D4AF37]/50' 
                        : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                    }`}
                  >
                    💡 Conceitos Filosóficos
                  </button>
                  <button
                    onClick={() => setOlavoSubTab('frases')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      olavoSubTab === 'frases' 
                        ? 'bg-[#174D32] text-[#E8CC76] border border-[#D4AF37]/50' 
                        : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                    }`}
                  >
                    🎙️ Frases Memoráveis
                  </button>
                </div>

                {/* Subtab Content: Legado */}
                {olavoSubTab === 'legado' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {olavoFigure.keyContributions.map((c, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#0B1A13] border border-[#263B30] flex items-start gap-2.5 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                        <span className="text-[#E0E6E2]">{c}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtab Content: Obras */}
                {olavoSubTab === 'obras' && (
                  <div className="space-y-2.5 pt-2">
                    {olavoFigure.keyWorks.map((work, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#0B1A13] border border-[#263B30] hover:border-[#D4AF37]/40 transition">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif-patriotic font-bold text-xs sm:text-sm text-[#FFF5D0]">
                            {work.title}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#174D32] text-[#E8CC76] font-semibold">
                            {work.year}
                          </span>
                        </div>
                        <p className="text-xs text-[#A5B2A9] mt-1 leading-relaxed">
                          {work.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtab Content: Conceitos */}
                {olavoSubTab === 'conceitos' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-[#0B1A13] border border-[#263B30]">
                      <h4 className="text-xs font-bold text-[#E8CC76] flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-[#D4AF37]" />
                        Teoria dos 4 Discursos
                      </h4>
                      <p className="text-[11px] text-[#A5B2A9] mt-1">
                        Aristóteles em nova chave: Poética (o possível), Retórica (o verossímil), Dialética (o provável) e Lógica (o certo).
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1A13] border border-[#263B30]">
                      <h4 className="text-xs font-bold text-[#E8CC76] flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                        As 12 Camadas da Personalidade
                      </h4>
                      <p className="text-[11px] text-[#A5B2A9] mt-1">
                        Um mapa completo da evolução da consciência humana, desde o bebê até a consciência histórica e espiritual diante de Deus.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1A13] border border-[#263B30]">
                      <h4 className="text-xs font-bold text-[#E8CC76] flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-[#D4AF37]" />
                        Guerra Cultural & Gramscismo
                      </h4>
                      <p className="text-[11px] text-[#A5B2A9] mt-1">
                        Como a esquerda operou a ocupação paulatina dos aparelhos formadores de opinião (mídia, escolas e artes) antes de tomar o poder político.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1A13] border border-[#263B30]">
                      <h4 className="text-xs font-bold text-[#E8CC76] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                        O Foro de São Paulo
                      </h4>
                      <p className="text-[11px] text-[#A5B2A9] mt-1">
                        A denúncia da articulação continental entre partidos de esquerda e guerrilhas armadas quando a imprensa nacional fingia que nada existia.
                      </p>
                    </div>
                  </div>
                )}

                {/* Subtab Content: Frases */}
                {olavoSubTab === 'frases' && (
                  <div className="space-y-2.5 pt-2">
                    {[
                      'Estude para ser útil ao seu país, não para ostentar um diploma.',
                      'O Brasil não precisa de mais leis, precisa de homens que tenham vergonha na cara.',
                      'A destruição da linguagem é o primeiro passo para a destruição da inteligência e da moral.',
                      'Não acredite no que os políticos dizem que farão; observe o que eles já destruíram.',
                      'A coragem é a primeira das virtudes, porque sem ela todas as outras dependem do acaso.'
                    ].map((quoteText, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#0B1A13] border border-[#263B30] flex items-center justify-between gap-3">
                        <p className="text-xs italic text-[#D8E2DC]">"{quoteText}"</p>
                        <button
                          onClick={() => handleShareQuote(quoteText, 'Olavo de Carvalho')}
                          className="p-1.5 rounded-lg bg-[#15291F] text-[#D4AF37] hover:bg-[#174D32] transition shrink-0"
                          title="Copiar citação"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Quick Tribute Box / Olavo's Video & Seminar banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#102019] to-[#0A1A12] border border-[#263B30] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-serif-patriotic font-bold text-lg text-[#FFF5D0] flex items-center justify-center md:justify-start gap-2">
                <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                O Legado Vivo do Seminário de Filosofia
              </h3>
              <p className="text-xs text-[#A5B2A9] max-w-xl">
                Mais de 500 aulas gravadas, milhares de alunos e um corpo de conhecimento que continua inspirando parlamentares, juristas, escritores e patriotas em todo o Brasil.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setSelectedFigure(olavoFigure)}
                className="px-5 py-2.5 bg-[#174D32] text-[#E8CC76] border border-[#D4AF37]/50 font-bold text-xs rounded-xl hover:bg-[#1E5C3D] transition shadow"
              >
                Ver Ficha Completa
              </button>
              <button
                onClick={() => setActiveTab('what_is_right')}
                className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-extrabold text-xs rounded-xl hover:brightness-110 transition shadow"
              >
                Entender a Filosofia da Direita
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SECTION B: PANTEÃO DE LIDERANÇAS E FILÓSOFOS */}
      {activeTab === 'pantheon' && (
        <div className="space-y-6">
          
          {/* Filters and Search Bar */}
          <div className="p-4 rounded-2xl bg-[#102019] border border-[#263B30] flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: 'Todos os Mestres' },
                { id: 'filosofo', label: 'Filósofos & Pensadores' },
                { id: 'brasil', label: 'Lideranças do Brasil' },
                { id: 'mundo', label: 'Estadistas Mundiais' },
                { id: 'economia', label: 'Economistas da Liberdade' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    categoryFilter === cat.id
                      ? 'bg-[#D4AF37] text-[#07140F] shadow-sm'
                      : 'bg-[#15291F] text-[#A5B2A9] hover:text-[#F5F5F0]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-[#A5B2A9] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar pensador ou líder..."
                className="w-full bg-[#0B1A13] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] pl-9 pr-3 py-2 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* Cards Grid - 2 cols max to have enough width for text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredFigures.map((fig) => (
              <div 
                key={fig.id}
                className="group rounded-3xl bg-[#102019] border border-[#263B30] hover:border-[#D4AF37]/60 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-[#D4AF37]/10 flex flex-col overflow-hidden"
              >
                {/* Image Header with gold accent */}
                <div className="relative h-56 overflow-hidden bg-black/40">
                  <img 
                    src={fig.image} 
                    alt={fig.name} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102019] via-[#102019]/40 to-transparent" />
                  
                  {/* Badge top right: country flag + period */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#07140F]/80 backdrop-blur-md border border-[#263B30] text-[11px] font-semibold text-[#F5F5F0]">
                    <span>{fig.countryFlag}</span>
                    <span>{fig.period}</span>
                  </div>

                  {/* Badge top left: category */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#174D32]/90 border border-[#D4AF37]/50 text-[10px] font-bold text-[#E8CC76] uppercase tracking-wider">
                    {fig.category === 'filosofo' ? 'Filósofo' : fig.category === 'brasil' ? 'Brasil' : fig.category === 'mundo' ? 'Mundo' : 'Economia'}
                  </div>

                  {/* Name overlaid at bottom of image */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-serif-patriotic font-bold text-lg text-[#FFF5D0] group-hover:text-[#E5AC24] transition leading-tight">
                      {fig.name}
                    </h3>
                    <p className="text-[11px] text-[#A5B2A9] mt-0.5 line-clamp-2">
                      {fig.title}
                    </p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  {/* Quote Snippet */}
                  <div className="p-2.5 rounded-xl bg-[#0B1A13] border-l-2 border-[#D4AF37] text-xs italic text-[#D8E2DC]">
                    "{fig.quote}"
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-[#A5B2A9] leading-relaxed">
                    {fig.summary}
                  </p>

                  {/* Bottom Action Footer */}
                  <div className="pt-2 border-t border-[#263B30] flex items-center justify-between">
                    {/* Tribute mini counter */}
                    <button
                      onClick={() => handleTribute(fig.id, fig.name)}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-[#E8CC76] hover:text-[#FFF5D0] transition"
                    >
                      <Flame className="w-3.5 h-3.5 fill-[#E5AC24]" />
                      <span>{(tributesCount[fig.id] || 1200).toLocaleString('pt-BR')}</span>
                    </button>

                    <button
                      onClick={() => setSelectedFigure(fig)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#15291F] hover:bg-[#174D32] border border-[#263B30] hover:border-[#D4AF37]/50 text-xs font-bold text-[#F5F5F0] transition"
                    >
                      <span>Explorar</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFigures.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-[#102019] border border-[#263B30] text-xs text-[#A5B2A9]">
              Nenhum pensador ou líder encontrado para "{searchQuery}".
            </div>
          )}
        </div>
      )}

      {/* 4. SECTION C: O QUE É SER DE DIREITA? (DIDÁTICA E PILARES) */}
      {activeTab === 'what_is_right' && (
        <div className="space-y-6">
          
          {/* Header intro card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#102019] border border-[#263B30] space-y-3 relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#174D32] border border-[#D4AF37]/40 text-[#E8CC76] text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
              Guia Fundamental do Pensamento Cívico
            </div>

            <h2 className="font-serif-patriotic text-2xl sm:text-3xl font-extrabold text-[#FFF5D0]">
              O Que Significa Ser de Direita?
            </h2>

            <p className="text-sm text-[#C5D0C9] max-w-3xl leading-relaxed">
              Ao contrário do que a propaganda ideológica tenta difundir, ser de direita <strong>não é uma ideologia fechada</strong> que promete construir um paraíso na terra através da força do Estado. Ser de direita é uma <em>atitude perante a realidade</em>: o reconhecimento da natureza humana, o apreço pela prudência, o respeito às instituições comprovadas pelo tempo e a convicção de que o homem é um ser livre e moralmente responsável.
            </p>
          </div>

          {/* Six Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {RIGHT_WING_PILLARS.map((p) => {
              const IconComp = p.icon;
              return (
                <div 
                  key={p.number}
                  className="p-6 rounded-3xl bg-[#102019] border border-[#263B30] hover:border-[#D4AF37]/50 transition duration-300 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif-patriotic font-black text-2xl text-[#D4AF37]/40">
                      {p.number}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#15291F] border border-[#263B30] flex items-center justify-center text-[#D4AF37]">
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif-patriotic font-bold text-lg text-[#FFF5D0]">
                      {p.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#D4AF37]">
                      {p.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-[#C5D0C9] leading-relaxed">
                    {p.description}
                  </p>

                  <div className="pt-2 border-t border-[#263B30]/60 space-y-1.5">
                    {p.keyPoints.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-[#A5B2A9]">
                        <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direita vs Esquerda Comparison Table */}
          <div className="p-6 rounded-3xl bg-[#102019] border border-[#263B30] space-y-4">
            <h3 className="font-serif-patriotic font-bold text-lg text-[#FFF5D0] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#D4AF37]" />
              Quadro Comparativo: As Duas Visões de Mundo
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#263B30] text-[#E8CC76]">
                    <th className="py-3 px-4 font-bold">Dimensão</th>
                    <th className="py-3 px-4 font-bold bg-[#174D32]/30 rounded-l-xl">Pensamento de Direita</th>
                    <th className="py-3 px-4 font-bold bg-[#3A1414]/30 rounded-r-xl">Pensamento de Esquerda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#263B30]/50 text-[#C5D0C9]">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#F5F5F0]">Natureza Humana</td>
                    <td className="py-3 px-4 bg-[#174D32]/10">Falível e imperfeita. Nenhuma engenharia estatal pode criar um "novo homem".</td>
                    <td className="py-3 px-4 bg-[#3A1414]/10">Moldável pelo Estado. Defende que a sociedade corrompe e que o governo pode refundar a moral.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#F5F5F0]">Papel do Estado</td>
                    <td className="py-3 px-4 bg-[#174D32]/10">Limitado. Garantir leis, propriedade, defesa nacional e contratos. O resto pertence à sociedade civil.</td>
                    <td className="py-3 px-4 bg-[#3A1414]/10">Maximalista e onipresente. O Estado deve regular a economia, costumes e redistribuir tudo.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#F5F5F0]">Economia</td>
                    <td className="py-3 px-4 bg-[#174D32]/10">Mercado livre, incentivo à poupança, respeito ao esforço individual e geração de riqueza privada.</td>
                    <td className="py-3 px-4 bg-[#3A1414]/10">Intervencionismo, impostos altos, estatização e foco na divisão do que já foi produzido.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#F5F5F0]">Tradição e Família</td>
                    <td className="py-3 px-4 bg-[#174D32]/10">Pilares sagrados que protegem o indivíduo contra a tirania do poder estatal.</td>
                    <td className="py-3 px-4 bg-[#3A1414]/10">Estruturas tidas como "opressoras" a serem desconstruídas por revolução cultural.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#F5F5F0]">Soberania & Pátria</td>
                    <td className="py-3 px-4 bg-[#174D32]/10">Patriotismo, defesa de fronteiras, amor aos símbolos nacionais e autonomia da nação.</td>
                    <td className="py-3 px-4 bg-[#3A1414]/10">Internacionalismo, enfraquecimento das fronteiras e submissão a órgãos globais.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. SECTION D: BÚSSOLA DE VALORES (QUIZ INTERATIVO) */}
      {activeTab === 'quiz' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="p-6 rounded-3xl bg-[#102019] border border-[#263B30] text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#15291F] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="font-serif-patriotic text-2xl font-bold text-[#FFF5D0]">
              Bússola de Afinidade Filosófica
            </h2>
            <p className="text-xs text-[#A5B2A9] max-w-md mx-auto">
              Responda a estas 3 perguntas fundamentais e descubra qual vertente do pensamento conservador e de direita mais combina com a sua visão de mundo!
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {QUIZ_QUESTIONS.map((q) => (
              <div key={q.id} className="p-5 rounded-2xl bg-[#102019] border border-[#263B30] space-y-3">
                <h3 className="font-serif-patriotic font-bold text-sm text-[#F5F5F0] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#174D32] text-[#E8CC76] text-xs flex items-center justify-center font-bold">
                    {q.id}
                  </span>
                  {q.question}
                </h3>

                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    const isSelected = quizAnswers[q.id] === opt.profile;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectQuizAnswer(q.id, opt.profile)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-[#174D32] border-[#D4AF37] text-[#FFF5D0] font-semibold'
                            : 'bg-[#0B1A13] border-[#263B30] text-[#A5B2A9] hover:text-[#F5F5F0] hover:border-[#D4AF37]/40'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                          isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#4A5D52]'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#07140F]" />}
                        </div>
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quiz Result Card */}
          {quizResult && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#174D32] to-[#102019] border-2 border-[#D4AF37] text-center space-y-3 shadow-2xl animate-fade-in">
              <Sparkles className="w-8 h-8 text-[#E5AC24] mx-auto animate-bounce" />
              <p className="text-xs uppercase tracking-wider text-[#E8CC76] font-bold">Sua Vertente Principal</p>
              <h3 className="font-serif-patriotic font-black text-2xl text-[#FFF5D0]">
                {quizResult}
              </h3>
              <p className="text-xs text-[#C5D0C9] max-w-lg mx-auto leading-relaxed">
                Você valoriza a consistência moral, a clareza de princípios e a resistência cívica. Recomendamos aprofundar suas leituras nos textos disponíveis aqui no Memorial!
              </p>
              <button
                onClick={() => {
                  setActiveTab('pantheon');
                }}
                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-extrabold text-xs rounded-xl hover:brightness-110 shadow"
              >
                Explorar Seus Pensadores Afins
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6. MODAL: DETALHES COMPLETOS DO PENSADOR SELECIONADO */}
      {selectedFigure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#102019] border-2 border-[#D4AF37]/70 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-[#F5F5F0]">
            
            {/* Header Image */}
            <div className="relative h-64 overflow-hidden bg-black/60">
              <img 
                src={selectedFigure.image} 
                alt={selectedFigure.name} 
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102019] via-[#102019]/40 to-transparent" />
              
              <button
                onClick={() => setSelectedFigure(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#07140F]/80 border border-[#263B30] text-[#F5F5F0] hover:text-[#D4AF37] flex items-center justify-center font-bold text-lg transition"
              >
                ✕
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 text-xs text-[#E8CC76] font-bold">
                  <span>{selectedFigure.countryFlag} {selectedFigure.country}</span>
                  <span>•</span>
                  <span>{selectedFigure.period}</span>
                </div>
                <h2 className="font-serif-patriotic text-2xl sm:text-3xl font-extrabold text-[#FFF5D0]">
                  {selectedFigure.name}
                </h2>
                <p className="text-xs text-[#A5B2A9]">
                  {selectedFigure.title}
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-xs sm:text-sm">
              
              {/* Quote */}
              <div className="p-3.5 rounded-xl bg-[#0B1A13] border-l-4 border-[#D4AF37] italic text-[#E8CC76]">
                "{selectedFigure.quote}"
              </div>

              {/* Biography */}
              <div className="space-y-1.5">
                <h4 className="font-serif-patriotic font-bold text-sm text-[#FFF5D0] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  Biografia & Impacto Histórico
                </h4>
                <p className="text-[#C5D0C9] leading-relaxed">
                  {selectedFigure.fullBio}
                </p>
              </div>

              {/* Key Contributions */}
              <div className="space-y-2">
                <h4 className="font-serif-patriotic font-bold text-sm text-[#FFF5D0] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                  Principais Contribuições
                </h4>
                <div className="space-y-1.5">
                  {selectedFigure.keyContributions.map((cont, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#E0E6E2]">
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{cont}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Works */}
              {selectedFigure.keyWorks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-serif-patriotic font-bold text-sm text-[#FFF5D0] flex items-center gap-1.5">
                    <Library className="w-4 h-4 text-[#D4AF37]" />
                    Obras e Documentos Fundamentais
                  </h4>
                  <div className="space-y-2">
                    {selectedFigure.keyWorks.map((w, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#0B1A13] border border-[#263B30]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#FFF5D0]">{w.title}</span>
                          {w.year && <span className="text-[10px] text-[#D4AF37] font-semibold">{w.year}</span>}
                        </div>
                        <p className="text-[11px] text-[#A5B2A9] mt-1">{w.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Principles */}
              <div className="space-y-2">
                <h4 className="font-serif-patriotic font-bold text-sm text-[#FFF5D0] flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#D4AF37]" />
                  Princípios Inegociáveis
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFigure.principles.map((pr, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-[#15291F] border border-[#263B30] text-[11px] text-[#E8CC76] font-medium">
                      {pr}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Footer Action */}
              <div className="pt-4 border-t border-[#263B30] flex items-center justify-between">
                <button
                  onClick={() => handleTribute(selectedFigure.id, selectedFigure.name)}
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-bold text-xs rounded-xl hover:brightness-110 transition shadow flex items-center gap-1.5"
                >
                  <Flame className="w-4 h-4 fill-current" />
                  <span>Prestar Homenagem Cívica</span>
                </button>

                <button
                  onClick={() => setSelectedFigure(null)}
                  className="px-4 py-2 bg-[#15291F] text-[#A5B2A9] hover:text-[#F5F5F0] text-xs font-semibold rounded-xl"
                >
                  Fechar
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
