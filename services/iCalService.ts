import ICAL from 'ical.js';
import { Task } from '../types';

export const iCalService = {
  fetchCalendar: async (url: string): Promise<Task[]> => {
    try {
      // Use a CORS proxy to fetch external URLs securely in the browser
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Failed to fetch iCal data');
      const text = await response.text();
      
      const jcalData = ICAL.parse(text);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');
      
      const tasks: Task[] = vevents.map((vevent: any) => {
        const event = new ICAL.Event(vevent);
        
        const startDate = event.startDate.toJSDate();
        const dateStr = startDate.toISOString().split('T')[0];
        
        const hours = startDate.getHours().toString().padStart(2, '0');
        const minutes = startDate.getMinutes().toString().padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;
        
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
      return [];
    }
  }
};
