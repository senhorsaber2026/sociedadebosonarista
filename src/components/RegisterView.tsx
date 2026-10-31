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
      const emailPrompt = provider === 'Google' 
        ? 'biomedico97@gmail.com' 
        : `patriota_${provider.toLowerCase()}@email.com`;
      const result = await storageService.loginWithSocial({
        name: `Patriota ${provider}`,
        email: emailPrompt,
        socialHandle: `@patriota_${provider.toLowerCase()}`,
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

          {/* INSTAGRAM & WHATSAPP */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSocialRegister('Instagram')}
              disabled={isLoading}
              className="py-2.5 px-2.5 rounded-xl bg-gradient-to-r from-[#833ab4]/20 via-[#fd1d1d]/20 to-[#fcb045]/20 hover:from-[#833ab4]/30 hover:to-[#fcb045]/30 border border-[#E1306C]/40 text-xs font-semibold text-[#F5F5F0] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-[#E1306C] shrink-0" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Cadastrar com Instagram</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialRegister('WhatsApp')}
              disabled={isLoading}
              className="py-2.5 px-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-xs font-semibold text-[#F5F5F0] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.159.57 4.184 1.564 5.938l-1.564 5.714 5.86-1.536c1.677.915 3.597 1.434 5.64 1.434 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>Cadastrar com WhatsApp</span>
            </button>
          </div>

          {/* MORE NETWORKS: FACEBOOK, X, TELEGRAM, TIKTOK, APPLE */}
          <div className="grid grid-cols-5 gap-1.5">
            <button
              type="button"
              onClick={() => handleSocialRegister('Facebook')}
              disabled={isLoading}
              className="py-2 rounded-xl bg-[#15291F] hover:bg-[#203a2c] border border-[#263B30] hover:border-[#1877F2]/50 text-[10px] font-semibold text-[#F5F5F0] transition flex flex-col items-center justify-center gap-1 cursor-pointer"
              title="Cadastrar com Facebook"
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
              className="py-2 rounded-xl bg-[#15291F] hover:bg-[#203a2c] border border-[#263B30] hover:border-white/50 text-[10px] font-semibold text-[#F5F5F0] transition flex flex-col items-center justify-center gap-1 cursor-pointer"
              title="Cadastrar com X"
            >
              <svg className="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>X / Twitter</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialRegister('Telegram')}
              disabled={isLoading}
              className="py-2 rounded-xl bg-[#15291F] hover:bg-[#203a2c] border border-[#263B30] hover:border-[#229ED9]/50 text-[10px] font-semibold text-[#F5F5F0] transition flex flex-col items-center justify-center gap-1 cursor-pointer"
              title="Cadastrar com Telegram"
            >
              <svg className="w-3.5 h-3.5 fill-[#229ED9] shrink-0" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span>Telegram</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialRegister('TikTok')}
              disabled={isLoading}
              className="py-2 rounded-xl bg-[#15291F] hover:bg-[#203a2c] border border-[#263B30] hover:border-pink-500/50 text-[10px] font-semibold text-[#F5F5F0] transition flex flex-col items-center justify-center gap-1 cursor-pointer"
              title="Cadastrar com TikTok"
            >
              <svg className="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
              <span>TikTok</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialRegister('Apple')}
              disabled={isLoading}
              className="py-2 rounded-xl bg-[#15291F] hover:bg-[#203a2c] border border-[#263B30] hover:border-white/50 text-[10px] font-semibold text-[#F5F5F0] transition flex flex-col items-center justify-center gap-1 cursor-pointer"
              title="Cadastrar com Apple"
            >
              <svg className="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24">
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
