import ICAL from 'ical.js';
import { Task } from '../types';

const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchViaProxy(targetUrl: string): Promise<string> {
  // Try direct fetch first (works on server-side / same-origin)
  try {
    const direct = await fetchWithTimeout(targetUrl, 5000);
    if (direct.ok) {
      const text = await direct.text();
      if (text.includes('BEGIN:VCALENDAR')) return text;
    }
  } catch { /* ignore, try proxies */ }

  // Try each CORS proxy
  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxyUrl = proxyFn(targetUrl);
      const res = await fetchWithTimeout(proxyUrl, 10000);
      if (!res.ok) continue;
      const text = await res.text();
      if (text.includes('BEGIN:VCALENDAR')) return text;
    } catch { /* try next proxy */ }
  }

  throw new Error('Could not fetch iCal data. The URL may be invalid or inaccessible.');
}

export const iCalService = {
  fetchCalendar: async (url: string): Promise<Task[]> => {
    try {
      const text = await fetchViaProxy(url);
      
      const jcalData = ICAL.parse(text);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');
      
      const tasks: Task[] = vevents.map((vevent: any) => {
        const event = new ICAL.Event(vevent);
        
        const startDate = event.startDate.toJSDate();
        const endDate = event.endDate?.toJSDate();
        const dateStr = startDate.toISOString().split('T')[0];
        
        const startH = startDate.getHours().toString().padStart(2, '0');
        const startM = startDate.getMinutes().toString().padStart(2, '0');
        let timeStr = `${startH}:${startM}`;
        
        if (endDate) {
          const endH = endDate.getHours().toString().padStart(2, '0');
          const endM = endDate.getMinutes().toString().padStart(2, '0');
          timeStr = `${startH}:${startM} - ${endH}:${endM}`;
        }
        
        return {
          id: `ical-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: event.summary || 'External Event',
          date: dateStr,
          time: timeStr,
          type: 'Meeting',
          status: 'todo',
          color: 'purple',
          location: event.location ? { name: event.location, address: event.location } : undefined,
          readonly: true,
          source: url
        } as Task;
      });
      
      return tasks;
    } catch (error) {
      console.error('Error fetching/parsing iCal:', error);
      throw error; // Re-throw so the UI can show the error
    }
  }
};
