import {
  User,
  Post,
  NewsItem,
  DebateTopic,
  Group,
  ChatMessage,
  NotificationItem,
  ReportItem,
  AuditLogItem,
  AdminStats,
  NewsCategory,
  DebateCategory,
  ReportReason,
  UserRank,
  StoryItem
} from '../types';
import { calculateRankFromPoints, RANK_DEFINITIONS } from './rankService';

const STORAGE_KEYS = {
  USERS: 'sb_users_v2',
  CURRENT_USER_ID: 'sb_current_user_id_v2',
  POSTS: 'sb_posts_v2',
  NEWS: 'sb_news_v2',
  DEBATES: 'sb_debates_v2',
  GROUPS: 'sb_groups_v2',
  MESSAGES: 'sb_messages_v2',
  NOTIFICATIONS: 'sb_notifications_v2',
  REPORTS: 'sb_reports_v2',
  AUDIT_LOGS: 'sb_audit_logs_v2',
  STORIES: 'sb_stories_v2',
};

// Initial Seed Data
const DEFAULT_USERS: User[] = [
  {
    id: 'usr_kaliton',
    name: 'Kaliton Leite',
    username: 'kaliton_leite',
    email: 'kaliton@sociedadebosonarista.com.br',
    cpf: '123.456.789-00',
    password: 'brasil123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    coverImage: '/src/assets/images/brasil_hero_banner_1793411883121.jpg',
    bio: 'Patriota, cristão, defensor da família e da liberdade econômica no Brasil. Juntos por um país soberano e forte! Deus acima de tudo!',
    location: 'São Paulo, SP',
    role: 'admin',
    status: 'active',
    rank: 'general',
    honorPoints: 9500,
    createdAt: '2024-01-01T10:00:00Z',
    followersCount: 28400,
    followingCount: 154,
    postsCount: 112,
    verified: true,
    socialLinks: {
      instagram: 'https://instagram.com',
      x: 'https://x.com'
    }
  },
  {
    id: 'usr_admin',
    name: 'Administração Sociedade Bosonarista',
    username: 'admin_oficial',
    email: 'admin@sociedadebosonarista.com.br',
    cpf: '111.222.333-44',
    password: 'admin123',
    avatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    coverImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    bio: 'Canal oficial da moderação e administração da plataforma Sociedade Bosonarista. Defendendo valores, transparência e debate cívico soberano.',
    location: 'Brasília, DF',
    role: 'admin',
    status: 'active',
    rank: 'general',
    honorPoints: 9200,
    createdAt: '2024-01-01T10:00:00Z',
    followersCount: 34500,
    followingCount: 12,
    postsCount: 84,
    verified: true,
    socialLinks: {
      x: 'https://x.com',
      youtube: 'https://youtube.com',
      instagram: 'https://instagram.com',
      website: 'https://sociedadebosonarista.com.br'
    }
  },
  {
    id: 'usr_patriota22',
    name: 'Patriota22',
    username: 'patriota22',
    email: 'patriota22@brasil.com.br',
    cpf: '555.666.777-88',
    password: 'brasil123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    coverImage: '/src/assets/images/brasil_hero_banner_1793411883121.jpg',
    bio: 'Orgulho de ser brasileira! Em defesa da liberdade e do nosso país! 🇧🇷',
    location: 'Rio de Janeiro, RJ',
    role: 'user',
    status: 'active',
    rank: 'capitao',
    honorPoints: 3400,
    createdAt: '2024-02-10T10:00:00Z',
    followersCount: 14200,
    followingCount: 320,
    postsCount: 88,
    verified: true,
    socialLinks: {
      instagram: 'https://instagram.com'
    }
  },
  {
    id: 'usr_brasillivre',
    name: 'BrasilLivre',
    username: 'brasillivre',
    email: 'livre@brasil.com.br',
    cpf: '666.777.888-99',
    password: 'brasil123',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    bio: 'Defensor da livre iniciativa e do Estado enxuto. O Brasil tem pressa!',
    location: 'Belo Horizonte, MG',
    role: 'user',
    status: 'active',
    rank: 'tenente',
    honorPoints: 2100,
    createdAt: '2024-03-01T10:00:00Z',
    followersCount: 8900,
    followingCount: 190,
    postsCount: 45,
    verified: true,
    socialLinks: {
      x: 'https://x.com'
    }
  },
  {
    id: 'usr_direitaja',
    name: 'DireitaJá',
    username: 'direitaja',
    email: 'direitaja@brasil.com.br',
    cpf: '777.888.999-00',
    password: 'brasil123',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
    coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    bio: 'Mobilização política popular e fórum de debates conservadores.',
    location: 'Porto Alegre, RS',
    role: 'user',
    status: 'active',
    rank: 'sargento',
    honorPoints: 1450,
    createdAt: '2024-03-15T10:00:00Z',
    followersCount: 6500,
    followingCount: 240,
    postsCount: 39,
    verified: true,
    socialLinks: {
      instagram: 'https://instagram.com'
    }
  },
  {
    id: 'usr_silva',
    name: 'Coronel Silva Patriota',
    username: 'coronel_silva',
    email: 'patriota@brasil.com.br',
    cpf: '222.333.444-55',
    password: 'brasil123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    bio: 'Oficial da reserva, pai de família, defensor da pátria, da liberdade econômica e dos princípios constitucionais. Deus acima de tudo!',
    location: 'Curitiba, PR',
    role: 'user',
    status: 'active',
    rank: 'coronel',
    honorPoints: 5400,
    createdAt: '2024-02-15T14:30:00Z',
    followersCount: 8940,
    followingCount: 215,
    postsCount: 142,
    verified: true,
    socialLinks: {
      instagram: 'https://instagram.com',
      x: 'https://x.com',
      whatsapp: 'https://whatsapp.com'
    }
  },
  {
    id: 'usr_helena',
    name: 'Dra. Helena Moreira',
    username: 'dra_helena',
    email: 'helena@direito.com.br',
    cpf: '333.444.555-66',
    password: 'brasil123',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    bio: 'Advogada constitucionalista, mestre em Direito Público e defensora ferrenha da liberdade de expressão e da presunção de inocência.',
    location: 'São Paulo, SP',
    role: 'user',
    status: 'active',
    rank: 'capitao',
    honorPoints: 2150,
    createdAt: '2024-03-01T09:20:00Z',
    followersCount: 15420,
    followingCount: 430,
    postsCount: 95,
    verified: true,
    socialLinks: {
      x: 'https://x.com',
      youtube: 'https://youtube.com',
      website: 'https://helenamoreira.adv.br'
    }
  },
  {
    id: 'usr_rodrigo',
    name: 'Rodrigo Fagundes (Agro Forte)',
    username: 'rodrigo_agro',
    email: 'rodrigo@agro.com.br',
    cpf: '444.555.666-77',
    password: 'brasil123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    bio: 'Produtor rural de soja e milho no Centro-Oeste. O agronegócio sustenta o Brasil e alimenta o mundo com orgulho e tecnologia verde.',
    location: 'Sorriso, MT',
    role: 'user',
    status: 'active',
    rank: 'tenente',
    honorPoints: 1050,
    createdAt: '2024-03-10T11:00:00Z',
    followersCount: 11200,
    followingCount: 380,
    postsCount: 68,
    verified: false,
    socialLinks: {
      instagram: 'https://instagram.com',
      whatsapp: 'https://whatsapp.com'
    }
  }
];

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 'news_congresso',
    title: 'Congresso Nacional retoma votações importantes esta semana',
    subtitle: 'Senado e Câmara devem analisar projetos fundamentais para o país, incluindo pautas econômicas e de segurança.',
    summary: 'Senado e Câmara devem analisar projetos fundamentais para o país, incluindo pautas econômicas e de segurança.',
    content: `O Congresso Nacional inicia nesta semana uma rodada decisiva de votações legislativas no plenário da Câmara dos Deputados e do Senado Federal.\n\nEntre as matérias de maior relevância, destacam-se medidas de contenção fiscal, desoneração produtiva, blindagem jurídica para as atividades agrícolas e propostas que ampliam o rigor penal para crimes violentos.\n\nLideranças parlamentares articulam consenso em torno de projetos estruturantes que visam garantir a estabilidade institucional e o crescimento econômico sustentável do Brasil nos próximos anos.`,
    imageUrl: '/src/assets/images/brasil_hero_banner_1793411883121.jpg',
    category: 'POLÍTICA',
    authorId: 'usr_admin',
    authorName: 'Administração Sociedade Bosonarista',
    sourceOriginal: 'Agência Senado & Câmara dos Deputados',
    sourceUrl: 'https://www.camara.leg.br',
    publishedAt: '2025-10-18T10:00:00Z',
    isFeatured: true,
    viewsCount: 24500
  },
  {
    id: 'news_inflacao',
    title: 'Inflação mostra sinais de desaceleração',
    subtitle: 'Queda nos custos logísticos e safra recorde auxiliam na estabilização dos preços de alimentos.',
    summary: 'Índices oficiais apontam acomodação de preços nos principais setores produtivos nacionais.',
    content: `Os principais indicadores econômicos consolidados pelas entidades financeiras registraram expressiva desaceleração nos índices de preços ao consumidor neste mês.\n\nO resultado favorável é impulsionado pela alta produtividade das lavouras de grãos, pela redução de custos energéticos e pela estabilidade das cotações no atacado.\n\nEconomistas destacam que a disciplina fiscal e o estímulo à livre concorrência são caminhos indispensáveis para consolidar o poder de compra da família brasileira.`,
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
    category: 'ECONOMIA',
    authorId: 'usr_admin',
    authorName: 'Administração Sociedade Bosonarista',
    sourceOriginal: 'Indicadores Econômicos Nacionais',
    sourceUrl: 'https://www.gov.br/fazenda',
    publishedAt: '2025-10-17T14:30:00Z',
    isFeatured: true,
    viewsCount: 18400
  },
  {
    id: 'news_forcas_armadas',
    title: 'Forças Armadas seguem firmes na defesa do país',
    subtitle: 'Operações conjuntas na Amazônia e nas fronteiras terrestres e marítimas preservam a soberania.',
    summary: 'Militares atuam diuturnamente na defesa das riquezas naturais e na segurança das fronteiras territoriais.',
    content: `O Ministério da Defesa e os comandos das Forças Armadas intensificaram as ações integradas de patrulhamento e presença ostensiva em toda a extensão do território nacional.\n\nCom ênfase no arco norte amazônico e nos portos estratégicos, a prontidão militar cumpre missão constitucional permanente de resguardo da soberania, vigilância aeroespacial e apoio humanitário a comunidades isoladas.`,
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
    category: 'BRASIL',
    authorId: 'usr_admin',
    authorName: 'Administração Sociedade Bosonarista',
    sourceOriginal: 'Ministério da Defesa',
    sourceUrl: 'https://www.gov.br/defesa',
    publishedAt: '2025-10-16T09:15:00Z',
    isFeatured: true,
    viewsCount: 21900
  },
  {
    id: 'news_seguranca',
    title: 'Governo anuncia novas medidas de segurança',
    subtitle: 'Modernização de equipamentos, armamento policial e integração de inteligência contra o crime organizado.',
    summary: 'Novas diretrizes focam no fortalecimento do trabalho ostensivo e na proteção ao cidadão de bem.',
    content: `Foi apresentado o novo plano integrado de modernização das forças policiais estaduais e federais.\n\nO pacote engloba aquisição de viaturas blindadas, sistemas biométricos de monitoramento e garantia de suporte jurídico aos agentes de segurança pública no cumprimento de seu dever legal.`,
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    category: 'SEGURANÇA',
    authorId: 'usr_admin',
    authorName: 'Administração Sociedade Bosonarista',
    sourceOriginal: 'Secretarias de Segurança Pública',
    sourceUrl: 'https://www.gov.br/justica',
    publishedAt: '2025-10-15T18:00:00Z',
    isFeatured: true,
    viewsCount: 15400
  }
];

const DEFAULT_POSTS: Post[] = [

  {
    id: 'post_patriota22',
    authorId: 'usr_patriota22',
    authorName: 'Patriota22',
    authorUsername: 'patriota22',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    authorRole: 'user',
    authorRank: 'capitao',
    authorVerified: true,
    content: 'O Brasil precisa de união e de um povo forte! 🇧🇷 💪',
    category: 'Brasil',
    likesCount: 1420,
    likedUserIds: ['usr_kaliton'],
    commentsCount: 98,
    sharesCount: 142,
    savedUserIds: ['usr_kaliton'],
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    comments: [
      {
        id: 'c_p1',
        postId: 'post_patriota22',
        authorId: 'usr_kaliton',
        authorName: 'Kaliton Leite',
        authorUsername: 'kaliton_leite',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
        authorRank: 'general',
        content: 'Exatamente! Ninguém solta a mão de ninguém. Deus, Pátria e Família sempre!',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        likes: 54,
        likedUserIds: ['usr_patriota22']
      }
    ]
  },
  {
    id: 'post_1',
    authorId: 'usr_silva',
    authorName: 'Coronel Silva Patriota',
    authorUsername: 'coronel_silva',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    authorRole: 'user',
    authorRank: 'coronel',
    authorVerified: true,
    content: 'Boa noite, patriotas de todos os estados da nossa nação verde e amarela! Quero abrir esta consulta popular para a nossa comunidade aqui na Sociedade Bosonarista.\n\nQual destas prioridades deve ser a bandeira central número um do nosso movimento nas próximas mobilizações cívicas? Votem e deixem suas razões nos comentários! 🇧🇷',
    category: 'Política',
    poll: {
      question: 'Qual deve ser a principal prioridade do Congresso Nacional no próximo semestre?',
      totalVotes: 1420,
      options: [
        { id: 'opt_1', text: 'Corte radical de impostos e despesas estatais', votes: 685, votedUserIds: ['usr_helena'] },
        { id: 'opt_2', text: 'Endurecimento penal e fim das regalias para criminosos', votes: 412, votedUserIds: [] },
        { id: 'opt_3', text: 'Garantia irrestrita da liberdade de expressão e fim da censura', votes: 248, votedUserIds: [] },
        { id: 'opt_4', text: 'Blindagem do agronegócio e defesa da propriedade privada', votes: 75, votedUserIds: [] }
      ]
    },
    likesCount: 384,
    likedUserIds: ['usr_helena', 'usr_rodrigo'],
    commentsCount: 28,
    sharesCount: 52,
    savedUserIds: ['usr_admin'],
    createdAt: '2026-10-30T15:20:00Z',
    comments: []
  },
  {
    id: 'post_2',
    authorId: 'usr_admin',
    authorName: 'Administração Sociedade Bosonarista',
    authorUsername: 'admin_oficial',
    authorAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    authorRole: 'admin',
    authorRank: 'general',
    authorVerified: true,
    content: 'Sejam bem-vindos à plataforma oficial da SOCIEDADE BOSONARISTA!\n\nAqui nós nos reunimos para debater o futuro da nossa pátria, defender os valores que herdamos de nossos antepassados — Deus, Pátria, Família e Liberdade — e construir uma comunidade cívica participativa, ordeira e produtiva.\n\nConvide amigos, crie debates e acompanhe nossas notícias exclusivas diárias! 🇧🇷🌾⭐',
    category: 'Brasil',
    mediaUrl: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    mediaType: 'image',
    likesCount: 1240,
    likedUserIds: ['usr_silva', 'usr_helena', 'usr_rodrigo'],
    commentsCount: 84,
    sharesCount: 310,
    savedUserIds: ['usr_silva'],
    createdAt: '2026-10-30T12:00:00Z',
    comments: []
  }
];

const DEFAULT_DEBATES: DebateTopic[] = [
  {
    id: 'deb_futuro_brasil',
    title: 'Qual o futuro do Brasil?',
    description: 'Quais reformas prioritárias e diretrizes políticas e econômicas garantirão a soberania e o protagonismo do Brasil nas próximas décadas?',
    category: 'Política',
    authorId: 'usr_kaliton',
    authorName: 'Kaliton Leite',
    authorUsername: 'kaliton_leite',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    repliesCount: 124,
    proCount: 380,
    conCount: 22,
    replies: []
  },
  {
    id: 'deb_1',
    title: 'Auditabilidade do processo eleitoral: mecanismos modernos e contagem pública',
    description: 'Como as democracias mais maduras do mundo realizam a conferência dos sufrágios com transparência e verificação física e eletrônica concomitante?',
    category: 'Política brasileira',
    authorId: 'usr_helena',
    authorName: 'Dra. Helena Moreira',
    authorUsername: 'dra_helena',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    createdAt: '2026-10-29T14:00:00Z',
    repliesCount: 6,
    proCount: 148,
    conCount: 12,
    replies: [
      {
        id: 'dr_1',
        debateId: 'deb_1',
        authorId: 'usr_silva',
        authorName: 'Coronel Silva Patriota',
        authorUsername: 'coronel_silva',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        stance: 'pro',
        content: 'Todo processo público deve ser auditável de ponta a ponta pelo cidadão comum, e não apenas por especialistas em informática. O voto impresso acoplado à urna eletrônica, sem contato manual do eleitor, é o padrão de segurança adotado por nações como Japão e diversos estados americanos.',
        upvotes: 45,
        upvotedUserIds: ['usr_helena'],
        createdAt: '2026-10-29T14:35:00Z'
      },
      {
        id: 'dr_2',
        debateId: 'deb_1',
        authorId: 'usr_rodrigo',
        authorName: 'Rodrigo Fagundes (Agro Forte)',
        authorUsername: 'rodrigo_agro',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
        stance: 'pro',
        content: 'A transparência nunca enfraquece uma instituição; pelo contrário, fortalece a confiança cívica de quem vota e de quem é eleito.',
        upvotes: 31,
        upvotedUserIds: [],
        createdAt: '2026-10-29T15:10:00Z'
      }
    ]
  },
  {
    id: 'deb_2',
    title: 'Desoneração da folha e simplificação tributária real vs. aumento disfarçado de alíquotas',
    description: 'A reforma tributária aprovada atende verdadeiramente aos setores de comércio, serviços e agropecuária ou trará concentração de arrecadação?',
    category: 'Economia',
    authorId: 'usr_rodrigo',
    authorName: 'Rodrigo Fagundes (Agro Forte)',
    authorUsername: 'rodrigo_agro',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    createdAt: '2026-10-28T10:00:00Z',
    repliesCount: 4,
    proCount: 89,
    conCount: 16,
    replies: []
  },
  {
    id: 'deb_3',
    title: 'Limites do Ativismo Judicial e as Prerrogativas dos Poderes Eleitos',
    description: 'Qual é o papel do Senado Federal na fiscalização e no equilíbrio harmônico entre os três poderes da República?',
    category: 'Liberdade de expressão',
    authorId: 'usr_admin',
    authorName: 'Administração Sociedade Bosonarista',
    authorUsername: 'admin_oficial',
    authorAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    createdAt: '2026-10-27T17:00:00Z',
    repliesCount: 12,
    proCount: 220,
    conCount: 5,
    replies: []
  }
];

const DEFAULT_GROUPS: Group[] = [
  {
    id: 'grp_brasil_forte',
    name: 'Brasil Forte',
    description: 'Movimento cívico nacional pela soberania, liberdade econômica, fortalecimento familiar e patriotismo.',
    coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    category: 'Movimento Cívico',
    creatorId: 'usr_admin',
    isPrivate: false,
    membersCount: 253000,
    memberUserIds: ['usr_kaliton', 'usr_admin', 'usr_silva'],
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'grp_direita_brasil',
    name: 'Direita Brasil',
    description: 'União de conservadores, liberais e patriotas em defesa do livre mercado e dos valores cristãos.',
    coverImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    category: 'Política',
    creatorId: 'usr_admin',
    isPrivate: false,
    membersCount: 184000,
    memberUserIds: ['usr_kaliton', 'usr_admin'],
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'grp_liberdade_ja',
    name: 'Liberdade Já',
    description: 'Comunidade ativa contra a censura e em defesa da livre manifestação de pensamento nas redes.',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    category: 'Direito & Liberdade',
    creatorId: 'usr_admin',
    isPrivate: false,
    membersCount: 127000,
    memberUserIds: ['usr_kaliton', 'usr_silva'],
    createdAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 'grp_1',
    name: 'Patriotas do Agronegócio',
    description: 'Comunidade dos produtores rurais, agrônomos, pecuaristas e defensores da soberania do campo brasileiro.',
    coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    category: 'Agronegócio',
    creatorId: 'usr_rodrigo',
    isPrivate: false,
    membersCount: 14820,
    memberUserIds: ['usr_rodrigo', 'usr_silva', 'usr_helena', 'usr_admin'],
    createdAt: '2024-01-10T10:00:00Z'
  }
];

const DEFAULT_STORIES: StoryItem[] = [
  {
    id: 'story_1',
    userId: 'usr_patriota_br',
    userName: 'Patriota BR',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    hasUnseenStory: true,
    isVerified: true,
    badgeType: 'verified',
    mediaUrl: '/src/assets/images/brasil_hero_banner_1793411883121.jpg',
    caption: 'Mobilização cívica em Brasília pela nossa soberania! 🇧🇷',
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: 'story_2',
    userId: 'usr_carlos_silva',
    userName: 'Carlos Silva',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    hasUnseenStory: true,
    isVerified: true,
    badgeType: 'verified',
    mediaUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    caption: 'O agro brasileiro nunca dorme. Orgulho do nosso solo!',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'story_3',
    userId: 'usr_fernanda_lima',
    userName: 'Fernanda Lima',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    hasUnseenStory: true,
    isVerified: false,
    badgeType: 'star',
    mediaUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    caption: 'Em defesa da liberdade de expressão e dos valores tradicionais!',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 'story_4',
    userId: 'usr_ricardo_souza',
    userName: 'Ricardo Souza',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    hasUnseenStory: true,
    isVerified: true,
    badgeType: 'verified',
    mediaUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    caption: 'Segurança pública forte é cidadão protegido nas ruas!',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'story_5',
    userId: 'usr_mariana_costa',
    userName: 'Mariana Costa',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    hasUnseenStory: true,
    isVerified: true,
    badgeType: 'flag',
    mediaUrl: '/src/assets/images/brasil_bandeira_card_1793411895078.jpg',
    caption: 'Deus, Pátria e Família sempre! Orgulho de ser brasileira! 🇧🇷',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: 'story_6',
    userId: 'usr_andre_oliveira',
    userName: 'André Oliveira',
    userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
    hasUnseenStory: true,
    isVerified: true,
    badgeType: 'verified',
    mediaUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    caption: 'Debates cívicos de alto nível na Sociedade Bosonarista.',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  }
];

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_silva_helena',
    senderId: 'usr_helena',
    receiverId: 'usr_silva',
    content: 'Olá Coronel Silva! Li seu posicionamento sobre a segurança das fronteiras. Muito lúcido e bem embasado.',
    createdAt: '2026-10-30T14:10:00Z',
    read: true
  },
  {
    id: 'msg_2',
    conversationId: 'conv_silva_helena',
    senderId: 'usr_silva',
    receiverId: 'usr_helena',
    content: 'Muito obrigado, Dra. Helena! Seu parecer sobre a imunidade parlamentar também foi brilhante. Vamos em frente!',
    createdAt: '2026-10-30T14:22:00Z',
    read: true
  },
  {
    id: 'msg_3',
    conversationId: 'conv_silva_admin',
    senderId: 'usr_admin',
    receiverId: 'usr_silva',
    content: 'Prezado Coronel Silva, informamos que seu selo de Membro Patriota Verificado está ativo. Agradecemos suas contribuições cívicas!',
    createdAt: '2026-10-30T11:00:00Z',
    read: false
  }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_k1',
    userId: 'usr_kaliton',
    fromUserId: 'usr_patriota22',
    fromUserName: 'Patriota22',
    fromUserAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    type: 'like',
    title: 'Nova curtida',
    message: 'curtiu sua publicação na comunidade.',
    link: '#post_1',
    read: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_k2',
    userId: 'usr_kaliton',
    fromUserId: 'usr_helena',
    fromUserName: 'Dra. Helena Moreira',
    fromUserAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    type: 'comment',
    title: 'Novo comentário',
    message: 'comentou na sua publicação sobre o futuro do Brasil.',
    link: '#post_1',
    read: false,
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_k3',
    userId: 'usr_kaliton',
    fromUserId: 'usr_brasillivre',
    fromUserName: 'BrasilLivre',
    fromUserAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
    type: 'follow',
    title: 'Novo seguidor',
    message: 'começou a seguir o seu perfil.',
    link: '#perfil/brasillivre',
    read: false,
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_k4',
    userId: 'usr_kaliton',
    fromUserId: 'usr_admin',
    fromUserName: 'Administração Sociedade Bosonarista',
    fromUserAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    type: 'admin_notice',
    title: 'Selo Membro Premium Ativo',
    message: 'Seu distintivo de Membro Premium foi validado com sucesso!',
    link: '#',
    read: false,
    createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_1',
    userId: 'usr_silva',
    fromUserId: 'usr_helena',
    fromUserName: 'Dra. Helena Moreira',
    fromUserAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    type: 'like',
    title: 'Nova curtida',
    message: 'curtiu sua publicação sobre as prioridades no Congresso.',
    link: '#post_1',
    read: false,
    createdAt: '2026-10-30T15:30:00Z'
  },
  {
    id: 'notif_2',
    userId: 'usr_silva',
    fromUserId: 'usr_rodrigo',
    fromUserName: 'Rodrigo Fagundes (Agro Forte)',
    fromUserAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    type: 'comment',
    title: 'Novo comentário',
    message: 'comentou na sua enquete popular.',
    link: '#post_1',
    read: false,
    createdAt: '2026-10-30T16:10:00Z'
  },
  {
    id: 'notif_3',
    userId: 'usr_silva',
    fromUserId: 'usr_admin',
    fromUserName: 'Administração',
    fromUserAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    type: 'admin_notice',
    title: 'Aviso da Moderação',
    message: 'Nova diretriz de convivência e debates cívicos publicada com sucesso.',
    link: '#',
    read: true,
    createdAt: '2026-10-29T10:00:00Z'
  }
];

const DEFAULT_REPORTS: ReportItem[] = [
  {
    id: 'rep_1',
    reporterId: 'usr_silva',
    reporterName: 'Coronel Silva Patriota',
    contentType: 'comment',
    contentId: 'comm_spam_test',
    contentSnippet: 'Link suspeito de cassino online prometendo dinheiro rápido',
    reason: 'Spam',
    details: 'Perfil suspeito fazendo propaganda de apostas em tópico de debate sério.',
    status: 'pending',
    createdAt: '2026-10-30T13:40:00Z'
  }
];

const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log_1',
    adminId: 'usr_admin',
    adminName: 'Administração Central',
    action: 'NOTICIA_PUBLICADA',
    targetType: 'Notícia',
    targetId: 'news_1',
    details: 'Publicou a notícia em destaque: Balança Comercial do Agronegócio',
    createdAt: '2026-10-30T10:05:00Z'
  },
  {
    id: 'log_2',
    adminId: 'usr_admin',
    adminName: 'Administração Central',
    action: 'VERIFICACAO_USUARIO',
    targetType: 'Usuário',
    targetId: 'usr_silva',
    details: 'Concedeu selo oficial de verificação ao usuário coronel_silva',
    createdAt: '2026-10-30T11:00:00Z'
  }
];

// Helper to get from LocalStorage with fallback
function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// Storage Service Singleton
export const storageService = {
  // Initialize storage if empty
  init() {
    getStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    getStorage(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
    getStorage(STORAGE_KEYS.NEWS, DEFAULT_NEWS);
    getStorage(STORAGE_KEYS.DEBATES, DEFAULT_DEBATES);
    getStorage(STORAGE_KEYS.GROUPS, DEFAULT_GROUPS);
    getStorage(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
    getStorage(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    getStorage(STORAGE_KEYS.REPORTS, DEFAULT_REPORTS);
    getStorage(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
    getStorage(STORAGE_KEYS.STORIES, DEFAULT_STORIES);
    
    // Default logged in user is Kaliton Leite for high-fidelity experience matching the mock
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'usr_kaliton');
    }
  },

  // ---------------- STORIES ----------------
  getStories(): StoryItem[] {
    return getStorage<StoryItem[]>(STORAGE_KEYS.STORIES, DEFAULT_STORIES);
  },

  addStory(story: Omit<StoryItem, 'id' | 'createdAt'>): StoryItem {
    const stories = this.getStories();
    const newStory: StoryItem = {
      ...story,
      id: `story_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newStory, ...stories];
    setStorage(STORAGE_KEYS.STORIES, updated);
    return newStory;
  },

  // ---------------- AUTHENTICATION & USERS ----------------
  getUsers(): User[] {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    let changed = false;
    users.forEach(u => {
      if (!u.rank) {
        if (u.id === 'usr_admin') u.rank = 'general';
        else if (u.id === 'usr_silva') u.rank = 'coronel';
        else if (u.id === 'usr_helena') u.rank = 'capitao';
        else if (u.id === 'usr_rodrigo') u.rank = 'tenente';
        else u.rank = 'soldado';
        changed = true;
      }
      if (typeof u.honorPoints !== 'number') {
        if (u.id === 'usr_admin') u.honorPoints = 9200;
        else if (u.id === 'usr_silva') u.honorPoints = 5400;
        else if (u.id === 'usr_helena') u.honorPoints = 2150;
        else if (u.id === 'usr_rodrigo') u.honorPoints = 1050;
        else u.honorPoints = 0;
        changed = true;
      }
    });
    if (changed) {
      setStorage(STORAGE_KEYS.USERS, users);
    }
    return users;
  },

  getCurrentUser(): User | null {
    const users = this.getUsers();
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) return users[1] || users[0] || null;
    return users.find(u => u.id === currentId) || users[1] || null;
  },

  setCurrentUser(userId: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
      return user;
    }
    return null;
  },

  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  },

  getUserByUsername(username: string): User | null {
    const users = this.getUsers();
    const clean = username.toLowerCase().replace('@', '');
    return users.find(u => u.username.toLowerCase() === clean) || null;
  },

  register(data: {
    name: string;
    username: string;
    email: string;
    cpf: string;
    password?: string;
    birthDate?: string;
  }): { success: boolean; error?: string; user?: User; tempPassword?: string } {
    const users = this.getUsers();
    const cleanUsername = data.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanCpfDigits = (data.cpf || '').replace(/\D/g, '');

    if (cleanCpfDigits.length !== 11) {
      return { success: false, error: 'O CPF informado deve conter exatamente 11 dígitos numéricos.' };
    }

    if (users.some(u => u.cpf && u.cpf.replace(/\D/g, '') === cleanCpfDigits)) {
      return { success: false, error: 'Este CPF já está cadastrado na Sociedade Bosonarista.' };
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: 'O nome de usuário deve ter ao menos 3 caracteres alfanuméricos.' };
    }

    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'Este nome de usuário já está em uso.' };
    }

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Este email já está cadastrado.' };
    }

    // Regra solicitada: gerar senha temporária com os quatro primeiros dígitos do CPF
    const tempPassword = cleanCpfDigits.substring(0, 4);
    const finalPassword = data.password && data.password.trim().length >= 4 ? data.password.trim() : tempPassword;
    const formattedCpf = cleanCpfDigits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      cpf: formattedCpf,
      password: finalPassword,
      birthDate: data.birthDate,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=174D32,102019&textColor=D4AF37`,
      bio: 'Novo membro da Sociedade Bosonarista em defesa da liberdade e do Brasil.',
      role: 'user',
      status: 'active',
      rank: 'soldado',
      honorPoints: 0,
      createdAt: new Date().toISOString(),
      followersCount: 0,
      followingCount: 1, // Automatically follow official admin
      postsCount: 0,
      socialLinks: {},
      verified: false
    };

    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);

    // Welcome Notification detailing initial rank & temp password
    this.createNotification({
      userId: newUser.id,
      fromUserId: 'usr_admin',
      fromUserName: 'Administração Central',
      fromUserAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
      type: 'admin_notice',
      title: '🎖️ Bem-vindo à Sociedade Bosonarista!',
      message: `Alistamento realizado! Patente inicial: Soldado. Sua senha temporária de primeiro acesso foi gerada com os 4 primeiros dígitos do CPF (${tempPassword}). Guarde com segurança.`,
      link: '/perfil'
    });

    // Add audit log
    this.addAuditLog('CADASTRO_USUARIO_CPF', 'Sistema', 'Usuário', `Novo membro cadastrado com CPF: @${newUser.username} com patente Soldado`);

    return { success: true, user: newUser, tempPassword };
  },

  addHonorPoints(userId: string, points: number, reason: string): { points: number; promoted: boolean; newRank?: UserRank } {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { points: 0, promoted: false };

    const oldRank = user.rank || 'soldado';
    user.honorPoints = Math.max(0, (user.honorPoints || 0) + points);
    const newRank = calculateRankFromPoints(user.honorPoints);
    let promoted = false;

    if (newRank !== oldRank && RANK_DEFINITIONS[newRank].level > RANK_DEFINITIONS[oldRank].level) {
      user.rank = newRank;
      promoted = true;
      const rankTitle = RANK_DEFINITIONS[newRank].title;

      // Create promotion celebration notification
      this.createNotification({
        userId: user.id,
        fromUserId: 'usr_admin',
        fromUserName: 'Administração Central',
        fromUserAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
        type: 'admin_notice',
        title: '🎖️ Promoção de Patente Conquistada!',
        message: `Parabéns, Patriota! Pelo seu engajamento cívico (${reason}), você foi promovido ao posto de ${rankTitle}!`,
        link: '/perfil'
      });

      this.addAuditLog('PROMOCAO_PATENTE', 'Sistema', 'Usuário', `Usuário @${user.username} promovido a ${rankTitle} com ${user.honorPoints} pontos.`);
    }

    setStorage(STORAGE_KEYS.USERS, users);
    return { points: user.honorPoints, promoted, newRank: user.rank };
  },

  setUserRank(userId: string, rank: UserRank, adminUser: User): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;

    const oldRank = user.rank || 'soldado';
    user.rank = rank;
    const rankTitle = RANK_DEFINITIONS[rank].title;

    this.createNotification({
      userId: user.id,
      fromUserId: adminUser.id,
      fromUserName: adminUser.name,
      fromUserAvatar: adminUser.avatar,
      type: 'admin_notice',
      title: '🎖️ Promoção por Mérito Especial!',
      message: `A Administração Central concedeu a você a condecoração e patente de ${rankTitle}!`,
      link: '/perfil'
    });

    this.addAuditLog('PROMOCAO_MERITO_ADMIN', adminUser.name, 'Usuário', `Promoveu @${user.username} de ${oldRank} para ${rank} por decreto da administração.`);
    setStorage(STORAGE_KEYS.USERS, users);
    return true;
  },

  login(identifier: string, password?: string): { success: boolean; error?: string; user?: User } {
    const users = this.getUsers();
    const rawTrimmed = identifier.trim();
    const clean = rawTrimmed.toLowerCase().replace('@', '');
    const cleanDigits = rawTrimmed.replace(/\D/g, '');

    const user = users.find(u => {
      if (u.email && u.email.toLowerCase() === clean) return true;
      if (u.username && u.username.toLowerCase() === clean) return true;
      if (cleanDigits.length === 11 && u.cpf && u.cpf.replace(/\D/g, '') === cleanDigits) return true;
      return false;
    });

    if (!user) {
      return { success: false, error: 'Credenciais inválidas. Verifique seu CPF, e-mail ou nome de usuário.' };
    }

    if (user.status === 'banned') {
      return { success: false, error: 'Esta conta foi banida por violação das diretrizes comunitárias.' };
    }

    if (user.status === 'suspended') {
      return { success: false, error: 'Esta conta está temporariamente suspensa pela moderação.' };
    }

    if (password && user.password && user.password !== password) {
      // Also accept if password matches first 4 digits of CPF (temporary password)
      const userCpfDigits = (user.cpf || '').replace(/\D/g, '');
      const tempPass = userCpfDigits.substring(0, 4);
      if (tempPass && password === tempPass) {
        // Valid temporary password!
      } else {
        return { success: false, error: 'Senha incorreta. (Se este for seu primeiro acesso, sua senha temporária são os 4 primeiros dígitos do CPF).' };
      }
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    return { success: true, user };
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  },

  updateProfile(userId: string, data: Partial<User>): User | null {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;

    users[idx] = {
      ...users[idx],
      ...data,
      socialLinks: {
        ...users[idx].socialLinks,
        ...(data.socialLinks || {})
      }
    };

    setStorage(STORAGE_KEYS.USERS, users);
    return users[idx];
  },

  toggleFollow(currentUserId: string, targetUserId: string): { following: boolean; followersCount: number } {
    if (currentUserId === targetUserId) return { following: false, followersCount: 0 };
    const users = this.getUsers();
    const currentUser = users.find(u => u.id === currentUserId);
    const targetUser = users.find(u => u.id === targetUserId);
    if (!currentUser || !targetUser) return { following: false, followersCount: 0 };

    const followKey = `sb_follows_${currentUserId}`;
    const followList = getStorage<string[]>(followKey, []);
    const isFollowing = followList.includes(targetUserId);

    if (isFollowing) {
      const updated = followList.filter(id => id !== targetUserId);
      setStorage(followKey, updated);
      targetUser.followersCount = Math.max(0, targetUser.followersCount - 1);
      currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);
    } else {
      followList.push(targetUserId);
      setStorage(followKey, followList);
      targetUser.followersCount += 1;
      currentUser.followingCount += 1;

      // Create notification
      this.createNotification({
        userId: targetUserId,
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        fromUserAvatar: currentUser.avatar,
        type: 'follow',
        title: 'Novo seguidor',
        message: 'começou a seguir você na Sociedade Bosonarista.'
      });
    }

    setStorage(STORAGE_KEYS.USERS, users);
    return { following: !isFollowing, followersCount: targetUser.followersCount };
  },

  isFollowing(currentUserId: string, targetUserId: string): boolean {
    const followKey = `sb_follows_${currentUserId}`;
    const followList = getStorage<string[]>(followKey, []);
    return followList.includes(targetUserId);
  },

  // ---------------- POSTS & FEED ----------------
  getPosts(options?: { category?: string; query?: string; sortBy?: 'recent' | 'popular' }): Post[] {
    let posts = getStorage<Post[]>(STORAGE_KEYS.POSTS, DEFAULT_POSTS);

    if (options?.category && options.category !== 'Todos') {
      posts = posts.filter(p => p.category.toLowerCase() === options.category?.toLowerCase());
    }

    if (options?.query) {
      const q = options.query.toLowerCase();
      posts = posts.filter(p => 
        p.content.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q) ||
        p.authorUsername.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (options?.sortBy === 'popular') {
      posts = [...posts].sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount));
    } else {
      posts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return posts;
  },

  createPost(data: {
    author: User;
    content: string;
    category?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    pollOptions?: string[];
  }): Post {
    const posts = this.getPosts();
    let poll = undefined;

    if (data.pollOptions && data.pollOptions.filter(o => o.trim()).length >= 2) {
      poll = {
        question: data.content.split('\n')[0].slice(0, 100),
        totalVotes: 0,
        options: data.pollOptions.filter(o => o.trim()).map((opt, i) => ({
          id: `opt_${Date.now()}_${i}`,
          text: opt.trim(),
          votes: 0,
          votedUserIds: []
        }))
      };
    }

    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: data.author.id,
      authorName: data.author.name,
      authorUsername: data.author.username,
      authorAvatar: data.author.avatar,
      authorRole: data.author.role,
      authorRank: data.author.rank || 'soldado',
      authorVerified: data.author.verified,
      content: data.content,
      category: data.category || 'Política',
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType || 'image',
      poll,
      likesCount: 0,
      likedUserIds: [],
      commentsCount: 0,
      comments: [],
      sharesCount: 0,
      savedUserIds: [],
      createdAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    setStorage(STORAGE_KEYS.POSTS, posts);

    // Update user post count & award 25 Honor Points
    const users = this.getUsers();
    const user = users.find(u => u.id === data.author.id);
    if (user) {
      user.postsCount += 1;
      setStorage(STORAGE_KEYS.USERS, users);
    }
    this.addHonorPoints(data.author.id, 25, 'Publicação no feed');

    return newPost;
  },

  deletePost(postId: string, userId: string, isAdmin = false): boolean {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return false;

    if (post.authorId !== userId && !isAdmin) {
      return false;
    }

    const filtered = posts.filter(p => p.id !== postId);
    setStorage(STORAGE_KEYS.POSTS, filtered);

    if (isAdmin && post.authorId !== userId) {
      this.addAuditLog('EXCLUSAO_POST_MODERACAO', 'Admin', 'Publicação', `Post excluído pelo moderador: ${postId}`);
    }

    return true;
  },

  toggleLike(postId: string, userId: string): { liked: boolean; count: number } {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return { liked: false, count: 0 };

    const idx = post.likedUserIds.indexOf(userId);
    let liked = false;

    if (idx > -1) {
      post.likedUserIds.splice(idx, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
      liked = false;
    } else {
      post.likedUserIds.push(userId);
      post.likesCount += 1;
      liked = true;

      // Award 5 Honor Points to the post author
      this.addHonorPoints(post.authorId, 5, 'Curtida recebida');

      // Notify author
      if (post.authorId !== userId) {
        const user = this.getUserById(userId);
        if (user) {
          this.createNotification({
            userId: post.authorId,
            fromUserId: user.id,
            fromUserName: user.name,
            fromUserAvatar: user.avatar,
            type: 'like',
            title: 'Nova curtida',
            message: 'curtiu sua publicação.',
            link: `#${post.id}`
          });
        }
      }
    }

    setStorage(STORAGE_KEYS.POSTS, posts);
    return { liked, count: post.likesCount };
  },

  addComment(postId: string, author: User, content: string): Post | null {
    if (!content.trim()) return null;
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;

    const newComment = {
      id: `comm_${Date.now()}`,
      postId,
      authorId: author.id,
      authorName: author.name,
      authorUsername: author.username,
      authorAvatar: author.avatar,
      authorRank: author.rank || 'soldado',
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedUserIds: [],
      replies: []
    };

    if (!post.comments) post.comments = [];
    post.comments.push(newComment);
    post.commentsCount = post.comments.length;

    setStorage(STORAGE_KEYS.POSTS, posts);

    // Award 10 Honor Points for commenting
    this.addHonorPoints(author.id, 10, 'Comentário em debate');

    if (post.authorId !== author.id) {
      this.createNotification({
        userId: post.authorId,
        fromUserId: author.id,
        fromUserName: author.name,
        fromUserAvatar: author.avatar,
        type: 'comment',
        title: 'Novo comentário',
        message: 'comentou em sua publicação.',
        link: `#${post.id}`
      });
    }

    return post;
  },

  votePoll(postId: string, optionId: string, userId: string): Post | null {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post || !post.poll) return null;

    // Check if user already voted in any option of this poll
    const existingVote = post.poll.options.find(opt => opt.votedUserIds.includes(userId));
    if (existingVote) {
      existingVote.votedUserIds = existingVote.votedUserIds.filter(id => id !== userId);
      existingVote.votes = Math.max(0, existingVote.votes - 1);
      post.poll.totalVotes = Math.max(0, post.poll.totalVotes - 1);
      
      // If clicking same option, just toggle off
      if (existingVote.id === optionId) {
        setStorage(STORAGE_KEYS.POSTS, posts);
        return post;
      }
    }

    const targetOpt = post.poll.options.find(opt => opt.id === optionId);
    if (targetOpt) {
      targetOpt.votedUserIds.push(userId);
      targetOpt.votes += 1;
      post.poll.totalVotes += 1;
    }

    setStorage(STORAGE_KEYS.POSTS, posts);
    return post;
  },

  toggleSavePost(postId: string, userId: string): boolean {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return false;

    if (!post.savedUserIds) post.savedUserIds = [];
    const idx = post.savedUserIds.indexOf(userId);
    let saved = false;

    if (idx > -1) {
      post.savedUserIds.splice(idx, 1);
      saved = false;
    } else {
      post.savedUserIds.push(userId);
      saved = true;
    }

    setStorage(STORAGE_KEYS.POSTS, posts);
    return saved;
  },

  // ---------------- NEWS (ADMIN MANAGED) ----------------
  getNews(options?: { category?: string; query?: string; featuredOnly?: boolean }): NewsItem[] {
    let news = getStorage<NewsItem[]>(STORAGE_KEYS.NEWS, DEFAULT_NEWS);

    if (options?.featuredOnly) {
      news = news.filter(n => n.isFeatured);
    }

    if (options?.category && options.category !== 'Todas') {
      news = news.filter(n => n.category.toLowerCase() === options.category?.toLowerCase());
    }

    if (options?.query) {
      const q = options.query.toLowerCase();
      news = news.filter(n => 
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    }

    return news.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  },

  getNewsById(id: string): NewsItem | null {
    const news = this.getNews();
    const item = news.find(n => n.id === id);
    if (item) {
      item.viewsCount += 1;
      setStorage(STORAGE_KEYS.NEWS, news);
    }
    return item || null;
  },

  createNews(item: Omit<NewsItem, 'id' | 'viewsCount' | 'publishedAt'>, adminUser: User): NewsItem {
    const news = getStorage<NewsItem[]>(STORAGE_KEYS.NEWS, DEFAULT_NEWS);
    const newArticle: NewsItem = {
      ...item,
      id: `news_${Date.now()}`,
      authorId: adminUser.id,
      authorName: adminUser.name,
      publishedAt: new Date().toISOString(),
      viewsCount: 1
    };

    news.unshift(newArticle);
    setStorage(STORAGE_KEYS.NEWS, news);

    this.addAuditLog('PUBLICACAO_NOTICIA', adminUser.name, 'Notícia', `Notícia cadastrada: "${newArticle.title.slice(0, 40)}..."`);
    return newArticle;
  },

  updateNews(id: string, updates: Partial<NewsItem>, adminUser: User): NewsItem | null {
    const news = getStorage<NewsItem[]>(STORAGE_KEYS.NEWS, DEFAULT_NEWS);
    const idx = news.findIndex(n => n.id === id);
    if (idx === -1) return null;

    news[idx] = { ...news[idx], ...updates };
    setStorage(STORAGE_KEYS.NEWS, news);

    this.addAuditLog('EDICAO_NOTICIA', adminUser.name, 'Notícia', `Notícia editada: "${news[idx].title.slice(0, 40)}..."`);
    return news[idx];
  },

  deleteNews(id: string, adminUser: User): boolean {
    const news = getStorage<NewsItem[]>(STORAGE_KEYS.NEWS, DEFAULT_NEWS);
    const item = news.find(n => n.id === id);
    if (!item) return false;

    const filtered = news.filter(n => n.id !== id);
    setStorage(STORAGE_KEYS.NEWS, filtered);

    this.addAuditLog('EXCLUSAO_NOTICIA', adminUser.name, 'Notícia', `Notícia excluída: "${item.title.slice(0, 40)}..."`);
    return true;
  },

  toggleFeaturedNews(id: string, adminUser: User): boolean {
    const news = getStorage<NewsItem[]>(STORAGE_KEYS.NEWS, DEFAULT_NEWS);
    const item = news.find(n => n.id === id);
    if (!item) return false;

    item.isFeatured = !item.isFeatured;
    setStorage(STORAGE_KEYS.NEWS, news);

    this.addAuditLog('ALTERACAO_DESTAQUE_NOTICIA', adminUser.name, 'Notícia', `Destaque alterado para ${item.isFeatured}: "${item.title.slice(0, 30)}..."`);
    return item.isFeatured;
  },

  // ---------------- DEBATES ----------------
  getDebates(category?: string, query?: string): DebateTopic[] {
    let debates = getStorage<DebateTopic[]>(STORAGE_KEYS.DEBATES, DEFAULT_DEBATES);

    if (category && category !== 'Todos') {
      debates = debates.filter(d => d.category.toLowerCase() === category.toLowerCase());
    }

    if (query) {
      const q = query.toLowerCase();
      debates = debates.filter(d => 
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
      );
    }

    return debates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getDebateById(id: string): DebateTopic | null {
    const debates = this.getDebates();
    return debates.find(d => d.id === id) || null;
  },

  createDebate(author: User, title: string, description: string, category: DebateCategory): DebateTopic {
    const debates = this.getDebates();
    const newDebate: DebateTopic = {
      id: `deb_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      authorId: author.id,
      authorName: author.name,
      authorUsername: author.username,
      authorAvatar: author.avatar,
      authorRank: author.rank || 'soldado',
      createdAt: new Date().toISOString(),
      repliesCount: 0,
      proCount: 0,
      conCount: 0,
      replies: []
    };

    debates.unshift(newDebate);
    setStorage(STORAGE_KEYS.DEBATES, debates);

    // Award 50 Honor points for opening a debate
    this.addHonorPoints(author.id, 50, 'Abertura de debate cívico');

    return newDebate;
  },

  addDebateReply(debateId: string, author: User, stance: 'pro' | 'con' | 'neutral', content: string): DebateTopic | null {
    const debates = this.getDebates();
    const debate = debates.find(d => d.id === debateId);
    if (!debate || !content.trim()) return null;

    const newReply = {
      id: `dr_${Date.now()}`,
      debateId,
      authorId: author.id,
      authorName: author.name,
      authorUsername: author.username,
      authorAvatar: author.avatar,
      authorRank: author.rank || 'soldado',
      stance,
      content: content.trim(),
      upvotes: 0,
      upvotedUserIds: [],
      createdAt: new Date().toISOString()
    };

    debate.replies.push(newReply);
    debate.repliesCount = debate.replies.length;
    if (stance === 'pro') debate.proCount += 1;
    if (stance === 'con') debate.conCount += 1;

    setStorage(STORAGE_KEYS.DEBATES, debates);

    // Award 35 Honor points for argument
    this.addHonorPoints(author.id, 35, 'Argumento defendido em debate');

    return debate;
  },

  upvoteDebateReply(debateId: string, replyId: string, userId: string): boolean {
    const debates = this.getDebates();
    const debate = debates.find(d => d.id === debateId);
    if (!debate) return false;

    const reply = debate.replies.find(r => r.id === replyId);
    if (!reply) return false;

    const idx = reply.upvotedUserIds.indexOf(userId);
    let upvoted = false;

    if (idx > -1) {
      reply.upvotedUserIds.splice(idx, 1);
      reply.upvotes = Math.max(0, reply.upvotes - 1);
      upvoted = false;
    } else {
      reply.upvotedUserIds.push(userId);
      reply.upvotes += 1;
      upvoted = true;

      // Award 15 points to reply author
      this.addHonorPoints(reply.authorId, 15, 'Argumento apoiado pela comunidade');
    }

    setStorage(STORAGE_KEYS.DEBATES, debates);
    return upvoted;
  },

  // ---------------- GROUPS ----------------
  getGroups(category?: string, query?: string): Group[] {
    let groups = getStorage<Group[]>(STORAGE_KEYS.GROUPS, DEFAULT_GROUPS);

    if (category && category !== 'Todos') {
      groups = groups.filter(g => g.category.toLowerCase() === category.toLowerCase());
    }

    if (query) {
      const q = query.toLowerCase();
      groups = groups.filter(g => 
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
      );
    }

    return groups.sort((a, b) => b.membersCount - a.membersCount);
  },

  getGroupById(id: string): Group | null {
    const groups = this.getGroups();
    return groups.find(g => g.id === id) || null;
  },

  toggleGroupMember(groupId: string, userId: string): { joined: boolean; count: number } {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);
    if (!group) return { joined: false, count: 0 };

    const idx = group.memberUserIds.indexOf(userId);
    let joined = false;

    if (idx > -1) {
      group.memberUserIds.splice(idx, 1);
      group.membersCount = Math.max(0, group.membersCount - 1);
      joined = false;
    } else {
      group.memberUserIds.push(userId);
      group.membersCount += 1;
      joined = true;

      // Award 15 points for joining group
      this.addHonorPoints(userId, 15, 'Alistamento em comunidade patriótica');
    }

    setStorage(STORAGE_KEYS.GROUPS, groups);
    return { joined, count: group.membersCount };
  },

  createGroup(data: {
    name: string;
    description: string;
    category: string;
    coverImage?: string;
    isPrivate?: boolean;
    creator: User;
  }): Group {
    const groups = this.getGroups();
    const newGroup: Group = {
      id: `grp_${Date.now()}`,
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.category,
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      creatorId: data.creator.id,
      isPrivate: !!data.isPrivate,
      membersCount: 1,
      memberUserIds: [data.creator.id],
      createdAt: new Date().toISOString()
    };

    groups.unshift(newGroup);
    setStorage(STORAGE_KEYS.GROUPS, groups);

    // Award 50 points for founding a group
    this.addHonorPoints(data.creator.id, 50, 'Fundação de comunidade patriótica');

    return newGroup;
  },

  // ---------------- DIRECT MESSAGES ----------------
  getMessagesForUser(userId: string): ChatMessage[] {
    const messages = getStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
    return messages.filter(m => m.senderId === userId || m.receiverId === userId);
  },

  sendMessage(senderId: string, receiverId: string, content: string, mediaUrl?: string): ChatMessage {
    const messages = getStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
    const convId = [senderId, receiverId].sort().join('_');

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId: `conv_${convId}`,
      senderId,
      receiverId,
      content: content.trim(),
      mediaUrl,
      createdAt: new Date().toISOString(),
      read: false
    };

    messages.push(newMsg);
    setStorage(STORAGE_KEYS.MESSAGES, messages);

    // Notify receiver
    const sender = this.getUserById(senderId);
    if (sender) {
      this.createNotification({
        userId: receiverId,
        fromUserId: sender.id,
        fromUserName: sender.name,
        fromUserAvatar: sender.avatar,
        type: 'message',
        title: 'Nova mensagem privada',
        message: `enviou uma mensagem: "${content.slice(0, 30)}..."`,
        link: '/mensagens'
      });
    }

    return newMsg;
  },

  markConversationRead(userId: string, otherUserId: string): void {
    const messages = getStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
    messages.forEach(m => {
      if (m.receiverId === userId && m.senderId === otherUserId) {
        m.read = true;
      }
    });
    setStorage(STORAGE_KEYS.MESSAGES, messages);
  },

  // ---------------- NOTIFICATIONS ----------------
  getNotifications(userId: string): NotificationItem[] {
    const notifications = getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createNotification(item: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>): NotificationItem {
    const notifications = getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    const newNotif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString()
    };

    notifications.unshift(newNotif);
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotif;
  },

  markNotificationRead(id: string): void {
    const notifications = getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    const notif = notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  },

  markAllNotificationsRead(userId: string): void {
    const notifications = getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  deleteNotification(id: string): void {
    const notifications = getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    const filtered = notifications.filter(n => n.id !== id);
    setStorage(STORAGE_KEYS.NOTIFICATIONS, filtered);
  },

  clearReadNotifications(userId: string): void {
    const notifications = getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    const filtered = notifications.filter(n => !(n.userId === userId && n.read));
    setStorage(STORAGE_KEYS.NOTIFICATIONS, filtered);
  },

  // ---------------- REPORTS & MODERATION ----------------
  getReports(status?: 'pending' | 'resolved' | 'dismissed'): ReportItem[] {
    let reports = getStorage<ReportItem[]>(STORAGE_KEYS.REPORTS, DEFAULT_REPORTS);
    if (status) {
      reports = reports.filter(r => r.status === status);
    }
    return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createReport(data: {
    reporter: User;
    contentType: 'post' | 'comment' | 'user' | 'group' | 'debate';
    contentId: string;
    contentSnippet: string;
    reason: ReportReason;
    details?: string;
  }): ReportItem {
    const reports = getStorage<ReportItem[]>(STORAGE_KEYS.REPORTS, DEFAULT_REPORTS);
    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      reporterId: data.reporter.id,
      reporterName: data.reporter.name,
      contentType: data.contentType,
      contentId: data.contentId,
      contentSnippet: data.contentSnippet.slice(0, 120),
      reason: data.reason,
      details: data.details,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    reports.unshift(newReport);
    setStorage(STORAGE_KEYS.REPORTS, reports);
    return newReport;
  },

  resolveReport(reportId: string, action: 'remover_conteudo' | 'advertir' | 'suspender' | 'ignorar', notes: string, adminUser: User): boolean {
    const reports = getStorage<ReportItem[]>(STORAGE_KEYS.REPORTS, DEFAULT_REPORTS);
    const report = reports.find(r => r.id === reportId);
    if (!report) return false;

    report.status = action === 'ignorar' ? 'dismissed' : 'resolved';
    report.actionTaken = `${action}: ${notes}`;
    setStorage(STORAGE_KEYS.REPORTS, reports);

    // If remover_conteudo, delete post if it was a post
    if (action === 'remover_conteudo' && report.contentType === 'post') {
      this.deletePost(report.contentId, adminUser.id, true);
    }

    this.addAuditLog('MODERACAO_DENUNCIA', adminUser.name, 'Denúncia', `Ação "${action}" aplicada na denúncia ${reportId}. Motivo: ${report.reason}.`);
    return true;
  },

  // ---------------- ADMIN MANAGEMENT & AUDIT LOGS ----------------
  getAdminStats(): AdminStats {
    const users = this.getUsers();
    const posts = this.getPosts();
    const groups = this.getGroups();
    const news = this.getNews();
    const reports = this.getReports();

    let totalComments = 0;
    posts.forEach(p => {
      totalComments += (p.comments?.length || 0);
    });

    return {
      totalUsers: users.length + 15400, // Show realistic community scale + real persisted
      activeUsers: users.filter(u => u.status === 'active').length + 8920,
      totalPosts: posts.length + 42300,
      totalComments: totalComments + 115000,
      totalGroups: groups.length,
      totalNews: news.length,
      pendingReports: reports.filter(r => r.status === 'pending').length
    };
  },

  setUserStatus(userId: string, status: 'active' | 'suspended' | 'banned', adminUser: User): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;

    user.status = status;
    setStorage(STORAGE_KEYS.USERS, users);

    this.addAuditLog('ALTERACAO_STATUS_USUARIO', adminUser.name, 'Usuário', `Status do usuário @${user.username} alterado para ${status}.`);
    return true;
  },

  toggleUserRole(userId: string, adminUser: User): string {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return 'user';

    user.role = user.role === 'admin' ? 'user' : 'admin';
    setStorage(STORAGE_KEYS.USERS, users);

    this.addAuditLog('ALTERACAO_CARGO_ADMIN', adminUser.name, 'Usuário', `Cargo do usuário @${user.username} alterado para ${user.role}.`);
    return user.role;
  },

  getAuditLogs(): AuditLogItem[] {
    const logs = getStorage<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addAuditLog(action: string, adminName: string, targetType: string, details: string): void {
    const logs = getStorage<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      adminId: 'usr_admin',
      adminName,
      action,
      targetType,
      targetId: 'item',
      details,
      createdAt: new Date().toISOString()
    };
    logs.unshift(newLog);
    setStorage(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 100));
  },

  resetDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.POSTS);
    localStorage.removeItem(STORAGE_KEYS.NEWS);
    localStorage.removeItem(STORAGE_KEYS.DEBATES);
    localStorage.removeItem(STORAGE_KEYS.GROUPS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    this.init();
  }
};
