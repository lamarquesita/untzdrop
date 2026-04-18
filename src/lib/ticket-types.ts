// Custom ticket types per event
// Each type maps to a base type (ga/vip) for DB storage + a display label

export interface TicketTypeConfig {
  value: string;      // stored in DB as ticket_type
  label: string;      // displayed to users
  color: string;      // badge color
}

const DEFAULT_TYPES: TicketTypeConfig[] = [
  { value: "ga", label: "GA", color: "#3B82F6" },
  { value: "vip", label: "VIP", color: "#D946EF" },
];

// Event-specific overrides (by event ID)
const EVENT_TICKET_TYPES: Record<number, TicketTypeConfig[]> = {
  6: [ // Anjunadeep
    { value: "ga_before12", label: "GA Before 12AM", color: "#3B82F6" },
    { value: "ga", label: "GA", color: "#60A5FA" },
    { value: "vip_before12", label: "VIP Before 12AM", color: "#D946EF" },
    { value: "vip", label: "VIP", color: "#E879F9" },
  ],
};

export function getTicketTypes(eventId: number): TicketTypeConfig[] {
  return EVENT_TICKET_TYPES[eventId] || DEFAULT_TYPES;
}

export function getTicketLabel(eventId: number, ticketType: string): string {
  const types = getTicketTypes(eventId);
  return types.find((t) => t.value === ticketType)?.label || ticketType.toUpperCase();
}

export function getTicketColor(eventId: number, ticketType: string): string {
  const types = getTicketTypes(eventId);
  return types.find((t) => t.value === ticketType)?.color || "#3B82F6";
}
