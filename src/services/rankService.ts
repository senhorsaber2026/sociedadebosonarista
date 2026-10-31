import { UserRank, RankDefinition } from '../types';

export const RANK_DEFINITIONS: Record<UserRank, RankDefinition> = {
  soldado: {
    id: 'soldado',
    name: 'Soldado',
    level: 1,
    minPoints: 0,
    stars: 0,
    badgeBg: 'bg-emerald-950/80',
    textColor: 'text-emerald-300',
    borderColor: 'border-emerald-600/40',
    title: 'Soldado Patriota',
    description: 'Todo cidadão ingressa na Sociedade Bosonarista com a patente de Soldado. Representa a força de base e a disposição para lutar pelo Brasil.',
    privileges: [
      'Publicar texto, imagens e vídeos no feed',
      'Votar em enquetes populares da comunidade',
      'Participar de grupos públicos e acompanhar notícias'
    ],
    insigniaSymbol: 'V'
  },
  cabo: {
    id: 'cabo',
    name: 'Cabo',
    level: 2,
    minPoints: 150,
    stars: 0,
    badgeBg: 'bg-emerald-900/90',
    textColor: 'text-emerald-200',
    borderColor: 'border-emerald-500/50',
    title: 'Cabo da Reserva Cívica',
    description: 'Membro engajado que já publicou e debateu ativamente com seus concidadãos na plataforma.',
    privileges: [
      'Todas as vantagens de Soldado',
      'Votar em tópicos de debates políticos oficiais',
      'Criar comentários com destaque visual',
      'Acesso à criação de grupos locais'
    ],
    insigniaSymbol: 'VV'
  },
  sargento: {
    id: 'sargento',
    name: 'Sargento',
    level: 3,
    minPoints: 400,
    stars: 1,
    badgeBg: 'bg-[#183925]',
    textColor: 'text-[#E8CC76]',
    borderColor: 'border-[#D4AF37]/50',
    title: 'Sargento de Infantaria Cívica',
    description: 'Voz ativa reconhecida pela comunidade, com consistência em publicações e dezenas de curtidas recebidas.',
    privileges: [
      'Todas as vantagens de Cabo',
      'Abrir novos tópicos de debates públicos',
      'Selo visual com divisas douradas nas publicações',
      'Prioridade na fila de dúvidas e moderação'
    ],
    insigniaSymbol: 'VVV'
  },
  tenente: {
    id: 'tenente',
    name: 'Tenente',
    level: 4,
    minPoints: 900,
    stars: 1,
    badgeBg: 'bg-[#1a442c]',
    textColor: 'text-[#F5F5F0]',
    borderColor: 'border-[#D4AF37]/60',
    title: 'Primeiro-Tenente da Pátria',
    description: 'Liderança regional atuante, com grupos criados e presença diária na formulação de ideias e análises cívicas.',
    privileges: [
      'Todas as vantagens de Sargento',
      '1 Estrela prateada/dourada no avatar e nome',
      'Moderação voluntária em grupos que administra',
      'Destaque no feed de membros ativos'
    ],
    insigniaSymbol: '★'
  },
  capitao: {
    id: 'capitao',
    name: 'Capitão',
    level: 5,
    minPoints: 1800,
    stars: 3,
    badgeBg: 'bg-gradient-to-r from-[#174D32] to-[#25633e]',
    textColor: 'text-[#E8CC76]',
    borderColor: 'border-[#D4AF37]',
    title: 'Capitão do Povo',
    description: 'Patente de alta honra e liderança inspiradora. Reconhece os patriotas mais combativos e comprometidos com a liberdade e a verdade.',
    privileges: [
      'Todas as vantagens de Tenente',
      'Insignia Tripla de Estrelas Douradas',
      'Voto com peso dobrado (x2) em enquetes populares da plataforma',
      'Publicações com prioridade no algoritmo da comunidade',
      'Destaque especial com moldura dourada no perfil'
    ],
    insigniaSymbol: '★★★'
  },
  major: {
    id: 'major',
    name: 'Major',
    level: 6,
    minPoints: 3200,
    stars: 2,
    badgeBg: 'bg-gradient-to-r from-[#1b3d29] to-[#28573b]',
    textColor: 'text-[#F8E7A2]',
    borderColor: 'border-[#E8CC76]',
    title: 'Major da Soberania Nacional',
    description: 'Estrategista cívico com centenas de debates e argumentos apoiados pela grande maioria dos patriotas.',
    privileges: [
      'Todas as vantagens de Capitão',
      'Brasão especial das Armas da República',
      'Possibilidade de sugerir pautas oficiais para o Portal de Notícias',
      'Criação de debates prioritários fixados'
    ],
    insigniaSymbol: '★♦★'
  },
  coronel: {
    id: 'coronel',
    name: 'Coronel',
    level: 7,
    minPoints: 5000,
    stars: 3,
    badgeBg: 'bg-gradient-to-r from-[#152e20] via-[#215336] to-[#152e20]',
    textColor: 'text-[#D4AF37]',
    borderColor: 'border-[#D4AF37]',
    title: 'Coronel Comandante',
    description: 'Comandante de núcleos patrióticos, referência moral e cívica com milhares de seguidores e influência expressiva.',
    privileges: [
      'Todas as vantagens de Major',
      'Selo Oficial de Coronel com Louros de Ouro Maciço',
      'Canal de comunicação direta com a Administração Central',
      'Destaque permanente na coluna de lideranças recomendadas'
    ],
    insigniaSymbol: '✦★★★✦'
  },
  general: {
    id: 'general',
    name: 'General',
    level: 8,
    minPoints: 8000,
    stars: 4,
    badgeBg: 'bg-gradient-to-r from-[#241a08] via-[#3d2e0e] to-[#241a08]',
    textColor: 'text-[#E8CC76]',
    borderColor: 'border-[#E8CC76]',
    title: 'General de Exército Cívico',
    description: 'A mais alta patente honorífica da Sociedade Bosonarista. Concedida aos patriotas que dedicaram sua voz, tempo e liderança em defesa do Brasil.',
    privileges: [
      'Todas as vantagens de Coronel',
      'Insignia Máxima de 4 Estrelas Douradas Radiantes',
      'Assento no Conselho Consultivo Superior da plataforma',
      'Imunidade contra restrições automáticas de frequência de envio',
      'Moldura lendária de ouro cintilante no perfil e publicações'
    ],
    insigniaSymbol: '★★★★'
  }
};

export const RANKS_ORDER: UserRank[] = [
  'soldado',
  'cabo',
  'sargento',
  'tenente',
  'capitao',
  'major',
  'coronel',
  'general'
];

export const calculateRankFromPoints = (points: number): UserRank => {
  for (let i = RANKS_ORDER.length - 1; i >= 0; i--) {
    const rankId = RANKS_ORDER[i];
    if (points >= RANK_DEFINITIONS[rankId].minPoints) {
      return rankId;
    }
  }
  return 'soldado';
};

export const getNextRank = (currentRank: UserRank): RankDefinition | null => {
  const currentIndex = RANKS_ORDER.indexOf(currentRank);
  if (currentIndex < RANKS_ORDER.length - 1) {
    return RANK_DEFINITIONS[RANKS_ORDER[currentIndex + 1]];
  }
  return null;
};

export const getPointsToNextRank = (points: number, currentRank: UserRank): { needed: number; percent: number } => {
  const next = getNextRank(currentRank);
  if (!next) return { needed: 0, percent: 100 };

  const currentMin = RANK_DEFINITIONS[currentRank].minPoints;
  const targetMin = next.minPoints;
  const span = targetMin - currentMin;
  const currentProgress = points - currentMin;

  const percent = Math.min(100, Math.max(0, Math.round((currentProgress / span) * 100)));
  const needed = Math.max(0, targetMin - points);

  return { needed, percent };
};
