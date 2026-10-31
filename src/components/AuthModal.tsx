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

      </div>
    </div>
  );
};
