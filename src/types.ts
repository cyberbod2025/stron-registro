export enum ScreenId {
  RoleSelection = "Seleccion de Rol",
  Splash = "Splash",
  Inicio = "Inicio",
  RegistroDeClase = "Registro de Clase",
  Confirmada = "Confirmada",
  ClaseCancelada = "Clase Cancelada",
  Notificaciones = "Notificaciones",
  MisRegistros = "Mis Registros",
  MiPerfil = "Mi Perfil",
  InvitarAmiga = "Salvar Quórum",
  PanelInstructor = "Panel Instructor",
  Reglas = "Reglas",
  WelcomeCover = "Welcome Cover",
  YaRegistrada = "Ya Registrada"
}

export type TransitionType = "slide_up" | "push" | "push_back" | "none";

export interface NavigationState {
  currentScreen: ScreenId;
  transitionType: TransitionType;
}

export type ClassStatus = "pendiente" | "confirmada_por_quorum" | "confirmada_manual" | "cancelada" | "finalizada";

export interface AttendanceRecord {
  id: string;
  class_id: string;
  student_id?: string;
  full_name?: string;
  email?: string;
  mobile?: string;
  attendance_status: "present" | "absent";
  was_registered: boolean;
  notes?: string;
  created_at: string;
}

export interface ClassSession {
  id: string;
  title: string;
  dateStr: string; // e.g. "Jueves" (fallback)
  timeStr: string; // e.g. "9:00 a.m." (fallback)
  startsAt?: string; // Real timestamp
  location: string;
  address?: string;
  location_link?: string;
  isPrivateLocation?: boolean;
  status: ClassStatus;
  confirmedCount: number;
  minRequired: number;
  deadlineStr: string; // e.g. "miércoles 9:00 p.m."
  mapsUrl?: string;
  wazeUrl?: string;
  calendarUrl?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  manual_confirmed?: boolean;
  confirmation_source?: string;
  confirmed_at?: string;
  confirmed_by?: string;
}

export interface ClassRegistration {
  classId: string;
  fullName: string;
  email: string;
  mobile: string;
  isCommitted: boolean;
  understandsGoal: boolean;
  willCancelInTime: boolean;
  referredByEmail?: string;
  whatsappOptIn?: boolean;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "success" | "warning" | "error" | "info";
  unread: boolean;
}
