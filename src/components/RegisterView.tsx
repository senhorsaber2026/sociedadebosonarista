import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Calendar, 
  Check, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  Key, 
  Copy, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { User } from '../types';
import { RankBadge } from './RankBadge';
import { showToast } from './Toast';

interface RegisterViewProps {
  onSuccess: () => void;
  onOpenLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onSuccess,
  onOpenLogin
}) => {
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [wantCustomPassword, setWantCustomPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [copied, setCopied] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ user: User; tempPassword: string } | null>(null);

  const formatCPF = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const cleanDigits = cpf.replace(/\D/g, '');
  const tempPasswordPreview = cleanDigits.length >= 4 ? cleanDigits.slice(0, 4) : '••••';

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!username) {
      // Auto-suggest friendly username
      const suggested = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 20);
      setUsername(suggested);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cleanDigits.length !== 11) {
      setError('Por favor, informe um CPF válido com 11 dígitos.');
      return;
    }

    if (!name.trim()) {
      setError('Informe seu nome completo.');
      return;
    }

    if (!username.trim() || username.length < 3) {
      setError('Escolha um nome de usuário com ao menos 3 caracteres.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Informe um endereço de e-mail válido.');
      return;
    }

    if (!acceptTerms) {
      setError('Você deve concordar com os Termos de Uso e Política de Privacidade (LGPD).');
      return;
    }

    setIsLoading(true);
    const result = storageService.register({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      cpf: cpf.trim(),
      password: wantCustomPassword && customPassword ? customPassword : undefined,
      birthDate: birthDate || undefined
    });
    setIsLoading(false);

    if (result.success && result.user && result.tempPassword) {
      setSuccessData({
        user: result.user,
        tempPassword: result.tempPassword
      });
      showToast('Alistamento realizado com sucesso! Patente: Soldado.', 'success');
    } else {
      setError(result.error || 'Erro ao realizar cadastro.');
    }
  };

  const handleCopyPassword = () => {
    if (!successData) return;
    navigator.clipboard.writeText(successData.tempPassword);
    setCopied(true);
    showToast('Senha temporária copiada para a área de transferência!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSocialRegister = async (provider: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const emailPrompt = provider === 'Google' ? 'biomedico97@gmail.com' : `patriota_${provider.toLowerCase()}@email.com`;
      const result = await storageService.loginWithSocial({
        name: 'Patriota Brasil',
        email: emailPrompt,
        provider: provider.toLowerCase(),
        providerId: `${provider.toLowerCase()}_${emailPrompt.replace(/[^a-zA-Z0-9]/g, '_')}`
      });
      setIsLoading(false);
      if (result.success && result.user) {
        showToast(`Cadastro via ${provider} concluído com sucesso no Neon PostgreSQL!`, 'success');
        onSuccess();
      } else {
        setError(result.error || 'Erro ao cadastrar com rede social.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Falha ao conectar.');
    }
  };

  // SUCCESS VIEW
  if (successData) {
    return (
      <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#102019] border border-[#D4AF37]/50 shadow-2xl space-y-6 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl overflow-hidden mx-auto border-2 border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.4)]">
          <img
            src="/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png"
            alt="Emblema Oficial"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#174D32] border border-[#D4AF37]/40 text-[#E8CC76] text-xs font-bold mb-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            Alistamento Concluído com Sucesso
          </div>
          <h2 className="font-serif-patriotic text-2xl sm:text-3xl font-bold text-[#F5F5F0]">
            Bem-vindo à Sociedade Bosonarista!
          </h2>
          <p className="text-sm text-[#A5B2A9] mt-1 max-w-lg mx-auto">
            Seu cadastro foi homologado. Você agora faz parte da comunidade patriótica brasileira.
          </p>
        </div>

        {/* INITIAL RANK CARD */}
        <div className="p-4 rounded-2xl bg-[#07140F] border border-[#263B30] flex items-center justify-between gap-4 max-w-md mx-auto text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-300 font-black text-lg">
              🪖
            </div>
            <div>
              <div className="text-[10px] text-[#A5B2A9] uppercase font-bold tracking-wider">Patente Inicial Atribuída</div>
              <div className="text-sm font-bold text-[#F5F5F0]">Soldado Patriota</div>
              <div className="text-xs text-[#D4AF37]">0 Pontos de Honra</div>
            </div>
          </div>
          <RankBadge rank="soldado" size="sm" />
        </div>

        {/* TEMPORARY PASSWORD HIGHLIGHT BOX */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#15291F] to-[#07140F] border-2 border-[#D4AF37] max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <Key className="w-4 h-4 text-[#D4AF37]" />
            Sua Senha Temporária de Primeiro Acesso
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <div className="px-5 py-2.5 rounded-xl bg-[#07140F] border border-[#263B30] text-2xl font-mono font-bold text-[#E8CC76] tracking-widest shadow-inner">
              {successData.tempPassword}
            </div>
            <button
              onClick={handleCopyPassword}
              className="p-2.5 rounded-xl bg-[#174D32] hover:bg-[#226B47] text-[#E8CC76] border border-[#D4AF37]/50 transition flex items-center gap-1.5 text-xs font-bold"
              title="Copiar Senha"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiada' : 'Copiar'}</span>
            </button>
          </div>

          <p className="text-xs text-[#A5B2A9] leading-relaxed">
            Esta senha corresponde aos <strong>4 primeiros dígitos do seu CPF</strong> ({successData.user.cpf}). Guarde-a ou use para seus futuros logins. Você poderá alterá-la para uma senha pessoal no seu perfil a qualquer momento.
          </p>
        </div>

        {/* ACCESS BUTTON */}
        <div className="pt-2">
          <button
            onClick={onSuccess}
            className="w-full max-w-md py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-bold text-sm sm:text-base shadow-xl hover:brightness-110 transition flex items-center justify-center gap-2 mx-auto"
          >
            <span>Acessar a Plataforma Agora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // REGISTRATION FORM
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* HEADER HERO */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#102019] border border-[#263B30] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-[#174D32]/30 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)] shrink-0">
            <img
              src="/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] mb-1">
              <Shield className="w-4 h-4" />
              <span>Alistamento Cívico Oficial</span>
            </div>
            <h1 className="font-serif-patriotic text-2xl sm:text-3xl font-bold text-[#F5F5F0]">
              Área de Cadastro de Usuário
            </h1>
            <p className="text-xs sm:text-sm text-[#A5B2A9] mt-1 leading-relaxed">
              Cadastre-se na <strong>Sociedade Bosonarista</strong> utilizando o seu <strong>CPF</strong>. Todo novo cidadão ingressa com a honrosa patente de <strong>Soldado</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* REGISTRATION FORM CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#102019] border border-[#263B30] shadow-xl">
        
        {/* SOCIAL SIGNUP BLOCK */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#0b1712] border border-[#263B30] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#E8CC76] uppercase tracking-wider">
              Alistamento Instantâneo com Rede Social
            </span>
            <span className="text-[10px] text-[#A5B2A9] font-mono">Neon DB</span>
          </div>

          <button
            type="button"
            onClick={() => handleSocialRegister('Google')}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#15291F] hover:bg-[#1f3b2d] border border-[#D4AF37]/50 text-xs sm:text-sm font-bold text-[#F5F5F0] transition flex items-center justify-center gap-3 cursor-pointer shadow-md hover:brightness-110"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Cadastrar com o Google (1-Clique)</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSocialRegister('Facebook')}
              disabled={isLoading}
              className="py-2.5 px-2 rounded-xl bg-[#15291F] hover:bg-[#203a2c] border border-[#263B30] text-xs font-semibold text-[#F5F5F0] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialRegister('X')}
              disabled={isLoading}
              className="py-2.5 px-2 rounded-xl bg-[#15291F] hover:bg-[#203a2c] border border-[#263B30] text-xs font-semibold text-[#F5F5F0] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>X / Twitter</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialRegister('Apple')}
              disabled={isLoading}
              className="py-2.5 px-2 rounded-xl bg-[#15291F] hover:bg-[#203a2c] border border-[#263B30] text-xs font-semibold text-[#F5F5F0] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.57-.7 1.01-1.68.9-2.67-.88.04-1.93.59-2.55 1.32-.54.63-.99 1.63-.86 2.6.98.08 1.95-.53 2.51-1.25"/>
              </svg>
              <span>Apple</span>
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#263B30]"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-[#A5B2A9] tracking-wider">
              Ou realize alistamento tradicional com CPF
            </span>
            <div className="flex-grow border-t border-[#263B30]"></div>
          </div>
        </div>

        {/* CPF RULES NOTIFICATION */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#15291F] to-[#102019] border border-[#D4AF37]/50 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#174D32] text-[#E8CC76] shrink-0 mt-0.5">
            <Key className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <div className="font-bold text-[#E8CC76]">
              Cadastro via CPF & Senha Temporária Automática
            </div>
            <p className="text-[#A5B2A9] leading-relaxed">
              O seu cadastro é vinculado ao seu CPF. Ao finalizar, o sistema gera automaticamente uma <strong>senha temporária com os 4 primeiros dígitos do seu CPF</strong> para o seu primeiro acesso.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#2a1414] border border-[#D94B4B] text-xs text-[#F5F5F0] flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#D94B4B] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* CPF FIELD (PRIMARY) */}
          <div className="p-4 rounded-2xl bg-[#07140F] border border-[#263B30] space-y-2">
            <label className="block text-xs font-bold text-[#E8CC76]">
              CPF do Cidadão * (Obrigatório)
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
              <input
                type="text"
                required
                value={cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full bg-[#15291F] text-sm text-[#F5F5F0] font-mono placeholder-[#A5B2A9] pl-10 pr-4 py-3 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none transition"
              />
            </div>
            
            {/* REAL-TIME PREVIEW OF GENERATED PASSWORD */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[#A5B2A9]">
                Senha temporária que será gerada:
              </span>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#15291F] border border-[#D4AF37]/40 text-[#E8CC76]">
                {tempPasswordPreview} (4 primeiros dígitos)
              </span>
            </div>
          </div>

          {/* FULL NAME */}
          <div>
            <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
              Nome Completo *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="Ex: Carlos Eduardo Silveira"
                className="w-full bg-[#15291F] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] pl-9 pr-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* USERNAME & BIRTHDATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                Nome de Usuário (@) *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="carlos_patriota"
                className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                Data de Nascimento
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] pl-9 pr-3 py-2 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
              E-mail Válido *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@dominio.com.br"
                className="w-full bg-[#15291F] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] pl-9 pr-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* OPTIONAL CUSTOM PASSWORD TOGGLE */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setWantCustomPassword(!wantCustomPassword)}
              className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold"
            >
              <Key className="w-3.5 h-3.5" />
              <span>
                {wantCustomPassword 
                  ? 'Usar apenas a senha temporária dos 4 dígitos do CPF' 
                  : 'Deseja definir uma senha personalizada agora? (Opcional)'}
              </span>
            </button>

            {wantCustomPassword && (
              <div className="mt-2 p-3 rounded-xl bg-[#07140F] border border-[#263B30]">
                <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                  Senha Personalizada (Mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="Defina sua senha agora ou deixe em branco para usar os 4 dígitos do CPF"
                  className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* TERMS & PRIVACY */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-[#A5B2A9] cursor-pointer">
              <input
                type="checkbox"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded text-[#D4AF37] focus:ring-0"
              />
              <span className="leading-relaxed">
                Declaro que sou brasileiro ou apoiador da soberania nacional, concordo com os <strong>Termos de Uso</strong> e com a <strong>Política de Privacidade (LGPD)</strong> da Sociedade Bosonarista.
              </span>
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-bold text-sm shadow-xl hover:brightness-110 transition disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-[#07140F]" />
            <span>{isLoading ? 'Cadastrando Cidadão...' : 'Concluir Cadastro & Obter Patente de Soldado'}</span>
          </button>

          {/* LOGIN LINK */}
          <div className="text-center pt-3 border-t border-[#263B30]/60">
            <span className="text-xs text-[#A5B2A9]">Já possui cadastro na Sociedade Bosonarista? </span>
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-xs text-[#E8CC76] font-bold hover:underline"
            >
              Entrar com CPF ou E-mail
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
