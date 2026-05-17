
import { Task, Bill } from '../types';
import { supabase } from './supabaseClient';

const LOCAL_KEYS = {
  USER: 'planify_current_user',
  SETTINGS: 'planify_settings_local'
};

const storage = {
  get: (key: string, defaultValue: any) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const mapUser = (supabaseUser: any) => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
    avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.avatar || `https://picsum.photos/seed/${supabaseUser.id}/100/100`,
    ical_urls: supabaseUser.user_metadata?.ical_urls || [],
    hidden_ical_events: supabaseUser.user_metadata?.hidden_ical_events || [],
    completed_ical_events: supabaseUser.user_metadata?.completed_ical_events || [],
    permanently_deleted_ical_events: supabaseUser.user_metadata?.permanently_deleted_ical_events || []
  };
};

export const DB = {
  checkConnection: async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from('tasks').select('id', { count: 'estimated', head: true }).limit(1);
      return !error;
    } catch {
      return false;
    }
  },

  login: async (emailInput: string, passwordInput: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInput.trim().toLowerCase(),
      password: passwordInput.trim()
    });
    
    if (error) {
      // Map Supabase errors to user-friendly messages
      if (error.message === 'Invalid login credentials') {
        throw new Error('EMAIL_OR_PASSWORD_INCORRECT');
      }
      if (error.message === 'Email not confirmed') {
        throw new Error('EMAIL_NOT_CONFIRMED');
      }
      throw error;
    }

    if (!data.session) {
      throw new Error('EMAIL_NOT_CONFIRMED');
    }
    
    const user = mapUser(data.user);
    
    storage.set(LOCAL_KEYS.USER, user);
    return user;
  },

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  },

  signup: async (name: string, emailInput: string, passwordInput: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: emailInput.trim().toLowerCase(),
      password: passwordInput.trim(),
      options: {
        data: {
          name: name.trim(),
          avatar: `https://picsum.photos/seed/${emailInput}/100/100`
        }
      }
    });
    
    if (error) {
      if (error.message?.includes('rate limit')) {
        throw new Error('RATE_LIMITED');
      }
      if (error.message?.includes('already registered')) {
        throw new Error('EMAIL_ALREADY_USED');
      }
      throw error;
    }
    if (!data.user) throw new Error('Signup failed');

    // If email confirmation is required, Supabase returns a user but no session
    if (!data.session) {
      throw new Error('EMAIL_NOT_CONFIRMED');
    }
    
    const user = mapUser(data.user);
    if (name) user.name = name.trim();
    
    // Also initialize settings in DB
    try {
      await supabase.from('settings').insert([{ user_id: data.user.id }]);
    } catch (e) {
      console.warn('Settings init failed (may already exist):', e);
    }
    
    storage.set(LOCAL_KEYS.USER, user);
    return user;
  },

  logout: async () => {
    await supabase.auth.signOut();
    storage.set(LOCAL_KEYS.USER, null);
  },

  getCurrentUser: () => {
    return storage.get(LOCAL_KEYS.USER, null);
  },

  updateUser: async (updates: { name?: string; password?: string; avatar?: string; ical_urls?: any[]; hidden_ical_events?: string[]; completed_ical_events?: string[]; permanently_deleted_ical_events?: string[] }) => {
    const payload: any = {};
    if (updates.password) payload.password = updates.password;
    if (updates.name || updates.avatar || updates.ical_urls !== undefined || updates.hidden_ical_events !== undefined || updates.completed_ical_events !== undefined || updates.permanently_deleted_ical_events !== undefined) {
      payload.data = {};
      if (updates.name) payload.data.name = updates.name.trim();
      if (updates.avatar) payload.data.avatar = updates.avatar;
      if (updates.ical_urls !== undefined) payload.data.ical_urls = updates.ical_urls;
      if (updates.hidden_ical_events !== undefined) payload.data.hidden_ical_events = updates.hidden_ical_events;
      if (updates.completed_ical_events !== undefined) payload.data.completed_ical_events = updates.completed_ical_events;
      if (updates.permanently_deleted_ical_events !== undefined) payload.data.permanently_deleted_ical_events = updates.permanently_deleted_ical_events;
    }
    
    const { data, error } = await supabase.auth.updateUser(payload);
    if (error) throw error;
    
    if (!data.user) return null;
    
    const user = mapUser(data.user);
    
    storage.set(LOCAL_KEYS.USER, user);
    return user;
  },

  getTasks: async (userId: string, deleted = false): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', deleted);
      
    if (error) return [];
    
    return (data || []).map(row => ({
      ...row,
      location: row.location_name ? {
        name: row.location_name,
        address: row.location_address,
        url: row.location_url
      } : undefined
    }));
  },

  addTask: async (userId: string, task: Task) => {
    const payload: any = {
      id: task.id,
      user_id: userId,
      title: task.title,
      date: task.date,
      time: task.time,
      type: task.type,
      status: task.status,
      color: task.color,
      reminder: task.reminder || null,
    };
    
    if (task.location) {
      payload.location_name = task.location.name;
      payload.location_address = task.location.address;
      payload.location_url = task.location.url;
    }
    
    const { error } = await supabase.from('tasks').insert([payload]);
    if (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  updateTask: async (userId: string, id: string, updates: Partial<Task>) => {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.date !== undefined) payload.date = updates.date;
    if (updates.time !== undefined) payload.time = updates.time;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.reminder !== undefined) payload.reminder = updates.reminder || null;
    
    if (updates.location !== undefined) {
      if (updates.location) {
        payload.location_name = updates.location.name;
        payload.location_address = updates.location.address;
        payload.location_url = updates.location.url;
      } else {
        payload.location_name = null;
        payload.location_address = null;
        payload.location_url = null;
      }
    }
    
    const { error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  deleteTask: async (userId: string, id: string, permanent = false) => {
    if (permanent) {
      await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId);
    } else {
      await supabase.from('tasks').update({ is_deleted: true }).eq('id', id).eq('user_id', userId);
    }
  },

  getBills: async (userId: string, deleted = false): Promise<Bill[]> => {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', deleted);
      
    if (error) return [];
    return (data || []).map(row => ({
      ...row,
      dueDate: row.duedate
    }));
  },

  addBill: async (userId: string, bill: Bill) => {
    const payload = {
      id: bill.id,
      user_id: userId,
      name: bill.name,
      amount: bill.amount,
      duedate: bill.dueDate,
      status: bill.status,
      category: bill.category,
      reminder: bill.reminder || null
    };
    
    const { error } = await supabase.from('bills').insert([payload]);
    if (error) {
      console.error('Error adding bill:', error);
      throw error;
    }
  },

  updateBill: async (userId: string, id: string, updates: Partial<Bill>) => {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.dueDate !== undefined) payload.duedate = updates.dueDate;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.reminder !== undefined) payload.reminder = updates.reminder || null;
    
    const { error } = await supabase
      .from('bills')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      console.error('Error updating bill:', error);
      throw error;
    }
  },

  deleteBill: async (userId: string, id: string, permanent = false) => {
    if (permanent) {
      await supabase.from('bills').delete().eq('id', id).eq('user_id', userId);
    } else {
      await supabase.from('bills').update({ is_deleted: true }).eq('id', id).eq('user_id', userId);
    }
  },

  getSettings: async (userId: string) => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error || !data) {
      return storage.get(`${LOCAL_KEYS.SETTINGS}_${userId}`, { darkMode: false, language: 'fr', timeFormat: '24h' });
    }
    return data;
  },

  saveSettings: async (userId: string, settings: any) => {
    storage.set(`${LOCAL_KEYS.SETTINGS}_${userId}`, settings);
    await supabase.from('settings').upsert({ user_id: userId, ...settings });
  },

  handleAuthChange: (session: any) => {
    if (session?.user) {
      const user = mapUser(session.user);
      storage.set(LOCAL_KEYS.USER, user);
      return user;
    }
    return null;
  }
};
