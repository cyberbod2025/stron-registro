export enum ScreenId {
  Splash = "Splash",
  Inicio = "Inicio",
  RegistroDeClase = "Registro de Clase",
  Confirmada = "Confirmada",
  SuccessClassConfirmed = "SuccessClassConfirmed",
  ClaseCancelada = "Clase Cancelada",
  Notificaciones = "Notificaciones",
  Leaderboard = "Leaderboard",
  MiPerfil = "Mi Perfil",
  InvitarAmiga = "Invitar Amiga",
  PanelInstructor = "Panel Instructor"
}

export type TransitionType = "slide_up" | "push" | "push_back" | "none";

export interface NavigationState {
  currentScreen: ScreenId;
  transitionType: TransitionType;
}

export interface ClassRegistration {
  fullName: string;
  email: string;
  mobile: string;
  isCommitted: boolean;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "success" | "warning" | "error" | "info";
  unread: boolean;
}
