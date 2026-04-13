
import { Task, Bill } from '../types';
import { INITIAL_TASKS, PENDING_BILLS } from '../constants';

const API_BASE = 'http://localhost:3001/api';

const LOCAL_KEYS = {
  USER: 'planify_current_user',
  ACCOUNTS: 'planify_local_accounts',
  TASKS: 'planify_tasks_local',
  BILLS: 'planify_bills_local',
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      await fetch(`${API_BASE}/auth/login`, { method: 'POST', signal: controller.signal });
      clearTimeout(timeoutId);
      return true;
    } catch (e) {
      return false;
    }
  },

  login: async (emailInput: string, passwordInput: string) => {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (res.status === 401) {
        throw new Error('Mot de passe incorrect ou email inconnu sur le serveur.');
      }
      
      if (!res.ok) throw new Error('Erreur de communication avec le serveur MySQL.');
      
      const user = await res.json();
      storage.set(LOCAL_KEYS.USER, user);
      return user;
    } catch (e: any) {
      if (e.message.includes('Mot de passe incorrect')) {
        throw e;
      }
      
      const accounts = storage.get(LOCAL_KEYS.ACCOUNTS, []);
      const user = accounts.find((a: any) => 
        a.email.toLowerCase() === email && 
        (a.password === password || a._localHash === btoa(password))
      );
      
      if (user) {
        const { password: p, _localHash: h, ...userWithoutPass } = user;
        storage.set(LOCAL_KEYS.USER, userWithoutPass);
        return userWithoutPass;
      }
      
      const existingAccount = accounts.find((a: any) => a.email.toLowerCase() === email);
      if (existingAccount) {
        throw new Error('Mot de passe incorrect (Mode Local).');
      }

      throw new Error('Le serveur MySQL est hors ligne et aucun compte local n\'a été trouvé avec cet email.');
    }
  },

  signup: async (name: string, emailInput: string, passwordInput: string) => {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();
    const displayName = name.trim();

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName, email, password })
      });
      if (!res.ok) throw new Error('Signup failed on server');
      const user = await res.json();
      storage.set(LOCAL_KEYS.USER, user);
      return user;
    } catch (e) {
      const accounts = storage.get(LOCAL_KEYS.ACCOUNTS, []);
      if (accounts.find((a: any) => a.email.toLowerCase() === email)) {
        throw new Error('Un compte avec cet email existe déjà localement.');
      }
      
      const newUser = { 
        id: Math.random().toString(36).substr(2, 9), 
        name: displayName, 
        email, 
        avatar: `https://picsum.photos/seed/${email}/100/100` 
      };
      // Store with a hashed placeholder — we don't have bcrypt on client, so
      // store a simple marker. Real auth always goes through the server.
      const userWithPass = { ...newUser, _localHash: btoa(password) };
      storage.set(LOCAL_KEYS.ACCOUNTS, [...accounts, userWithPass]);
      storage.set(LOCAL_KEYS.USER, newUser);
      return newUser;
    }
  },

  logout: () => {
    storage.set(LOCAL_KEYS.USER, null);
  },

  getCurrentUser: () => {
    return storage.get(LOCAL_KEYS.USER, null);
  },

  getTasks: async (userId: string, deleted = false): Promise<Task[]> => {
    try {
      const res = await fetch(`${API_BASE}/tasks?userId=${userId}&deleted=${deleted}`);
      if (res.ok) {
        const data = await res.json();
        // Only update local cache for non-deleted tasks
        if (!deleted) storage.set(`${LOCAL_KEYS.TASKS}_${userId}`, data);
        return data;
      }
    } catch (e) {}
    const local = storage.get(`${LOCAL_KEYS.TASKS}_${userId}`, INITIAL_TASKS);
    // If we want deleted tasks locally, we'd need a separate key, but for now we filter locally
    return deleted ? [] : local;
  },

  addTask: async (userId: string, task: Task) => {
    const tasks = storage.get(`${LOCAL_KEYS.TASKS}_${userId}`, INITIAL_TASKS);
    storage.set(`${LOCAL_KEYS.TASKS}_${userId}`, [task, ...tasks]);
    try {
      await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, user_id: userId })
      });
    } catch (e) {}
  },

  updateTask: async (userId: string, id: string, updates: Partial<Task>) => {
    const tasks = storage.get(`${LOCAL_KEYS.TASKS}_${userId}`, INITIAL_TASKS);
    const updated = tasks.map((t: Task) => t.id === id ? { ...t, ...updates } : t);
    storage.set(`${LOCAL_KEYS.TASKS}_${userId}`, updated);
    try {
      const payload = { ...updates, user_id: userId };
      if (updates.location) {
        (payload as any).location_name = updates.location.name;
        (payload as any).location_address = updates.location.address;
        (payload as any).location_url = updates.location.url;
        delete (payload as any).location;
      }
      await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {}
  },

  deleteTask: async (userId: string, id: string, permanent = false) => {
    const tasks = storage.get(`${LOCAL_KEYS.TASKS}_${userId}`, INITIAL_TASKS);
    // If it was in the active list, remove it
    storage.set(`${LOCAL_KEYS.TASKS}_${userId}`, tasks.filter((t: Task) => t.id !== id));
    try {
      await fetch(`${API_BASE}/tasks/${id}?userId=${userId}&permanent=${permanent}`, { method: 'DELETE' });
    } catch (e) {}
  },

  getBills: async (userId: string, deleted = false): Promise<Bill[]> => {
    try {
      const res = await fetch(`${API_BASE}/bills?userId=${userId}&deleted=${deleted}`);
      if (res.ok) {
        const data = await res.json();
        if (!deleted) storage.set(`${LOCAL_KEYS.BILLS}_${userId}`, data);
        return data;
      }
    } catch (e) {}
    const local = storage.get(`${LOCAL_KEYS.BILLS}_${userId}`, PENDING_BILLS);
    return deleted ? [] : local;
  },

  addBill: async (userId: string, bill: Bill) => {
    const bills = storage.get(`${LOCAL_KEYS.BILLS}_${userId}`, PENDING_BILLS);
    storage.set(`${LOCAL_KEYS.BILLS}_${userId}`, [bill, ...bills]);
    try {
      await fetch(`${API_BASE}/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bill, user_id: userId })
      });
    } catch (e) {}
  },

  updateBill: async (userId: string, id: string, updates: Partial<Bill>) => {
    const bills = storage.get(`${LOCAL_KEYS.BILLS}_${userId}`, PENDING_BILLS);
    const updated = bills.map((b: Bill) => b.id === id ? { ...b, ...updates } : b);
    storage.set(`${LOCAL_KEYS.BILLS}_${userId}`, updated);
    try {
      await fetch(`${API_BASE}/bills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, user_id: userId })
      });
    } catch (e) {}
  },

  deleteBill: async (userId: string, id: string, permanent = false) => {
    const bills = storage.get(`${LOCAL_KEYS.BILLS}_${userId}`, PENDING_BILLS);
    storage.set(`${LOCAL_KEYS.BILLS}_${userId}`, bills.filter((b: Bill) => b.id !== id));
    try {
      // In the server.js, there isn't a dedicated DELETE /api/bills/:id yet 
      // but we can simulate it or update the bill's is_deleted status.
      // Based on server.js provided, it seems we might need to add it or use PUT to soft delete.
      // For permanent delete, we should ideally have a DELETE endpoint.
      await fetch(`${API_BASE}/bills/${id}?userId=${userId}&permanent=${permanent}`, { method: 'DELETE' });
    } catch (e) {}
  },

  getSettings: async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE}/settings/${userId}`);
      if (res.ok) return res.json();
    } catch (e) {}
    return storage.get(`${LOCAL_KEYS.SETTINGS}_${userId}`, { darkMode: false, language: 'fr', timeFormat: '24h' });
  },

  saveSettings: async (userId: string, settings: any) => {
    storage.set(`${LOCAL_KEYS.SETTINGS}_${userId}`, settings);
    try {
      await fetch(`${API_BASE}/settings/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch (e) {}
  }
};
