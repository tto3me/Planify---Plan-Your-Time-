import ICAL from 'ical.js';
import { Task } from '../types';

const CORS_PROXIES = [
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

async function fetchWithFullTimeout(url: string, timeoutMs = 12000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return text;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchViaProxy(targetUrl: string): Promise<string> {
  const errors: string[] = [];

  // Try each CORS proxy
  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxyUrl = proxyFn(targetUrl);
      const text = await fetchWithFullTimeout(proxyUrl, 12000);
      if (text.includes('BEGIN:VCALENDAR')) return text;
      errors.push('Response is not a valid iCal file');
    } catch (e: any) {
      errors.push(e.name === 'AbortError' ? 'Timeout' : e.message);
    }
  }

  throw new Error(`Could not fetch iCal: ${errors.join(', ')}`);
}

export const iCalService = {
  fetchCalendar: async (url: string, type: 'Task' | 'Meeting' | 'Course' | 'Finance' = 'Course'): Promise<Task[]> => {
    const text = await fetchViaProxy(url);
    
    const jcalData = ICAL.parse(text);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');
    
    const typeToColor: Record<string, string> = { Task: 'green', Meeting: 'blue', Course: 'purple', Finance: 'orange' };

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
      
      const uniqueId = event.uid || `${event.summary}-${dateStr}-${timeStr}`.replace(/[^a-zA-Z0-9]/g, '-');
      return {
        id: `ical-${uniqueId}-${btoa(url).substring(0, 10)}`,
        title: event.summary || 'External Event',
        date: dateStr,
        time: timeStr,
        type: type,
        status: 'todo',
        color: typeToColor[type] || 'purple',
        location: event.location ? { name: event.location, address: event.location } : undefined,
        readonly: true,
        source: url
      } as Task;
    });
    
    return tasks;
  }
};
