
export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface TaskLocation {
  name: string;
  address: string;
  url?: string;
}

export interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'Task' | 'Meeting' | 'Course' | 'Finance';
  status: TaskStatus;
  color: string;
  reminder?: string; // e.g., "15 minutes avant", "1 heure avant"
  location?: TaskLocation;
  readonly?: boolean;
  source?: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending';
  category: 'invoice' | 'subscription';
  reminder?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}
