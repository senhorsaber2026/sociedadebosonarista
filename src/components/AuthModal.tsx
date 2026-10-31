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
  const [currentSocialProvider, setCurrentSocialProvider] = useState<
    'Google' | 'Instagram' | 'WhatsApp' | 'Facebook' | 'X' | 'Telegram' | 'TikTok' | 'Apple'
  >('Google');
  const [socialEmailInput, setSocialEmailInput] = useState('');
  const [socialPasswordInput, setSocialPasswordInput] = useState('');
  const [socialNameInput, setSocialNameInput] = useState('');
  const [socialHandleInput, setSocialHandleInput] = useState('');
  const [registeredMember, setRegisteredMember] = useState<User | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const identifier = loginIdentifier.trim();
    const pass = loginPassword.trim();
    if (!identifier) {
      setError('Preencha seu CPF, e-mail ou nome de usuário.');
      return;
    }
    if (!pass) {
      setError('A senha de acesso é obrigatória para entrar.');
      return;
    }

    setIsLoading(true);

    // 1. Tenta login local primeiro
    let result = storageService.login(identifier, pass);

    // 2. Se não encontrou no local, valida com o servidor Neon DB
    if (!result.success) {
      const serverLogin = await storageService.loginWithRegisteredEmail(identifier, pass);
      if (serverLogin.success && serverLogin.user) {
        result = serverLogin;
      } else {
        result = { success: false, error: serverLogin.error || 'Senha incorreta para esta conta.' };
      }
    }
    setIsLoading(false);

    if (result.success && result.user) {
      showToast(`Bem-vindo de volta, ${result.user.name}!`);
      onSuccess();
      onClose();
    } else {
      setError(result.error || 'Senha incorreta ou usuário não encontrado.');
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

  const checkEmailStatus = async (emailToCheck: string) => {
    const clean = (emailToCheck || '').trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.') || clean.length < 5) {
      setRegisteredMember(null);
      return;
    }
    setCheckingEmail(true);
    try {
      const res = await storageService.checkMemberRegistered(clean);
      if (res.registered && res.user) {
        setRegisteredMember(res.user);
        if (res.user.name && !socialNameInput.trim()) {
          setSocialNameInput(res.user.name);
        }
        if (res.user.username && !socialHandleInput.trim()) {
          setSocialHandleInput('@' + res.user.username);
        }
      } else {
        setRegisteredMember(null);
      }
    } catch {
      setRegisteredMember(null);
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSocialAuth = (
    provider: 'Google' | 'Instagram' | 'WhatsApp' | 'Facebook' | 'X' | 'Telegram' | 'TikTok' | 'Apple'
  ) => {
    setCurrentSocialProvider(provider);
    setError(null);
    // Start with completely blank inputs so user enters their real data
    setSocialNameInput('');
    setSocialEmailInput('');
    setSocialPasswordInput('');
    setSocialHandleInput('');
    setRegisteredMember(null);
    setCheckingEmail(false);
    setSocialPromptOpen(true);
  };

  const handleExecuteSocialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = socialEmailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('O e-mail é obrigatório para cadastrar ou entrar. Informe um e-mail válido.');
      return;
    }

    const cleanPass = socialPasswordInput.trim();
    if (!cleanPass || cleanPass.length < 4) {
      setError(registeredMember
        ? 'A senha de acesso é obrigatória. Digite sua senha cadastrada.'
        : 'Crie uma senha de acesso com no mínimo 4 caracteres para proteger sua conta.');
      return;
    }

    const cleanName = socialNameInput.trim();
    if (!cleanName && !registeredMember) {
      setError('Por favor, informe seu nome completo.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // If already registered member in Neon DB, verify password before logging in!
      if (registeredMember) {
        const loginRes = await storageService.loginWithRegisteredEmail(registeredMember.email || cleanEmail, cleanPass);
        setIsLoading(false);
        if (loginRes.success && loginRes.user) {
          showToast(`Bem-vindo de volta, ${loginRes.user.name}! Conectado com sucesso com sua senha!`, 'success');
          setSocialPromptOpen(false);
          onSuccess();
          onClose();
          return;
        } else {
          setError(loginRes.error || 'Senha incorreta para esta conta. Acesso negado.');
          return;
        }
      }

      // New registration with password
      const result = await storageService.loginWithSocial({
        name: cleanName || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: cleanPass,
        socialHandle: socialHandleInput.trim() || undefined,
        provider: currentSocialProvider.toLowerCase(),
        providerId: `${currentSocialProvider.toLowerCase()}_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`
      });
      setIsLoading(false);
      if (result.success && result.user) {
        showToast(`Bem-vindo, ${result.user.name}! Cadastro protegido com senha e salvo no Neon DB!`, 'success');
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
              <button
                onClick={() => {
                  storageService.logout();
                  setError(null);
                  setSocialPromptOpen(false);
                  setTab('login');
                  showToast('Sessão encerrada. Agora você pode entrar com outra conta.');
                }}
                className="flex-1 py-2 rounded-lg transition cursor-pointer text-[#D94B4B] hover:bg-[#2a1414] hover:text-red-400"
                title="Encerrar sessão atual e entrar com outra conta (ex: outro Google)"
              >
                Trocar Conta
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
                    {currentSocialProvider === 'Instagram' && (
                      <svg className="w-6 h-6 fill-[#E1306C]" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    )}
                    {currentSocialProvider === 'WhatsApp' && (
                      <svg className="w-6 h-6 fill-[#25D366]" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.159.57 4.184 1.564 5.938l-1.564 5.714 5.86-1.536c1.677.915 3.597 1.434 5.64 1.434 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"/>
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
                    {currentSocialProvider === 'Telegram' && (
                      <svg className="w-6 h-6 fill-[#229ED9]" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    )}
                    {currentSocialProvider === 'TikTok' && (
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                    )}
                    {currentSocialProvider === 'Apple' && (
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.57-.7 1.01-1.68.9-2.67-.88.04-1.93.59-2.55 1.32-.54.63-.99 1.63-.86 2.6.98.08 1.95-.53 2.51-1.25"/>
                      </svg>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[#F5F5F0]">
                    {registeredMember ? `Entrar com ${currentSocialProvider}` : `Cadastrar e Entrar com ${currentSocialProvider}`}
                  </h4>
                  <p className="text-[11px] text-[#A5B2A9]">
                    Dados protegidos e integrados em tempo real no banco <strong>Neon PostgreSQL</strong>.
                  </p>
                </div>

                {/* STATUS: IF ALREADY REGISTERED OR CHECKING */}
                {checkingEmail ? (
                  <div className="p-3 rounded-xl bg-[#15291F] border border-[#263B30] text-xs text-[#A5B2A9] flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                    <span>Verificando se o e-mail já é cadastrado no Neon...</span>
                  </div>
                ) : registeredMember ? (
                  <div className="p-3.5 rounded-2xl bg-[#174D32]/90 border-2 border-[#D4AF37] text-left space-y-1 shadow-[0_0_15px_rgba(212,175,55,0.25)] animate-fade-in">
                    <div className="flex items-center gap-2 text-xs font-black text-[#E8CC76]">
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                      <span>MEMBRO OFICIAL JÁ CADASTRADO NO NEON!</span>
                    </div>
                    <div className="text-xs text-[#F5F5F0]">
                      <strong>Nome:</strong> {registeredMember.name}
                    </div>
                    <div className="text-xs text-[#A5B2A9]">
                      <strong>E-mail:</strong> <span className="font-mono text-[#E8CC76] font-bold">{registeredMember.email}</span>
                    </div>
                    <div className="text-[11px] text-[#34A853] font-bold pt-1 flex items-center gap-1">
                      <span>✓ Sua conta existe e está confirmada! Não precisa cadastrar de novo. Clique no botão dourado abaixo para entrar:</span>
                    </div>
                  </div>
                ) : socialEmailInput.trim() ? (
                  <div className="p-2.5 rounded-xl bg-[#15291F] border border-[#263B30] text-[11px] text-[#A5B2A9] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>Novo Membro: Preencha seu nome para finalizar seu cadastro com este e-mail.</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#0b1712] border border-[#263B30] text-[11px] text-[#E8CC76] flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>Digite seu e-mail abaixo para verificar seu acesso ou criar sua conta.</span>
                  </div>
                )}

                {/* EMAIL FIELD (PRIMARY & REQUIRED) */}
                <div>
                  <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                    Seu E-mail * (Obrigatório)
                  </label>
                  <input
                    type="email"
                    required
                    value={socialEmailInput}
                    onChange={(e) => {
                      setSocialEmailInput(e.target.value);
                      checkEmailStatus(e.target.value);
                    }}
                    placeholder="exemplo: seu_email@gmail.com"
                    className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none font-medium"
                  />
                </div>

                {/* PASSWORD FIELD (REQUIRED FOR SECURITY) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#A5B2A9]">
                      {registeredMember ? 'Senha de Acesso da Conta *' : 'Crie sua Senha de Acesso *'}
                    </label>
                    <span className="text-[10px] text-[#D4AF37]">
                      {registeredMember ? 'Confirma sua identidade' : 'Mínimo 4 caracteres'}
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
                    <input
                      type="password"
                      required
                      value={socialPasswordInput}
                      onChange={(e) => setSocialPasswordInput(e.target.value)}
                      placeholder={registeredMember ? 'Digite a senha da sua conta para entrar' : 'Crie uma senha de acesso'}
                      className="w-full bg-[#15291F] text-xs text-[#F5F5F0] placeholder-[#A5B2A9] pl-9 pr-3 py-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-[#A5B2A9] mt-1 flex items-center gap-1">
                    <span>🔒</span>
                    <span>Segurança ativa: Ninguém entra na sua conta sem digitar a sua senha.</span>
                  </p>
                </div>

                {/* NAME & HANDLE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required={!registeredMember}
                      value={socialNameInput}
                      onChange={(e) => setSocialNameInput(e.target.value)}
                      placeholder="Seu Nome Completo"
                      className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">
                      {currentSocialProvider === 'WhatsApp' ? 'WhatsApp' : `@Usuário (${currentSocialProvider})`}
                    </label>
                    <input
                      type="text"
                      value={socialHandleInput}
                      onChange={(e) => setSocialHandleInput(e.target.value)}
                      placeholder={currentSocialProvider === 'WhatsApp' ? '+55 61 99999-0000' : '@seu_usuario'}
                      className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
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
                    className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-black text-xs shadow-md hover:brightness-110 transition disabled:opacity-50 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isLoading ? 'Verificando...' : registeredMember ? `Entrar com Senha` : `Concluir Cadastro Seguro`}</span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* SOCIAL LOGIN BUTTONS */}
                <div className="mb-4 space-y-2">
                  {/* GOOGLE PRIMARY */}
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
                    <span className="ml-auto text-[9px] text-[#D4AF37] font-semibold bg-[#174D32] px-1.5 py-0.5 rounded">Rápido</span>
                  </button>

                  {/* INSTAGRAM & WHATSAPP */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSocialAuth('Instagram')}
                      disabled={isLoading}
                      className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-[#833ab4]/20 via-[#fd1d1d]/20 to-[#fcb045]/20 hover:from-[#833ab4]/30 hover:to-[#fcb045]/30 border border-[#E1306C]/40 text-xs font-semibold text-[#F5F5F0] transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-[#E1306C] shrink-0" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span>Instagram</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialAuth('WhatsApp')}
                      disabled={isLoading}
                      className="py-2 px-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-xs font-semibold text-[#F5F5F0] transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.159.57 4.184 1.564 5.938l-1.564 5.714 5.86-1.536c1.677.915 3.597 1.434 5.64 1.434 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {/* MORE SOCIALS (FACEBOOK, X, TELEGRAM, TIKTOK, APPLE) */}
                  <div className="grid grid-cols-5 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSocialAuth('Facebook')}
                      disabled={isLoading}
                      className="py-2 rounded-xl bg-[#0b1712] hover:bg-[#15291F] border border-[#263B30] hover:border-[#1877F2]/50 text-[10px] font-semibold text-[#F5F5F0] transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                      title="Entrar com Facebook"
                    >
                      <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="truncate w-full text-center">Face</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialAuth('X')}
                      disabled={isLoading}
                      className="py-2 rounded-xl bg-[#0b1712] hover:bg-[#15291F] border border-[#263B30] hover:border-white/50 text-[10px] font-semibold text-[#F5F5F0] transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                      title="Entrar com X (Twitter)"
                    >
                      <svg className="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>X</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialAuth('Telegram')}
                      disabled={isLoading}
                      className="py-2 rounded-xl bg-[#0b1712] hover:bg-[#15291F] border border-[#263B30] hover:border-[#229ED9]/50 text-[10px] font-semibold text-[#F5F5F0] transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                      title="Entrar com Telegram"
                    >
                      <svg className="w-3.5 h-3.5 fill-[#229ED9] shrink-0" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                      <span>Tele</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialAuth('TikTok')}
                      disabled={isLoading}
                      className="py-2 rounded-xl bg-[#0b1712] hover:bg-[#15291F] border border-[#263B30] hover:border-pink-500/50 text-[10px] font-semibold text-[#F5F5F0] transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                      title="Entrar com TikTok"
                    >
                      <svg className="w-3.5 h-3.5 fill-white shrink-0" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                      <span>TikTok</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialAuth('Apple')}
                      disabled={isLoading}
                      className="py-2 rounded-xl bg-[#0b1712] hover:bg-[#15291F] border border-[#263B30] hover:border-white/50 text-[10px] font-semibold text-[#F5F5F0] transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                      title="Entrar com Apple"
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
                        Senha de Acesso *
                      </label>
                      <span className="text-[10px] text-[#D4AF37]">
                        Obrigatória
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5B2A9]" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Digite a senha da sua conta"
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
