import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Calendar, 
  Check, 
  AlertCircle, 
  X, 
  Key, 
  Copy, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { User } from '../types';
import { RankBadge } from './RankBadge';
import { showToast } from './Toast';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onSuccess
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  
  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form
  const [regCpf, setRegCpf] = useState('');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [customPassword, setCustomPassword] = useState('');
  const [showCustomPassword, setShowCustomPassword] = useState(false);

  // Success state after registration
  const [regSuccess, setRegSuccess] = useState<{ user: User; tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Social Auth State (Neon PostgreSQL)
  const [socialPromptOpen, setSocialPromptOpen] = useState(false);
  const [currentSocialProvider, setCurrentSocialProvider] = useState<'Google' | 'Facebook' | 'Apple' | 'X'>('Google');
  const [socialEmailInput, setSocialEmailInput] = useState('');
  const [socialNameInput, setSocialNameInput] = useState('');

  if (!isOpen) return null;

  const formatCPF = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setRegCpf(formatted);
  };

  const cleanCpfDigits = regCpf.replace(/\D/g, '');
  const tempPasswordPreview = cleanCpfDigits.length >= 4 ? cleanCpfDigits.slice(0, 4) : '••••';

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRegName(val);
    if (!regUsername) {
      const suggested = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 20);
      setRegUsername(suggested);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Preencha seu CPF/e-mail/usuário e senha.');
      return;
    }

    setIsLoading(true);
    const result = storageService.login(loginIdentifier.trim(), loginPassword);
    setIsLoading(false);

    if (result.success && result.user) {
      showToast(`Bem-vindo de volta, ${result.user.name}!`);
      onSuccess();
      onClose();
    } else {
      setError(result.error || 'Credenciais inválidas.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cleanCpfDigits.length !== 11) {
      setError('Por favor, informe um CPF válido com 11 dígitos.');
      return;
    }

    if (!regName.trim() || !regUsername.trim() || !regEmail.trim()) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!acceptTerms) {
      setError('Você deve aceitar os Termos de Uso e a Política de Privacidade (LGPD).');
      return;
    }

    setIsLoading(true);
    const result = storageService.register({
      name: regName.trim(),
      username: regUsername.trim(),
      email: regEmail.trim(),
      cpf: regCpf.trim(),
      password: showCustomPassword && customPassword ? customPassword : undefined,
      birthDate: regBirthDate || undefined
    });
    setIsLoading(false);

    if (result.success && result.user && result.tempPassword) {
      setRegSuccess({
        user: result.user,
        tempPassword: result.tempPassword
      });
      showToast('Conta criada com sucesso! Patente: Soldado.', 'success');
    } else {
      setError(result.error || 'Erro ao realizar cadastro.');
    }
  };

  const handleCopyPassword = () => {
    if (!regSuccess) return;
    navigator.clipboard.writeText(regSuccess.tempPassword);
    setCopied(true);
    showToast('Senha temporária copiada!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFinishAndEnter = () => {
    onSuccess();
    onClose();
  };

  const handleQuickLoginAdmin = () => {
    storageService.setCurrentUser('usr_admin');
    showToast('Conectado como Administração Central (Admin Oficial)!');
    onSuccess();
    onClose();
  };

  const handleQuickLoginSilva = () => {
    storageService.setCurrentUser('usr_silva');
    showToast('Conectado como Coronel Silva (Cidadão Patriota)!');
    onSuccess();
    onClose();
  };

  const handleSocialAuth = (provider: 'Google' | 'Facebook' | 'Apple' | 'X') => {
    setCurrentSocialProvider(provider);
    setError(null);
    if (provider === 'Google') {
      setSocialNameInput('Patriota Brasil');
      setSocialEmailInput('biomedico97@gmail.com');
    } else if (provider === 'Facebook') {
      setSocialNameInput('Cidadão Patriota');
      setSocialEmailInput('cidadao@facebook.com');
    } else if (provider === 'X') {
      setSocialNameInput('Voz da Liberdade');
      setSocialEmailInput('liberdade@x.com');
    } else {
      setSocialNameInput('Membro Apple');
      setSocialEmailInput('membro@privaterelay.appleid.com');
    }
    setSocialPromptOpen(true);
  };

  const handleExecuteSocialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialEmailInput.trim() || !socialNameInput.trim()) {
      setError('Por favor preencha seu nome e e-mail da rede social.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await storageService.loginWithSocial({
        name: socialNameInput.trim(),
        email: socialEmailInput.trim(),
        provider: currentSocialProvider.toLowerCase(),
        providerId: `${currentSocialProvider.toLowerCase()}_${socialEmailInput.trim().replace(/[^a-zA-Z0-9]/g, '_')}`
      });
      setIsLoading(false);
      if (result.success && result.user) {
        showToast(`Bem-vindo, ${result.user.name}! Conectado via ${currentSocialProvider} no banco Neon.`, 'success');
        setSocialPromptOpen(false);
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Falha ao autenticar.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Erro ao conectar à rede social.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#102019] border border-[#263B30] rounded-3xl shadow-2xl p-6 my-auto animate-fade-in max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#A5B2A9] hover:text-[#F5F5F0] hover:bg-[#15291F] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-2 border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <img
              src="/assets/aistudio/P_ster_Patri_tico_com_Brasil_e_Sociedade_de_Bosonarista_7068039e.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-serif-patriotic text-lg sm:text-xl font-bold text-[#F5F5F0]">
            SOCIEDADE <span className="text-[#D4AF37]">BOSONARISTA</span>
          </h3>
          <p className="text-xs text-[#A5B2A9]">
            Acesso à comunidade patriótica brasileira
          </p>
        </div>

        {/* REGISTRATION SUCCESS VIEW */}
        {regSuccess ? (
          <div className="space-y-4 text-center animate-fade-in py-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#174D32] border border-[#D4AF37]/50 text-[#E8CC76] text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              Alistamento Cívico Concluído
            </div>

            <h4 className="font-serif-patriotic text-xl font-bold text-[#F5F5F0]">
              Bem-vindo, {regSuccess.user.name}!
            </h4>

            {/* Rank Soldier Badge */}
            <div className="p-3 rounded-2xl bg-[#07140F] border border-[#263B30] flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-left">
                <span className="text-2xl">🪖</span>
                <div>
                  <div className="text-[10px] text-[#A5B2A9] uppercase font-bold">Patente Inicial</div>
                  <div className="text-xs font-bold text-[#F5F5F0]">Soldado Patriota</div>
                </div>
              </div>
              <RankBadge rank="soldado" size="sm" />
            </div>

            {/* Temporary password box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#15291F] to-[#07140F] border-2 border-[#D4AF37] space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                <Key className="w-4 h-4" />
                Sua Senha Temporária
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="px-4 py-2 rounded-xl bg-[#07140F] border border-[#263B30] text-xl font-mono font-bold text-[#E8CC76] tracking-widest shadow-inner">
                  {regSuccess.tempPassword}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="p-2 rounded-xl bg-[#174D32] hover:bg-[#226B47] text-[#E8CC76] border border-[#D4AF37]/40 text-xs font-bold flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiada' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#A5B2A9] leading-tight">
                Gerada com os <strong>4 primeiros dígitos do seu CPF</strong> ({regSuccess.user.cpf}). Você pode alterá-la depois no seu perfil.
              </p>
            </div>

            <button
              onClick={handleFinishAndEnter}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-bold text-xs sm:text-sm shadow-md hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              <span>Entrar na Plataforma</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Tab switcher */}
            <div className="flex rounded-xl bg-[#0b1712] p-1 border border-[#263B30] mb-4 text-xs font-bold">
              <button
                onClick={() => { setTab('login'); setError(null); }}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                  tab === 'login' ? 'bg-[#174D32] text-[#E8CC76] shadow' : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                }`}
              >
                Entrar na Conta
              </button>
              <button
                onClick={() => { setTab('register'); setError(null); }}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                  tab === 'register' ? 'bg-[#174D32] text-[#E8CC76] shadow' : 'text-[#A5B2A9] hover:text-[#F5F5F0]'
                }`}
              >
                Cadastrar com CPF
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#2a1414] border border-[#D94B4B]/60 text-xs text-[#F5F5F0] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D94B4B] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* SOCIAL LOGIN PROMPT MODAL / STEP */}
            {socialPromptOpen ? (
              <form onSubmit={handleExecuteSocialLogin} className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-[#0b1712] border border-[#263B30] text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#15291F] border border-[#D4AF37]/40 flex items-center justify-center shadow-md">
                    {currentSocialProvider === 'Google' && (
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    {currentSocialProvider === 'Facebook' && (
                      <svg className="w-6 h-6 fill-[#1877F2]" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                    {currentSocialProvider === 'X' && (
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    )}
                    {currentSocialProvider === 'Apple' && (
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.57-.7 1.01-1.68.9-2.67-.88.04-1.93.59-2.55 1.32-.54.63-.99 1.63-.86 2.6.98.08 1.95-.53 2.51-1.25"/>
                      </svg>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[#F5F5F0]">
                    Entrar com {currentSocialProvider}
                  </h4>
                  <p className="text-[11px] text-[#A5B2A9]">
                    Autenticação integrada com sincronização no banco <strong>Neon PostgreSQL</strong>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                    Nome de Perfil
                  </label>
                  <input
                    type="text"
                    required
                    value={socialNameInput}
                    onChange={(e) => setSocialNameInput(e.target.value)}
                    placeholder="Seu Nome Completo"
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                    E-mail da sua Conta {currentSocialProvider}
                  </label>
                  <input
                    type="email"
                    required
                    value={socialEmailInput}
                    onChange={(e) => setSocialEmailInput(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setSocialPromptOpen(false); setError(null); }}
                    className="flex-1 py-2.5 rounded-xl bg-[#15291F] hover:bg-[#203a2c] text-[#A5B2A9] font-semibold text-xs border border-[#263B30] transition cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-bold text-xs shadow-md hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? 'Conectando ao Neon...' : `Entrar com ${currentSocialProvider}`}
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* SOCIAL LOGIN BUTTONS */}
                <div className="mb-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('Google')}
                    disabled={isLoading}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0b1712] hover:bg-[#15291F] border border-[#263B30] hover:border-[#D4AF37]/60 text-xs font-bold text-[#F5F5F0] transition flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continuar com o Google</span>
                    <span className="ml-auto text-[9px] text-[#D4AF37] font-semibold bg-[#174D32] px-1.5 py-0.5 rounded">1-Clique</span>
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSocialAuth('Facebook')}
                      disabled={isLoading}
                      className="py-2 px-2 rounded-xl bg-[#0b1712] hover:bg-[#15291F] border border-[#263B30] hover:border-[#1877F2]/50 text-[11px] font-semibold text-[#F5F5F0] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>Facebook</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialAuth('X')}
                      disabled={isLoading}
                      className="py-2 px-2 rounded-xl bg-[#0b1712] hover:bg-[#15291F] border border-[#263B30] hover:border-[#F5F5F0]/50 text-[11px] font-semibold text-[#F5F5F0] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>X / Twitter</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialAuth('Apple')}
                      disabled={isLoading}
                      className="py-2 px-2 rounded-xl bg-[#0b1712] hover:bg-[#15291F] border border-[#263B30] hover:border-white/50 text-[11px] font-semibold text-[#F5F5F0] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.57-.7 1.01-1.68.9-2.67-.88.04-1.93.59-2.55 1.32-.54.63-.99 1.63-.86 2.6.98.08 1.95-.53 2.51-1.25"/>
                      </svg>
                      <span>Apple</span>
                    </button>
                  </div>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-[#263B30]"></div>
                    <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-[#A5B2A9] tracking-wider">
                      Ou com login patriótico tradicional
                    </span>
                    <div className="flex-grow border-t border-[#263B30]"></div>
                  </div>
                </div>

                {/* LOGIN FORM */}
                {tab === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                        CPF, E-mail ou Nome de Usuário
                      </label>
                      <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="000.000.000-00 ou coronel_silva"
                      className="w-full bg-[#15291F] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] pl-9 pr-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#A5B2A9]">
                      Senha de Acesso
                    </label>
                    <span className="text-[10px] text-[#D4AF37]">
                      1º acesso: 4 primeiros dígitos do CPF
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#15291F] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] pl-9 pr-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-bold text-xs sm:text-sm shadow-md hover:brightness-110 transition disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {isLoading ? 'Autenticando...' : 'Entrar na Plataforma'}
                </button>

                {/* Quick test buttons for instant 1-click evaluation */}
                <div className="pt-3 mt-3 border-t border-[#263B30]">
                  <span className="block text-[10px] text-[#A5B2A9] text-center font-bold uppercase tracking-wider mb-2">
                    Acesso Rápido de Teste (Sem Digitar)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleQuickLoginAdmin}
                      className="p-2 rounded-xl bg-[#15291F] hover:bg-[#203a2c] border border-[#D4AF37]/40 text-[#E8CC76] text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Admin Oficial</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickLoginSilva}
                      className="p-2 rounded-xl bg-[#15291F] hover:bg-[#203a2c] border border-[#263B30] text-[#F5F5F0] text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Cidadão Patriota</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* REGISTER FORM WITH CPF */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                
                {/* CPF FIELD (PRIMARY) */}
                <div className="p-3 rounded-2xl bg-[#07140F] border border-[#263B30] space-y-1.5">
                  <label className="block text-xs font-bold text-[#E8CC76]">
                    CPF do Membro *
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                    <input
                      type="text"
                      required
                      value={regCpf}
                      onChange={handleCpfChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full bg-[#15291F] text-xs text-[#F5F5F0] font-mono placeholder-[#A5B2A9] pl-9 pr-3 py-2 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  
                  {/* Real-time temporary password indicator */}
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-[#A5B2A9]">Senha temporária gerada:</span>
                    <span className="font-mono font-bold text-[#E8CC76] bg-[#15291F] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                      {tempPasswordPreview} (4 dígitos)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={handleNameChange}
                    placeholder="Ex: Carlos Eduardo de Oliveira"
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                      Usuário (@) *
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="carlos_patriota"
                      className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                      Nascimento
                    </label>
                    <input
                      type="date"
                      value={regBirthDate}
                      onChange={(e) => setRegBirthDate(e.target.value)}
                      className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                    E-mail Válido *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu.email@dominio.com.br"
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                {/* Optional custom password */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCustomPassword(!showCustomPassword)}
                    className="text-[11px] text-[#D4AF37] hover:underline"
                  >
                    {showCustomPassword ? 'Usar apenas os 4 primeiros dígitos do CPF' : 'Deseja definir senha própria agora? (Opcional)'}
                  </button>
                  {showCustomPassword && (
                    <input
                      type="password"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      placeholder="Senha personalizada (opcional)"
                      className="w-full mt-1.5 bg-[#15291F] text-xs text-[#F5F5F0] p-2 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    />
                  )}
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 text-[11px] text-[#A5B2A9] cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 rounded text-[#D4AF37] focus:ring-0"
                    />
                    <span>
                      Declaro que concordo com os <strong>Termos de Uso</strong> e com a <strong>Política de Privacidade (LGPD)</strong> da Sociedade Bosonarista.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-bold text-xs sm:text-sm shadow-md hover:brightness-110 transition disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {isLoading ? 'Cadastrando...' : 'Finalizar Cadastro com CPF (Soldado)'}
                </button>
              </form>
            )}
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
};
