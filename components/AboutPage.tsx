
import React from 'react';
import { TEAM_MEMBERS } from '../constants';
import { ShieldCheck, Zap, Globe, Github, Database, Cpu, Sparkles } from 'lucide-react';

interface AboutPageProps {
  language: 'fr' | 'en';
}

const AboutPage: React.FC<AboutPageProps> = ({ language }) => {
  const translations = language === 'fr' ? {
    title: "À propos de Planify",
    subtitle: "Découvrez l'équipe et la vision derrière votre assistant quotidien.",
    visionTitle: "Notre Vision",
    visionText: "Planify est né d'une volonté de simplifier la vie numérique. Nous croyons qu'une organisation claire réduit le stress et libère la créativité. Notre mission est de centraliser toutes vos obligations — tâches, cours, réunions et finances — dans une interface unique, fluide et intelligente.",
    teamTitle: "L'Équipe du Projet",
    teamSubtitle: "Les talents qui ont donné vie à Planify.",
    techTitle: "Technologies Utilisées",
    featuresTitle: "Pourquoi Planify ?",
    features: [
      { title: "Centralisation", desc: "Tout votre planning et vos finances au même endroit.", icon: <Zap size={24} /> },
      { title: "Mode Hors-ligne", desc: "Synchronisation intelligente avec MySQL ou stockage local.", icon: <Database size={24} /> },
      { title: "IA Native", desc: "Assistant intelligent propulsé par Gemini 2.5 Flash.", icon: <Sparkles size={24} /> },
      { title: "Sécurité", desc: "Données protégées et interface AES-256.", icon: <ShieldCheck size={24} /> }
    ]
  } : {
    title: "About Planify",
    subtitle: "Discover the team and the vision behind your daily assistant.",
    visionTitle: "Our Vision",
    visionText: "Planify was born from a desire to simplify digital life. We believe that clear organization reduces stress and unlocks creativity. Our mission is to centralize all your obligations — tasks, courses, meetings, and finances — into a single, fluid, and intelligent interface.",
    teamTitle: "Project Team",
    teamSubtitle: "The talents who brought Planify to life.",
    techTitle: "Tech Stack",
    featuresTitle: "Why Planify?",
    features: [
      { title: "Centralization", desc: "All your schedule and finances in one place.", icon: <Zap size={24} /> },
      { title: "Offline Mode", desc: "Smart sync with MySQL or local storage fallback.", icon: <Database size={24} /> },
      { title: "Native AI", desc: "Smart assistant powered by Gemini 2.5 Flash.", icon: <Sparkles size={24} /> },
      { title: "Security", desc: "Protected data and AES-256 interface.", icon: <ShieldCheck size={24} /> }
    ]
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-16 animate-in fade-in duration-700 pb-24 lg:pb-12">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors">
          {translations.title}
        </h2>
        <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
          {translations.subtitle}
        </p>
      </section>

      {/* Vision & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-black uppercase tracking-widest">
            <Globe size={14} /> Mission
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{translations.visionTitle}</h3>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed italic">
            "{translations.visionText}"
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {translations.features.map((f, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-blue-600 dark:text-blue-400 w-fit mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{f.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Gallery */}
      <section className="space-y-8">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{translations.teamTitle}</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{translations.teamSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM_MEMBERS.map((member) => (
            <div key={member.id} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-slate-50 dark:border-slate-800 group-hover:border-blue-500/20 transition-colors">
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-none mb-1">{member.name}</h4>
                <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Github size={14} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
                  <Globe size={14} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Footer */}
      <section className="pt-16 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-6">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
          {translations.techTitle}
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-2"><Cpu size={24} /> <span className="font-bold">React 19</span></div>
          <div className="flex items-center gap-2"><Globe size={24} /> <span className="font-bold">Tailwind CSS</span></div>
          <div className="flex items-center gap-2"><Database size={24} /> <span className="font-bold">MySQL 8.0</span></div>
          <div className="flex items-center gap-2"><Sparkles size={24} /> <span className="font-bold">Gemini 2.5</span></div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
