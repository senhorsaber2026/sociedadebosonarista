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
