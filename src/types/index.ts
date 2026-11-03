/**
 * Core type definitions for Sociedade Bosonarista
 */

export type UserRole = 'admin' | 'moderator' | 'user';

export type UserStatus = 'active' | 'suspended' | 'banned';

export type UserRank = 
  | 'soldado'
  | 'cabo'
  | 'sargento'
  | 'tenente'
  | 'capitao'
  | 'major'
  | 'coronel'
  | 'general';

export interface RankDefinition {
  id: UserRank;
  name: string;
  level: number;
  minPoints: number;
  stars: number;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  title: string;
  description: string;
  privileges: string[];
  insigniaSymbol: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  x?: string;
  whatsapp?: string;
  website?: string;
  providerId?: string;
  [key: string]: string | undefined;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  cpf?: string;
  password?: string;
  avatar: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  birthDate?: string;
  role: UserRole;
  status: UserStatus;
  rank: UserRank;
  honorPoints: number;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  socialLinks: SocialLinks;
  verified?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  votedUserIds: string[];
}

export interface Poll {
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRank?: UserRank;
  content: string;
  createdAt: string;
  likes: number;
  likedUserIds: string[];
  replies?: CommentReply[];
}

export interface CommentReply {
  id: string;
  commentId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRank?: UserRank;
  content: string;
  createdAt: string;
  likes: number;
  likedUserIds: string[];
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRole?: UserRole;
  authorRank?: UserRank;
  authorVerified?: boolean;
  content: string;
  category: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'youtube' | 'twitter';
  youtubeUrl?: string;
  youtubeId?: string;
  twitterUrl?: string;
  twitterId?: string;
  poll?: Poll;
  likesCount: number;
  likedUserIds: string[];
  commentsCount: number;
  comments: Comment[];
  sharesCount: number;
  savedUserIds: string[];
  groupId?: string;
  groupName?: string;
  createdAt: string;
  updatedAt?: string;
}

export type NewsCategory = 
  | 'Política'
  | 'Brasil'
  | 'Economia'
  | 'Congresso'
  | 'Judiciário'
  | 'Segurança Pública'
  | 'Segurança'
  | 'Educação'
  | 'Saúde'
  | 'Internacional'
  | 'Opinião'
  | string;

export interface NewsItem {
  id: string;
  title: string;
  subtitle?: string;
  summary: string;
  content: string;
  imageUrl: string;
  category: NewsCategory;
  authorId: string;
  authorName: string;
  sourceOriginal: string;
  sourceUrl?: string;
  publishedAt: string;
  isFeatured: boolean;
  viewsCount: number;
  isOpinion?: boolean;
}

export type DebateCategory =
  | 'Política'
  | 'Política brasileira'
  | 'Economia'
  | 'Liberdade de expressão'
  | 'Educação'
  | 'Segurança pública'
  | 'Governo'
  | 'Eleições'
  | 'Sociedade'
  | 'Relações internacionais'
  | string;

export interface DebateReply {
  id: string;
  debateId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRank?: UserRank;
  stance: 'pro' | 'con' | 'neutral';
  content: string;
  upvotes: number;
  upvotedUserIds: string[];
  createdAt: string;
}

export interface DebateTopic {
  id: string;
  title: string;
  description: string;
  category: DebateCategory;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRank?: UserRank;
  createdAt: string;
  repliesCount: number;
  proCount: number;
  conCount: number;
  replies: DebateReply[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  category: string;
  creatorId: string;
  isPrivate: boolean;
  membersCount: number;
  memberUserIds: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export type NotificationType =
  | 'like'
  | 'comment'
  | 'reply'
  | 'follow'
  | 'message'
  | 'group_invite'
  | 'admin_notice'
  | 'live_started';

export interface LiveSession {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  description?: string;
  viewerCount: number;
  isActive: boolean;
  startedAt: string;
  endedAt?: string;
}

export interface LiveChatMessage {
  id: string;
  liveId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  fromUserId?: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export type ReportReason =
  | 'Spam'
  | 'Assédio'
  | 'Ameaça'
  | 'Discurso de ódio'
  | 'Desinformação'
  | 'Conteúdo ilegal'
  | 'Violação de privacidade'
  | 'Outro';

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  contentType: 'post' | 'comment' | 'user' | 'group' | 'debate';
  contentId: string;
  contentSnippet: string;
  reason: ReportReason;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  actionTaken?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalComments: number;
  totalGroups: number;
  totalNews: number;
  pendingReports: number;
}

export interface StoryItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  hasUnseenStory?: boolean;
  isVerified?: boolean;
  isCurrentUser?: boolean;
  isLive?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'youtube' | 'twitter';
  youtubeUrl?: string;
  youtubeId?: string;
  twitterUrl?: string;
  twitterId?: string;
  caption?: string;
  createdAt?: string;
  badgeType?: 'verified' | 'flag' | 'star';
}

export interface Company {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerUsername: string;
  ownerAvatar: string;
  category: string;
  description: string;
  city: string;
  state: string;
  whatsapp?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  logoUrl?: string;
  specialOffer?: string;
  verified?: boolean;
  createdAt: string;
}

export interface Donation {
  id: string;
  donorId?: string;
  donorName: string;
  donorUsername?: string;
  donorAvatar?: string;
  amount: number;
  message?: string;
  pixKey: string;
  previousRank?: UserRank;
  newRank: UserRank;
  createdAt: string;
  transactionCode?: string;
}

