
import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2, HardDrive, Cloud, ShieldCheck, Globe, Check } from 'lucide-react';
import { DB } from '../services/db';
import Logo from './Logo';

interface AuthPageProps {
  onLogin: (user: any) => void;
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, language, setLanguage }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isServerUp, setIsServerUp] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const checkSvr = async () => {
      const up = await DB.checkConnection();
      setIsServerUp(up);
    };
    checkSvr();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let user;
      if (isSignIn) {
        user = await DB.login(email, password);
      } else {
        user = await DB.signup(name, email, password);
      }
      onLogin(user);
    } catch (err: any) {
      const code = err.message || '';
      const messages: Record<string, { fr: string; en: string }> = {
        'EMAIL_OR_PASSWORD_INCORRECT': {
          fr: 'Email ou mot de passe incorrect. Vérifiez vos identifiants ou créez un compte.',
          en: 'Incorrect email or password. Please check your credentials or create an account.'
        },
        'EMAIL_NOT_CONFIRMED': {
          fr: 'Votre email n\'est pas confirmé. Veuillez vérifier votre boîte de réception ou demander à l\'administrateur de désactiver la confirmation par email.',
          en: 'Your email is not confirmed. Please check your inbox or ask the admin to disable email confirmation in Supabase.'
        },
        'RATE_LIMITED': {
          fr: 'Trop de tentatives. Veuillez réessayer dans quelques minutes.',
          en: 'Too many attempts. Please try again in a few minutes.'
        },
        'EMAIL_ALREADY_USED': {
          fr: 'Cet email est déjà utilisé. Essayez de vous connecter.',
          en: 'This email is already in use. Try signing in instead.'
        }
      };
      const msg = messages[code];
      setError(msg ? msg[language] : (code || (language === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.')));
    } finally {
      setIsLoading(false);
    }
  };

  const translations = language === 'fr' ? {
    welcome: "Planify Connect",
    subtitle: "Accédez à votre planning intelligent.",
    signIn: "Connexion",
    signUp: "Créer un compte",
    cta: "Commencer",
    error: "Identifiants incorrects",
    localMode: "Mode Local Activé",
    cloudMode: "Prêt pour le Cloud",
    namePlaceholder: "Ryan Ouni",
    nameLabel: "Nom complet",
    emailPlaceholder: "contact@planify.io",
    emailLabel: "Email",
    passwordLabel: "Mot de passe",
    securedBy: "Sécurisé par Planify AES-256"
  } : {
    welcome: "Planify Connect",
    subtitle: "Access your smart schedule.",
    signIn: "Sign In",
    signUp: "Sign Up",
    cta: "Get Started",
    error: "Invalid credentials",
    localMode: "Local Mode Enabled",
    cloudMode: "Cloud Ready",
    namePlaceholder: "John Doe",
    nameLabel: "Full Name",
    emailPlaceholder: "contact@planify.io",
    emailLabel: "Email",
    passwordLabel: "Password",
    securedBy: "Secured by Planify AES-256"
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 p-10 relative">
        
        {/* Language Switcher */}
        <div className="absolute top-6 right-6 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
          <button 
            onClick={() => setLanguage('fr')}
            className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 ${language === 'fr' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {language === 'fr' && <Check size={10} />} FR
          </button>
          <button 
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 ${language === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {language === 'en' && <Check size={10} />} EN
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <Logo size="lg" className="mb-4" />
            <div className={`absolute -right-2 top-14 p-1.5 rounded-lg border-2 border-white dark:border-slate-900 ${isServerUp ? 'bg-green-500' : 'bg-orange-500'} text-white shadow-md animate-pulse`}>
              {isServerUp ? <Cloud size={12} /> : <HardDrive size={12} />}
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Planify</h1>
          <p className="text-slate-500 text-sm font-medium">{translations.subtitle}</p>
          <span className={`mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isServerUp ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'}`}>
            {isServerUp ? translations.cloudMode : translations.localMode}
          </span>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-8">
          <button onClick={() => { setIsSignIn(true); setError(''); }} className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${isSignIn ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>{translations.signIn}</button>
          <button onClick={() => { setIsSignIn(false); setError(''); }} className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${!isSignIn ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>{translations.signUp}</button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <AlertCircle size={16} className="shrink-0" /> <span className="leading-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSignIn && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{translations.nameLabel}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold" 
                  placeholder={translations.namePlaceholder} 
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{translations.emailLabel}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required 
                value={email} 
                autoCapitalize="none"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold" 
                placeholder={translations.emailPlaceholder} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{translations.passwordLabel}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                required 
                value={password} 
                autoComplete={isSignIn ? "current-password" : "new-password"}
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            disabled={isLoading} 
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 group hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95 mt-4"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>{isSignIn ? translations.signIn : translations.signUp} <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-white dark:bg-slate-900 px-4 text-slate-400">
                {language === 'fr' ? 'Ou continuer avec' : 'Or continue with'}
              </span>
            </div>
          </div>

          <button 
            onClick={() => DB.signInWithGoogle()}
            className="w-full py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl font-black text-sm shadow-sm flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                className="fill-[#4285F4]"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                className="fill-[#34A853]"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                className="fill-[#FBBC05]"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                className="fill-[#EA4335]"
              />
            </svg>
            Google
          </button>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4 opacity-50">
          <ShieldCheck size={20} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{translations.securedBy}</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
