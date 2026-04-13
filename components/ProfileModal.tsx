
import React, { useState, useRef } from 'react';
import { X, User, Mail, Lock, Camera, LogOut, Check, Save, Upload } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  userAvatar: string;
  userPassword?: string;
  onUpdate: (updates: { name: string, email: string, password?: string, avatar?: string }) => void;
  onLogout: () => void;
  language: 'fr' | 'en';
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  userAvatar,
  userPassword,
  onUpdate,
  onLogout,
  language
}) => {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [password, setPassword] = useState(userPassword || '');
  const [avatar, setAvatar] = useState(userAvatar);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const translations = language === 'fr' ? {
    title: 'Mon Profil',
    nameLabel: 'Nom complet',
    emailLabel: 'Adresse e-mail',
    passwordLabel: 'Nouveau mot de passe',
    save: 'Enregistrer',
    logout: 'Se déconnecter',
    changePhoto: 'Changer la photo',
    success: 'Profil mis à jour !',
    uploadHint: 'Cliquez pour uploader'
  } : {
    title: 'My Profile',
    nameLabel: 'Full Name',
    emailLabel: 'Email Address',
    passwordLabel: 'New Password',
    save: 'Save Changes',
    logout: 'Sign Out',
    changePhoto: 'Change Photo',
    success: 'Profile updated!',
    uploadHint: 'Click to upload'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdate({ name, email, password, avatar });
      setIsSaving(false);
    }, 800);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'fr' ? "L'image est trop lourde (max 5MB)" : "Image is too large (max 5MB)");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100 dark:border-slate-800">
        <div className="p-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {translations.title}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group cursor-pointer" onClick={handleTriggerFileInput}>
                <div className="w-28 h-28 rounded-[36px] overflow-hidden border-4 border-blue-500/20 dark:border-blue-500/10 shadow-xl group-hover:scale-105 group-hover:border-blue-500/40 transition-all duration-300 relative">
                  <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                    <Upload size={24} className="text-white mb-1" />
                    <span className="text-[8px] font-black text-white uppercase tracking-tighter">{translations.uploadHint}</span>
                  </div>
                </div>
                <button 
                  type="button"
                  className="absolute -bottom-2 -right-2 w-11 h-11 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all border-4 border-white dark:border-slate-900"
                  title={translations.changePhoto}
                >
                  <Camera size={20} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  {translations.nameLabel}
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 font-bold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  {translations.emailLabel}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 font-bold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  {translations.passwordLabel}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 font-bold transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 space-y-4">
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-blue-600 text-white rounded-[24px] font-black text-sm shadow-xl shadow-blue-200 dark:shadow-blue-900/40 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={18} />
                    {translations.save}
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={onLogout}
                className="w-full py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-[24px] font-black text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <LogOut size={18} />
                {translations.logout}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
