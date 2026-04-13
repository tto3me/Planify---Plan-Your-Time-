
import React from 'react';
import { Task, Bill, TeamMember } from './types';
import { LayoutDashboard, Calendar, BookOpen, Wallet, Bell, Trash2, Info } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'calendar', label: 'Calendrier', icon: <Calendar size={20} /> },
  { id: 'courses', label: 'Cours', icon: <BookOpen size={20} /> },
  { id: 'finances', label: 'Finances', icon: <Wallet size={20} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
  { id: 'trash', label: 'Corbeille', icon: <Trash2 size={20} /> },
  { id: 'about', label: 'À propos', icon: <Info size={20} /> },
];

export const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Ryan OUNI', role: 'Chef de projet', avatar: 'https://picsum.photos/seed/ryan/100/100' },
  { id: '2', name: 'Ousman JAWNEH', role: 'Développeur Front', avatar: 'https://picsum.photos/seed/ousman/100/100' },
  { id: '3', name: 'Ahmed JAZIRI', role: 'Développeur Front', avatar: 'https://picsum.photos/seed/ahmed/100/100' },
  { id: '4', name: 'Hugo VIEIRA', role: 'Développeur Front', avatar: 'https://picsum.photos/seed/hugo/100/100' },
  { id: '5', name: 'Anthony NASR', role: 'Développeur Back', avatar: 'https://picsum.photos/seed/anthony/100/100' },
  { id: '6', name: 'Tohme TOHME', role: 'Développeur Back', avatar: 'https://picsum.photos/seed/tohme/100/100' },
];

const today = new Date().toISOString().split('T')[0];

export const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Réunion Mentor (Alkasm Sulaf)', date: today, time: '10:00 - 11:30', type: 'Meeting', status: 'completed', color: 'blue' },
  { id: '2', title: 'Développement Front-end Dashboard', date: today, time: '13:00 - 15:00', type: 'Task', status: 'in-progress', color: 'green' },
  { id: '3', title: 'Cours de Mathématiques (S3)', date: today, time: '15:30 - 17:30', type: 'Course', status: 'todo', color: 'purple' },
  { id: '4', title: 'Intégration base de données MySQL', date: today, time: '18:00 - 19:30', type: 'Task', status: 'todo', color: 'orange' },
];

export const PENDING_BILLS: Bill[] = [
  { id: 'b1', name: 'Netflix', amount: 15.99, dueDate: '2025-01-25', status: 'pending', category: 'subscription' },
  { id: 'b2', name: 'Facture Électricité', amount: 84.50, dueDate: '2025-02-01', status: 'pending', category: 'invoice' },
  { id: 'b3', name: 'Spotify Premium', amount: 9.99, dueDate: '2025-02-10', status: 'pending', category: 'subscription' },
];
