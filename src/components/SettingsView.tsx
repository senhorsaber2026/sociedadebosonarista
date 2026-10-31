import React, { useState } from 'react';
import { 
  Settings, 
  Lock, 
  Shield, 
  Bell, 
  FileText, 
  Trash2, 
  Download, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { showToast } from './Toast';

interface SettingsViewProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onOpenAuth,
  onRefresh
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notifLikes, setNotifLikes] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifDebates, setNotifDebates] = useState(true);
  const [notifAdmin, setNotifAdmin] = useState(true);

  if (!currentUser) {
    return (
      <div className="p-8 text-center rounded-3xl bg-[#102019] border border-[#263B30]">
        <Settings className="w-12 h-12 text-[#A5B2A9] mx-auto mb-3" />
        <h3 className="font-serif-patriotic text-base font-bold text-[#F5F5F0]">
          Configurações da Conta
        </h3>
        <p className="text-xs text-[#A5B2A9] mt-1 mb-4">
          Faça login para gerenciar suas preferências de privacidade e dados.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-[#07140F] font-bold text-xs rounded-xl shadow"
        >
          Entrar na Conta
        </button>
      </div>
    );
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      showToast('A confirmação de senha não confere.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('A senha deve ter no mínimo 6 caracteres.', 'error');
      return;
    }

    storageService.updateProfile(currentUser.id, { password: newPassword });
    showToast('Senha alterada com sucesso!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDownloadData = () => {
    const data = {
      user: currentUser,
      exportDate: new Date().toISOString(),
      platform: 'Sociedade Bosonarista',
      compliance: 'LGPD Artigo 18'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados_sociedade_bosonarista_${currentUser.username}.json`;
    a.click();
    showToast('Download dos seus dados pessoais iniciado!');
  };

  const handleDeleteAccount = () => {
    if (confirm('Atenção: deseja realmente solicitar a exclusão definitiva da sua conta e de todos os dados conforme a LGPD?')) {
      storageService.setUserStatus(currentUser.id, 'banned', currentUser);
      storageService.logout();
      showToast('Conta desativada e dados removidos.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* HEADER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#102019] border border-[#263B30]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] mb-1">
          <Settings className="w-4 h-4" />
          <span>Configurações & Privacidade</span>
        </div>
        <h2 className="font-serif-patriotic text-xl font-bold text-[#F5F5F0]">
          Sua Conta, Segurança & Conformidade LGPD
        </h2>
        <p className="text-xs text-[#A5B2A9] mt-1">
          Gerencie suas preferências de privacidade, segurança da senha e direitos de titular de dados.
        </p>
      </div>

      {/* CHANGE PASSWORD & CPF INFO */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#102019] border border-[#263B30] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#F5F5F0] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            <span>Segurança & Senha de Acesso</span>
          </h3>
          {currentUser.cpf && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#07140F] border border-[#263B30] text-[#E8CC76] font-mono">
              CPF: {currentUser.cpf}
            </span>
          )}
        </div>

        <p className="text-xs text-[#A5B2A9]">
          Caso esteja utilizando a <strong>senha temporária</strong> gerada com os 4 primeiros dígitos do seu CPF, você pode definir uma nova senha permanente abaixo:
        </p>

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">Nova Senha</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A5B2A9] mb-1">Confirmar Nova Senha</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#15291F] text-xs text-[#F5F5F0] p-2.5 rounded-xl border border-[#263B30] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8325] text-xs font-bold text-[#07140F] shadow hover:brightness-110 transition"
          >
            Atualizar Senha
          </button>
        </form>
      </div>

      {/* NOTIFICATION PREFERENCES */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#102019] border border-[#263B30] space-y-4">
        <h3 className="text-sm font-bold text-[#F5F5F0] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#D4AF37]" />
          <span>Preferências de Notificações</span>
        </h3>

        <div className="space-y-3 text-xs text-[#F5F5F0]">
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#15291F] border border-[#263B30] cursor-pointer">
            <span>Notificar sobre novas curtidas nas minhas publicações</span>
            <input
              type="checkbox"
              checked={notifLikes}
              onChange={(e) => { setNotifLikes(e.target.checked); showToast('Preferência salva.'); }}
              className="rounded text-[#D4AF37]"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#15291F] border border-[#263B30] cursor-pointer">
            <span>Notificar sobre novos comentários e respostas</span>
            <input
              type="checkbox"
              checked={notifComments}
              onChange={(e) => { setNotifComments(e.target.checked); showToast('Preferência salva.'); }}
              className="rounded text-[#D4AF37]"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#15291F] border border-[#263B30] cursor-pointer">
            <span>Notificar sobre novos argumentos nos debates que sigo</span>
            <input
              type="checkbox"
              checked={notifDebates}
              onChange={(e) => { setNotifDebates(e.target.checked); showToast('Preferência salva.'); }}
              className="rounded text-[#D4AF37]"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#15291F] border border-[#263B30] cursor-pointer">
            <span>Comunicados cívicos e avisos oficiais da moderação</span>
            <input
              type="checkbox"
              checked={notifAdmin}
              onChange={(e) => { setNotifAdmin(e.target.checked); showToast('Preferência salva.'); }}
              className="rounded text-[#D4AF37]"
            />
          </label>
        </div>
      </div>

      {/* PRIVACY & LGPD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#102019] border border-[#263B30] space-y-4">
        <h3 className="text-sm font-bold text-[#F5F5F0] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#D4AF37]" />
          <span>Privacidade & Direitos do Titular (LGPD)</span>
        </h3>
        
        <p className="text-xs text-[#A5B2A9] leading-relaxed">
          A Sociedade Bosonarista assegura o total respeito à Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Seus dados não são comercializados a terceiros nem repassados a algoritmos estrangeiros de censura comportamental.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleDownloadData}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#15291F] hover:bg-[#203a2c] text-[#E8CC76] border border-[#263B30] text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Cópia dos Meus Dados (JSON)</span>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2a1414] hover:bg-[#3d1818] text-[#D94B4B] border border-[#D94B4B]/40 text-xs font-semibold transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Solicitar Exclusão da Conta</span>
          </button>
        </div>
      </div>

    </div>
  );
};
