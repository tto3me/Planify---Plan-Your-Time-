
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
    
    const user = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
      avatar: data.user.user_metadata?.avatar || `https://picsum.photos/seed/${data.user.id}/100/100`,
      ical_urls: data.user.user_metadata?.ical_urls || []
    };
    
    storage.set(LOCAL_KEYS.USER, user);
    return user;
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
    
    const user = {
      id: data.user.id,
      email: data.user.email,
      name: name.trim(),
      avatar: data.user.user_metadata?.avatar,
      ical_urls: data.user.user_metadata?.ical_urls || []
    };
    
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

  updateUser: async (updates: { name?: string; password?: string; avatar?: string; ical_urls?: string[] }) => {
    const payload: any = {};
    if (updates.password) payload.password = updates.password;
    if (updates.name || updates.avatar || updates.ical_urls !== undefined) {
      payload.data = {};
      if (updates.name) payload.data.name = updates.name.trim();
      if (updates.avatar) payload.data.avatar = updates.avatar;
      if (updates.ical_urls !== undefined) payload.data.ical_urls = updates.ical_urls;
    }
    
    const { data, error } = await supabase.auth.updateUser(payload);
    if (error) throw error;
    
    if (!data.user) return null;
    
    const user = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
      avatar: data.user.user_metadata?.avatar || `https://picsum.photos/seed/${data.user.id}/100/100`,
      ical_urls: data.user.user_metadata?.ical_urls || []
    };
    
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
      ...task,
      user_id: userId
    };
    
    if (task.location) {
      payload.location_name = task.location.name;
      payload.location_address = task.location.address;
      payload.location_url = task.location.url;
      delete payload.location;
    }
    
    const { error } = await supabase.from('tasks').insert([payload]);
    if (error) console.error('Error adding task:', error);
  },

  updateTask: async (userId: string, id: string, updates: Partial<Task>) => {
    const payload: any = { ...updates };
    
    if (updates.location) {
      payload.location_name = updates.location.name;
      payload.location_address = updates.location.address;
      payload.location_url = updates.location.url;
      delete payload.location;
    }
    
    const { error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) console.error('Error updating task:', error);
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
    return data || [];
  },

  addBill: async (userId: string, bill: Bill) => {
    const { error } = await supabase.from('bills').insert([{ ...bill, user_id: userId }]);
    if (error) console.error('Error adding bill:', error);
  },

  updateBill: async (userId: string, id: string, updates: Partial<Bill>) => {
    const { error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId);
    if (error) console.error('Error updating bill:', error);
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
  }
};
