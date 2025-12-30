
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
  TECHNICAL = 'Executivo',
  CONSTRUCTION = 'Obra/Acompanhamento',
  COMPLETED = 'Finalizado'
}

export interface Task {
  id: string;
  description: string;
  completed: boolean;
  dueDate?: string;
}

export interface DailyLog {
  id: string;
  date: string;
  content: string;
  imageUrl?: string;
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
  clientId: string;
  title: string;
  stage: ProjectStage;
  startDate: string;
  deadline: string;
  totalValue: number;
  paidValue: number;
  progress: number;
  rrtStatus: 'PENDING' | 'ISSUED' | 'PAID';
  rrtNumber?: string;
  dailyLogs: DailyLog[];
  materialApprovals: MaterialApproval[];
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  budget?: number;
  notes: string;
  createdAt: string;
  tasks: Task[];
  address?: string;
  taxId?: string;
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
