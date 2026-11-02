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
  StoryItem,
  Company,
  Donation
} from '../types';
import { calculateRankFromPoints, RANK_DEFINITIONS, getNextRank } from './rankService';

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
  COMPANIES: 'sb_companies_v2',
  DONATIONS: 'sb_donations_v2',
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
    role: 'user',
    status: 'active',
    rank: 'coronel',
    honorPoints: 5500,
    createdAt: '2024-01-01T10:00:00Z',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
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
    email: 'kalitonleite@gmail.com',
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
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    verified: true,
    socialLinks: {
      x: 'https://x.com',
      youtube: 'https://youtube.com',
      instagram: 'https://instagram.com',
      website: 'https://sociedadebosonarista.com.br'
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
    id: 'post_1',
    authorId: 'usr_admin',
    authorName: 'Administração Sociedade Bosonarista',
    authorUsername: 'admin_oficial',
    authorAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    authorRole: 'admin',
    authorRank: 'general',
    authorVerified: true,
    content: 'Sejam bem-vindos à plataforma oficial da SOCIEDADE BOSONARISTA!\n\nAqui nós nos reunimos para debater o futuro da nossa pátria, defender os valores que herdamos de nossos antepassados — Deus, Pátria, Família e Liberdade — e construir uma comunidade cívica participativa, ordeira e produtiva.\n\nConvide amigos, participe dos debates e compartilhe a verdade! 🇧🇷🌾⭐',
    category: 'Brasil',
    mediaUrl: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    mediaType: 'image',
    likesCount: 1,
    likedUserIds: ['usr_admin'],
    commentsCount: 0,
    sharesCount: 0,
    savedUserIds: [],
    createdAt: '2026-10-30T12:00:00Z',
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
    content: 'Consulta Cívica: Qual destas prioridades deve ser a bandeira central número um do movimento patriótico nas próximas mobilizações? Votem e deixem suas razões nos comentários! 🇧🇷',
    category: 'Política',
    poll: {
      question: 'Qual deve ser a principal prioridade do Congresso Nacional?',
      totalVotes: 24,
      options: [
        { id: 'opt_1', text: 'Corte radical de impostos e despesas estatais', votes: 12, votedUserIds: [] },
        { id: 'opt_2', text: 'Endurecimento penal e fim das regalias para criminosos', votes: 7, votedUserIds: [] },
        { id: 'opt_3', text: 'Garantia irrestrita da liberdade de expressão e fim da censura', votes: 4, votedUserIds: [] },
        { id: 'opt_4', text: 'Blindagem do agronegócio e defesa da propriedade privada', votes: 1, votedUserIds: [] }
      ]
    },
    likesCount: 0,
    likedUserIds: [],
    commentsCount: 0,
    sharesCount: 0,
    savedUserIds: [],
    createdAt: '2026-10-30T15:20:00Z',
    comments: []
  }
];

const DEFAULT_DEBATES: DebateTopic[] = [
  {
    id: 'deb_futuro_brasil',
    title: 'Qual o futuro do Brasil?',
    description: 'Quais reformas prioritárias e diretrizes políticas e econômicas garantirão a soberania e o protagonismo do Brasil nas próximas décadas?',
    category: 'Política',
    authorId: 'usr_admin',
    authorName: 'Administração Sociedade Bosonarista',
    authorUsername: 'admin_oficial',
    authorAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    createdAt: '2026-10-30T10:00:00Z',
    repliesCount: 0,
    proCount: 15,
    conCount: 1,
    replies: []
  },
  {
    id: 'deb_1',
    title: 'Auditabilidade do processo eleitoral: mecanismos modernos e contagem pública',
    description: 'Como as democracias mais maduras do mundo realizam a conferência dos sufrágios com transparência e verificação física e eletrônica concomitante?',
    category: 'Política brasileira',
    authorId: 'usr_admin',
    authorName: 'Administração Sociedade Bosonarista',
    authorUsername: 'admin_oficial',
    authorAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    createdAt: '2026-10-29T14:00:00Z',
    repliesCount: 0,
    proCount: 22,
    conCount: 2,
    replies: []
  },
  {
    id: 'deb_2',
    title: 'Desoneração da folha e simplificação tributária real vs. aumento disfarçado de alíquotas',
    description: 'A reforma tributária aprovada atende verdadeiramente aos setores de comércio, serviços e agropecuária ou trará concentração de arrecadação?',
    category: 'Economia',
    authorId: 'usr_admin',
    authorName: 'Administração Sociedade Bosonarista',
    authorUsername: 'admin_oficial',
    authorAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    createdAt: '2026-10-28T10:00:00Z',
    repliesCount: 0,
    proCount: 18,
    conCount: 3,
    replies: []
  }
];

const DEFAULT_GROUPS: Group[] = [];


const DEFAULT_STORIES: StoryItem[] = [
  {
    id: 'story_oficial_bemvindo',
    userId: 'usr_admin',
    userName: 'Administração Oficial',
    userAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    hasUnseenStory: true,
    isVerified: true,
    badgeType: 'verified',
    mediaUrl: '/assets/memorial/memorial_hall.jpg',
    caption: 'Bem-vindo à Sociedade Bosonarista! A rede social da liberdade e soberania nacional. 🇧🇷',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_MESSAGES: ChatMessage[] = [];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_welcome',
    userId: 'usr_kaliton',
    fromUserId: 'usr_admin',
    fromUserName: 'Administração Sociedade Bosonarista',
    fromUserAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    type: 'admin_notice',
    title: 'Modo Real Ativo',
    message: 'Bem-vindo! A plataforma está operando no Modo Real com membros genuínos.',
    read: false,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_REPORTS: ReportItem[] = [];

const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log_1',
    adminId: 'usr_admin',
    adminName: 'Administração Central',
    action: 'PLATAFORMA_INICIADA',
    targetType: 'Sistema',
    targetId: 'sys_init',
    details: 'Modo Real Ativado — plataforma configurada para membros genuínos.',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_COMPANIES: Company[] = [
  {
    id: 'comp_1',
    name: 'AgroForte Sementes & Nutrição Animal',
    ownerId: 'usr_kaliton',
    ownerName: 'Kaliton Leite',
    ownerUsername: 'kaliton_leite',
    ownerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    category: 'Agropecuária',
    description: 'Fornecimento de insumos, sementes certificadas e suplementação mineral para pecuária de corte e leite. Alimentando o Brasil com a força e honestidade do produtor rural.',
    city: 'Rondonópolis',
    state: 'MT',
    whatsapp: '66999887766',
    phone: '(66) 3411-9000',
    website: 'https://agrofortesementes.com.br',
    instagram: '@agroforte_sementes',
    logoUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    specialOffer: '7% de desconto à vista para membros da Sociedade Bosonarista',
    verified: true,
    createdAt: '2024-02-15T10:00:00Z'
  },
  {
    id: 'comp_2',
    name: 'Restaurante & Parrilla Sul Patriota',
    ownerId: 'usr_admin',
    ownerName: 'Administração Sociedade Bosonarista',
    ownerUsername: 'admin_oficial',
    ownerAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    category: 'Alimentação & Gastronomia',
    description: 'Churrasco tradicional nobre, carnes na brasa, chopp artesanal e ambiente verde e amarelo familiar. Espaço com telão e música ao vivo aos fins de semana.',
    city: 'Curitiba',
    state: 'PR',
    whatsapp: '41988776655',
    phone: '(41) 3345-2200',
    website: 'https://sulpatriota.com.br',
    instagram: '@parrillasulpatriota',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    specialOffer: 'Chopp ou sobremesa cortesia para patriotas da plataforma',
    verified: true,
    createdAt: '2024-03-01T14:30:00Z'
  },
  {
    id: 'comp_3',
    name: 'Liberdade Têxtil & Uniformes Cívicos',
    ownerId: 'usr_kaliton',
    ownerName: 'Kaliton Leite',
    ownerUsername: 'kaliton_leite',
    ownerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    category: 'Moda & Vestuário',
    description: 'Camisas pólo patriotas em algodão pima, bonés bordados do Brasil, jaquetas e uniformes corporativos. Fabricação 100% nacional que gera empregos no nosso solo.',
    city: 'Brusque',
    state: 'SC',
    whatsapp: '47997665544',
    phone: '(47) 3251-8800',
    website: 'https://liberdadetextil.com.br',
    instagram: '@liberdade_vestuario',
    logoUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    specialOffer: '15% de desconto no primeiro pedido com o cupom PATRIOTA22',
    verified: true,
    createdAt: '2024-03-10T09:15:00Z'
  },
  {
    id: 'comp_4',
    name: 'Soberana Engenharia & Energia Solar',
    ownerId: 'usr_admin',
    ownerName: 'Administração Sociedade Bosonarista',
    ownerUsername: 'admin_oficial',
    ownerAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
    category: 'Construção & Energia',
    description: 'Projetos de energia fotovoltaica residencial, comercial e rural. Economia de até 95% na conta de luz. Homologação rápida e garantia de 25 anos em placas.',
    city: 'Ribeirão Preto',
    state: 'SP',
    whatsapp: '16996554433',
    phone: '(16) 3622-4411',
    website: 'https://soberanasolar.com.br',
    instagram: '@soberana_energia',
    logoUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
    specialOffer: 'Laudo técnico e projeto de engenharia gratuito',
    verified: true,
    createdAt: '2024-03-20T16:00:00Z'
  }
];

const DEFAULT_DONATIONS: Donation[] = [];

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
    getStorage(STORAGE_KEYS.COMPANIES, DEFAULT_COMPANIES);
    getStorage(STORAGE_KEYS.DONATIONS, DEFAULT_DONATIONS);
    
    // Purge simulated bot members from stored users & stories
    const MOCK_NAMES_SUBSTR = [
      'patriota br',
      'carlos silva',
      'fernanda lima',
      'ricardo souza',
      'mariana costa',
      'andré oliveira',
      'andre oliveira',
      'sargento dias',
      'beatriz santos',
      'dra. helena moreira',
      'helena moreira',
      'rodrigo fagundes',
      'coronel silva',
      'patriota22',
      'brasillivre',
      'direitaja'
    ];
    const SIMULATED_IDS = [
      'usr_patriota22',
      'usr_brasillivre',
      'usr_direitaja',
      'usr_silva',
      'usr_helena',
      'usr_rodrigo',
      'usr_carlos_silva',
      'usr_fernanda_lima',
      'usr_ricardo_souza',
      'usr_mariana_costa',
      'usr_andre_oliveira',
      'usr_dias_es',
      'usr_beatriz_ms',
      'story_1',
      'story_2',
      'story_3',
      'story_4',
      'story_5',
      'story_6',
      'story_7',
      'story_8',
      'story_9'
    ];

    try {
      const storedUsersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsersRaw) {
        const storedUsers: User[] = JSON.parse(storedUsersRaw);
        const filtered = storedUsers.filter(u => {
          if (SIMULATED_IDS.includes(u.id)) return false;
          const uName = (u.name || '').toLowerCase();
          if (MOCK_NAMES_SUBSTR.some(m => uName.includes(m))) return false;
          return true;
        });
        // Ensure usr_admin is admin and usr_kaliton is user so the admin button visibility is tested cleanly
        let roleChanged = false;
        filtered.forEach(u => {
          if (u.id === 'usr_admin' && u.role !== 'admin') {
            u.role = 'admin';
            roleChanged = true;
          }
          if (u.id === 'usr_kaliton' && u.role === 'admin') {
            u.role = 'user';
            roleChanged = true;
          }
        });
        if (filtered.length !== storedUsers.length || roleChanged) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
        }
      }

      const storedStoriesRaw = localStorage.getItem(STORAGE_KEYS.STORIES);
      if (storedStoriesRaw) {
        const storedStories: StoryItem[] = JSON.parse(storedStoriesRaw);
        const filteredStories = storedStories.filter(s => {
          if (SIMULATED_IDS.includes(s.userId) || SIMULATED_IDS.includes(s.id)) return false;
          const sName = (s.userName || '').toLowerCase();
          if (MOCK_NAMES_SUBSTR.some(m => sName.includes(m))) return false;
          return true;
        });
        if (filteredStories.length !== storedStories.length) {
          localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(filteredStories));
        }
      }

      // Purge mock groups so "Grupos em destaque" and "Comunidades" are truly zeroed unless created by real users
      const MOCK_GROUP_IDS = ['grp_brasil_forte', 'grp_direita_brasil', 'grp_liberdade_ja'];
      const storedGroupsRaw = localStorage.getItem(STORAGE_KEYS.GROUPS);
      if (storedGroupsRaw) {
        const storedGroups: Group[] = JSON.parse(storedGroupsRaw);
        const filteredGroups = storedGroups.filter(g => !MOCK_GROUP_IDS.includes(g.id));
        if (filteredGroups.length !== storedGroups.length) {
          localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(filteredGroups));
        }
      }

      // Purge seed/fictitious donations so the Mural de Gratidão stays empty until a real donation is made
      const storedDonationsRaw = localStorage.getItem(STORAGE_KEYS.DONATIONS);
      if (storedDonationsRaw) {
        const storedDonations: Donation[] = JSON.parse(storedDonationsRaw);
        if (storedDonations.length > 0) {
          localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify([]));
        }
      }
    } catch (e) {
      console.warn('Error purging simulated users/groups:', e);
    }
  },

  // ---------------- STORIES ----------------
  getStories(): StoryItem[] {
    const stories = getStorage<StoryItem[]>(STORAGE_KEYS.STORIES, DEFAULT_STORIES);
    const MOCK_NAMES_SUBSTR = [
      'patriota br',
      'carlos silva',
      'fernanda lima',
      'ricardo souza',
      'mariana costa',
      'andré oliveira',
      'andre oliveira',
      'sargento dias',
      'beatriz santos',
      'dra. helena moreira',
      'helena moreira',
      'rodrigo fagundes',
      'coronel silva',
      'patriota22',
      'brasillivre',
      'direitaja'
    ];
    const SIMULATED_IDS = [
      'usr_patriota22',
      'usr_brasillivre',
      'usr_direitaja',
      'usr_silva',
      'usr_helena',
      'usr_rodrigo',
      'usr_carlos_silva',
      'usr_fernanda_lima',
      'usr_ricardo_souza',
      'story_1',
      'story_2',
      'story_3',
      'story_4',
      'story_5',
      'story_6',
      'story_7'
    ];

    const filtered = stories.filter(s => {
      if (SIMULATED_IDS.includes(s.userId) || SIMULATED_IDS.includes(s.id)) return false;
      const sName = (s.userName || '').toLowerCase();
      if (MOCK_NAMES_SUBSTR.some(m => sName.includes(m))) return false;
      return true;
    });

    if (filtered.length !== stories.length) {
      setStorage(STORAGE_KEYS.STORIES, filtered);
    }
    return filtered.map(s => ({
      ...s,
      isLive: s.mediaType === 'video' || s.mediaType === 'youtube'
    }));
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sb_stories_updated', { detail: newStory }));
    }
    return newStory;
  },

  deleteStory(storyId: string): void {
    const stories = this.getStories();
    const updated = stories.filter(s => s.id !== storyId);
    setStorage(STORAGE_KEYS.STORIES, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sb_stories_updated'));
    }
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
    // Real mode: only return a user if there is an explicit stored session ID
    if (!currentId) return null;
    return users.find(u => u.id === currentId) || null;
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

    // Sync to Neon PostgreSQL
    fetch('/api/auth/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        cpf: formattedCpf,
        password: finalPassword,
        provider: 'cpf'
      })
    }).catch(err => console.warn('Sync CPF to Neon warning:', err));

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
    const clean = rawTrimmed.toLowerCase();
    const cleanNoAt = clean.startsWith('@') ? clean.slice(1) : clean;
    const cleanDigits = rawTrimmed.replace(/\D/g, '');

    const user = users.find(u => {
      if (u.email && u.email.toLowerCase() === clean) return true;
      if (u.username && (u.username.toLowerCase() === clean || u.username.toLowerCase() === cleanNoAt)) return true;
      if (cleanDigits.length === 11 && u.cpf && u.cpf.replace(/\D/g, '') === cleanDigits) return true;
      return false;
    });

    if (!user) {
      return { success: false, error: 'Credenciais não encontradas. Verifique seu e-mail, CPF ou cadastre-se.' };
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

  async checkMemberRegistered(identifier: string): Promise<{ registered: boolean; user?: User }> {
    const clean = identifier.trim().toLowerCase();
    if (!clean) return { registered: false };

    // 1. Check local users first
    const users = this.getUsers();
    const cleanNoAt = clean.startsWith('@') ? clean.slice(1) : clean;
    const localUser = users.find(u => 
      (u.email && u.email.toLowerCase() === clean) ||
      (u.username && (u.username.toLowerCase() === clean || u.username.toLowerCase() === cleanNoAt))
    );

    if (localUser) {
      return { registered: true, user: localUser };
    }

    // 2. Check Neon DB via server API
    try {
      const res = await fetch(`/api/auth/check?email=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.registered && data.user) {
          // Sync with local memory
          const existingIdx = users.findIndex(u => u.id === data.user.id || (u.email && u.email.toLowerCase() === clean));
          if (existingIdx >= 0) {
            users[existingIdx] = { ...users[existingIdx], ...data.user };
          } else {
            users.push(data.user);
          }
          setStorage(STORAGE_KEYS.USERS, users);
          return { registered: true, user: data.user };
        }
      }
    } catch (e) {
      console.warn('Erro ao checar status de membro no Neon:', e);
    }

    return { registered: false };
  },

  async loginWithRegisteredEmail(email: string, password?: string): Promise<{ success: boolean; error?: string; user?: User }> {
    const trimmedPass = (password || '').trim();
    if (!trimmedPass) {
      return { success: false, error: 'A senha de acesso é obrigatória para entrar.' };
    }

    try {
      const response = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: email.trim().split('@')[0],
          password: trimmedPass
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.user) {
        return { success: false, error: data.error || 'Senha incorreta para este e-mail. Acesso negado.' };
      }

      const users = this.getUsers();
      const existingIdx = users.findIndex(u => u.id === data.user.id || (u.email && u.email.toLowerCase() === email.toLowerCase()));
      if (existingIdx >= 0) {
        users[existingIdx] = { ...users[existingIdx], ...data.user };
      } else {
        users.push(data.user);
      }
      setStorage(STORAGE_KEYS.USERS, users);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, data.user.id);
      return { success: true, user: data.user };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Falha ao validar credenciais no servidor.' };
    }
  },

  async loginWithSocial(socialData: {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    provider?: string;
    providerId?: string;
    socialHandle?: string;
    socialLinks?: Record<string, string>;
  }): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const response = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socialData)
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.user) {
        throw new Error(data.error || 'Falha ao autenticar com rede social no servidor.');
      }

      const users = this.getUsers();
      // Match by providerId first (most specific), then by email
      const existingIdx = users.findIndex(u =>
        (socialData.providerId && u.socialLinks?.providerId === socialData.providerId) ||
        (data.user.email && u.email && u.email.toLowerCase() === data.user.email.toLowerCase())
      );
      if (existingIdx >= 0) {
        users[existingIdx] = { ...users[existingIdx], ...data.user };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, users[existingIdx].id);
      } else {
        users.push(data.user);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, data.user.id);
      }
      setStorage(STORAGE_KEYS.USERS, users);

      return { success: true, user: data.user };
    } catch (err: any) {
      console.warn('Fallback local para login social:', err?.message);
      const cleanEmail = (socialData.email || '').toLowerCase().trim();
      if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return { success: false, error: 'E-mail válido é obrigatório para cadastrar como membro.' };
      }

      const users = this.getUsers();
      const cleanProviderId = socialData.providerId || '';

      // Try to find by providerId first (handles same provider, same account)
      let user = cleanProviderId
        ? users.find(u => u.socialLinks?.providerId === cleanProviderId)
        : undefined;

      // Then try by email (exact match only)
      if (!user && cleanEmail) {
        user = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
      }

      if (!user) {
        // New account — create fresh with user's REAL email
        const baseUsername = (socialData.name || 'patriota')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '_')
          .slice(0, 14);
        const uniqueSuffix = Math.floor(100 + Math.random() * 9000);
        const newUser: User = {
          id: 'usr_' + Date.now().toString(36),
          name: socialData.name,
          username: baseUsername + '_' + uniqueSuffix,
          email: cleanEmail,
          avatar: socialData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(socialData.name)}`,
          role: 'user',
          status: 'active',
          rank: 'soldado',
          honorPoints: 100,
          createdAt: new Date().toISOString(),
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          socialLinks: { providerId: cleanProviderId },
          verified: false
        };
        user = newUser;
        users.push(newUser);
        setStorage(STORAGE_KEYS.USERS, users);
      } else {
        // Update name/avatar if re-logging in
        user.name = socialData.name || user.name;
        if (socialData.avatar) user.avatar = socialData.avatar;
        setStorage(STORAGE_KEYS.USERS, users);
      }

      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
        return { success: true, user };
      }
      return { success: false, error: 'Erro ao registrar usuário localmente.' };
    }
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

    // Propagate avatar and name changes to user's posts and comments
    if (data.avatar || data.name) {
      const posts = this.getPosts();
      let changed = false;
      posts.forEach(p => {
        if (p.authorId === userId) {
          if (data.avatar) p.authorAvatar = data.avatar;
          if (data.name) p.authorName = data.name;
          changed = true;
        }
        if (p.comments) {
          p.comments.forEach(c => {
            if (c.userId === userId) {
              if (data.avatar) c.userAvatar = data.avatar;
              if (data.name) c.userName = data.name;
              changed = true;
            }
          });
        }
      });
      if (changed) setStorage(STORAGE_KEYS.POSTS, posts);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sb_user_updated', { detail: users[idx] }));
    }

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

  getFollowingList(userId: string): string[] {
    const followKey = `sb_follows_${userId}`;
    return getStorage<string[]>(followKey, []);
  },

  getFollowingCount(userId: string): number {
    return this.getFollowingList(userId).length;
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

  deleteComment(postId: string, commentId: string, user: User): boolean {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post || !post.comments) return false;

    const comm = post.comments.find(c => c.id === commentId);
    if (!comm) return false;

    if (comm.authorId !== user.id && post.authorId !== user.id && user.role !== 'admin') {
      return false;
    }

    post.comments = post.comments.filter(c => c.id !== commentId);
    post.commentsCount = post.comments.length;
    setStorage(STORAGE_KEYS.POSTS, posts);

    if (user.role === 'admin' && comm.authorId !== user.id) {
      this.addAuditLog('EXCLUSAO_COMENTARIO_ADMIN', user.name, 'Comentário', `Comentário excluído no post ${postId}.`);
    }
    return true;
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

  deleteDebate(debateId: string, user: User): boolean {
    const debates = this.getDebates();
    const deb = debates.find(d => d.id === debateId);
    if (!deb) return false;

    if (deb.authorId !== user.id && user.role !== 'admin') {
      return false;
    }

    const filtered = debates.filter(d => d.id !== debateId);
    setStorage(STORAGE_KEYS.DEBATES, filtered);

    if (user.role === 'admin') {
      this.addAuditLog('EXCLUSAO_DEBATE_ADMIN', user.name, 'Debate', `Debate "${deb.title}" excluído.`);
    }
    return true;
  },

  deleteDebateReply(debateId: string, replyId: string, user: User): boolean {
    const debates = this.getDebates();
    const deb = debates.find(d => d.id === debateId);
    if (!deb) return false;

    const reply = deb.replies.find(r => r.id === replyId);
    if (!reply) return false;

    if (reply.authorId !== user.id && user.role !== 'admin') {
      return false;
    }

    if (reply.stance === 'pro') {
      deb.proCount = Math.max(0, deb.proCount - 1);
    } else {
      deb.conCount = Math.max(0, deb.conCount - 1);
    }
    deb.replies = deb.replies.filter(r => r.id !== replyId);
    deb.repliesCount = deb.replies.length;
    setStorage(STORAGE_KEYS.DEBATES, debates);

    if (user.role === 'admin' && reply.authorId !== user.id) {
      this.addAuditLog('EXCLUSAO_ARGUMENTO_ADMIN', user.name, 'Argumento', `Argumento excluído no debate "${deb.title}".`);
    }
    return true;
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

  deleteGroup(groupId: string, user: User): boolean {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);
    if (!group) return false;

    if (group.creatorId !== user.id && user.role !== 'admin') {
      return false;
    }

    const filtered = groups.filter(g => g.id !== groupId);
    setStorage(STORAGE_KEYS.GROUPS, filtered);

    if (user.role === 'admin') {
      this.addAuditLog('EXCLUSAO_GRUPO_ADMIN', user.name, 'Comunidade', `Grupo "${group.name}" excluído.`);
    }
    return true;
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
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      totalPosts: posts.length,
      totalComments: totalComments,
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

  deleteUser(userId: string, adminUser: User): boolean {
    if (adminUser.role !== 'admin') return false;
    if (userId === adminUser.id) return false;

    const users = this.getUsers();
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return false;

    // 1. Remove user from users list
    const filteredUsers = users.filter(u => u.id !== userId);
    setStorage(STORAGE_KEYS.USERS, filteredUsers);

    // 2. Remove all posts authored by this user & their comments across all posts
    const posts = this.getPosts();
    const filteredPosts = posts.filter(p => p.authorId !== userId);
    filteredPosts.forEach(p => {
      if (p.comments) {
        p.comments = p.comments.filter(c => c.authorId !== userId);
        p.commentsCount = p.comments.length;
      }
    });
    setStorage(STORAGE_KEYS.POSTS, filteredPosts);

    // 3. Remove stories by this user
    const stories = this.getStories().filter(s => s.userId !== userId);
    setStorage(STORAGE_KEYS.STORIES, stories);

    // 4. Remove groups created by this user and clean up memberships
    const groups = this.getGroups();
    const updatedGroups = groups.filter(g => g.creatorId !== userId);
    updatedGroups.forEach(g => {
      if (g.memberUserIds && g.memberUserIds.includes(userId)) {
        g.memberUserIds = g.memberUserIds.filter(id => id !== userId);
        g.membersCount = Math.max(0, g.membersCount - 1);
      }
    });
    setStorage(STORAGE_KEYS.GROUPS, updatedGroups);

    // 5. Remove companies created by this user
    const companies = this.getCompanies().filter(c => c.ownerId !== userId);
    setStorage(STORAGE_KEYS.COMPANIES, companies);

    // 6. Remove debate replies by this user
    const debates = this.getDebates();
    debates.forEach(d => {
      d.replies = d.replies.filter(r => r.authorId !== userId);
      d.repliesCount = d.replies.length;
    });
    setStorage(STORAGE_KEYS.DEBATES, debates);

    this.addAuditLog('EXCLUSAO_MEMBRO_ADMIN', adminUser.name, 'Usuário', `Membro @${targetUser.username} (${targetUser.name}) excluído definitivamente.`);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sb_user_updated'));
    }
    return true;
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

  // ---------------- EMPRESAS & NEGÓCIOS PATRIOTAS ----------------
  getCompanies(filter?: { category?: string; state?: string; search?: string }): Company[] {
    let list = getStorage<Company[]>(STORAGE_KEYS.COMPANIES, DEFAULT_COMPANIES);
    if (filter) {
      if (filter.category && filter.category !== 'Todas') {
        list = list.filter(c => c.category === filter.category);
      }
      if (filter.state && filter.state !== 'Todos') {
        list = list.filter(c => c.state === filter.state);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase().trim();
        list = list.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.ownerName.toLowerCase().includes(q)
        );
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addCompany(companyData: Omit<Company, 'id' | 'createdAt'>, currentUser: User): Company {
    const companies = getStorage<Company[]>(STORAGE_KEYS.COMPANIES, DEFAULT_COMPANIES);
    const newCompany: Company = {
      ...companyData,
      id: `company_${Date.now()}`,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerUsername: currentUser.username,
      ownerAvatar: currentUser.avatar,
      createdAt: new Date().toISOString()
    };
    companies.unshift(newCompany);
    setStorage(STORAGE_KEYS.COMPANIES, companies);
    this.addAuditLog('CADASTRO_EMPRESA', currentUser.name, 'Empresa', `Cadastrou a empresa "${newCompany.name}" na Vitrine Patriota.`);
    return newCompany;
  },

  deleteCompany(companyId: string, userId: string, isAdmin: boolean = false): boolean {
    const companies = getStorage<Company[]>(STORAGE_KEYS.COMPANIES, DEFAULT_COMPANIES);
    const idx = companies.findIndex(c => c.id === companyId);
    if (idx === -1) return false;
    if (companies[idx].ownerId !== userId && !isAdmin) return false;

    companies.splice(idx, 1);
    setStorage(STORAGE_KEYS.COMPANIES, companies);
    return true;
  },

  // ---------------- DOAÇÕES VOLUNTÁRIAS VIA PIX & MURAL DE GRATIDÃO ----------------
  getDonations(): Donation[] {
    const list = getStorage<Donation[]>(STORAGE_KEYS.DONATIONS, DEFAULT_DONATIONS);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  deleteDonation(donationId: string, adminUser: User): boolean {
    if (adminUser.role !== 'admin') return false;
    const donations = this.getDonations();
    const filtered = donations.filter(d => d.id !== donationId);
    setStorage(STORAGE_KEYS.DONATIONS, filtered);
    this.addAuditLog('EXCLUSAO_DOACAO_ADMIN', adminUser.name, 'Doação', `Doação ${donationId} excluída.`);
    return true;
  },

  createDonation(data: {
    donorId?: string;
    donorName: string;
    donorUsername?: string;
    donorAvatar?: string;
    amount: number;
    message?: string;
    pixKey?: string;
  }): { donation: Donation; updatedUser?: User; rankPromoted?: boolean; newRankTitle?: string } {
    const donations = getStorage<Donation[]>(STORAGE_KEYS.DONATIONS, DEFAULT_DONATIONS);
    let updatedUser: User | undefined;
    let rankPromoted = false;
    let newRankTitle = '';
    let targetRank: UserRank = 'cabo';

    if (data.donorId) {
      const users = this.getUsers();
      const user = users.find(u => u.id === data.donorId);
      if (user) {
        const oldRank = user.rank || 'soldado';
        const nextRankDef = getNextRank(oldRank);
        if (nextRankDef) {
          user.rank = nextRankDef.id;
          targetRank = nextRankDef.id;
          newRankTitle = nextRankDef.title;
          rankPromoted = true;
        } else {
          targetRank = oldRank;
          newRankTitle = RANK_DEFINITIONS[oldRank].title;
        }

        // Grant bonus honor points for patriotic support
        user.honorPoints = (user.honorPoints || 0) + 500;
        setStorage(STORAGE_KEYS.USERS, users);
        updatedUser = user;

        // Create congratulatory notification
        this.createNotification({
          userId: user.id,
          fromUserId: 'usr_admin',
          fromUserName: 'Administração Central',
          fromUserAvatar: '/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png',
          type: 'admin_notice',
          title: '🎖️ Promoção por Apoio Patriótico!',
          message: `Sua doação voluntária via PIX foi confirmada! Você foi promovido para a patente de ${newRankTitle} e recebeu destaque no Mural de Gratidão da tela inicial. Muito obrigado por fortalecer nossa causa!`,
          link: '/perfil'
        });

        this.addAuditLog(
          'DOACAO_PIX_RECEBIDA',
          user.name,
          'Doação PIX',
          `Doou R$ ${data.amount} via PIX (${data.pixKey || '81119119200'}). Promovido para ${targetRank}.`
        );
      }
    } else {
      targetRank = 'cabo';
      newRankTitle = 'Cabo da Reserva Cívica';
    }

    const newDonation: Donation = {
      id: `don_${Date.now()}`,
      donorId: data.donorId,
      donorName: data.donorName,
      donorUsername: data.donorUsername,
      donorAvatar: data.donorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      amount: data.amount,
      message: data.message,
      pixKey: data.pixKey || '81119119200',
      previousRank: updatedUser ? updatedUser.rank : undefined,
      newRank: targetRank,
      createdAt: new Date().toISOString(),
      transactionCode: `PIX-${Math.floor(100000 + Math.random() * 900000)}`
    };

    donations.unshift(newDonation);
    setStorage(STORAGE_KEYS.DONATIONS, donations);

    return {
      donation: newDonation,
      updatedUser,
      rankPromoted,
      newRankTitle
    };
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
    localStorage.removeItem(STORAGE_KEYS.STORIES);
    localStorage.removeItem(STORAGE_KEYS.COMPANIES);
    localStorage.removeItem(STORAGE_KEYS.DONATIONS);
    this.init();
  }
};
