export enum LeadStatus {
  PROSPECTION = 'Prospecção',
  TECHNICAL_VISIT = 'Visita Técnica',
  BRIEFING = 'Briefing',
  CONCEPT = 'Anteprojeto',
  SIGNED = 'Contrato Assinado'
}

export enum ProjectStage {
  BRIEFING = 'Briefing',
  CONCEPT = 'Anteprojeto',
  EXECUTIVE = 'Executivo',
  CONSTRUCTION = 'Obra',
  DELIVERY = 'Entrega'
}

export interface Task {
  id: string;
  description: string;
  completed: boolean;
  dueDate?: string;
}

export interface DailyLog {
  id: string;
  project_id: string;
  log_date: string;
  content: string;
  image_url?: string;
  created_at: string;
}

export interface MaterialApproval {
  id: string;
  name: string;
  category: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  imageUrl: string;
}

export interface Project {
  id: string;
  title: string;
  client_name: string;
  stage: string;
  rrt_status: string;
  rrt_number?: string;
  start_date: string;
  deadline?: string;
  total_value: number;
  paid_value: number;
  costs: number;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  daily_logs?: DailyLog[];
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  source: string;
  status: string;
  temperature?: string;
  budget: number;
  notes: string;
  next_action_date?: string;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  date: string;
  description: string;
  status: 'PAID' | 'PENDING';
  projectId?: string;
}
