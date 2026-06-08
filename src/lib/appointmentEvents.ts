import { EventEmitter } from 'events';

export type AppointmentChangeAction = 'created' | 'updated';

export interface AppointmentChangeEvent {
  appointmentId: number;
  patientId: number;
  action: AppointmentChangeAction;
}

const emitter = new EventEmitter();
emitter.setMaxListeners(200);

const GLOBAL_CHANNEL = 'appointments:change';

export function notifyAppointmentChange(event: AppointmentChangeEvent): void {
  emitter.emit(GLOBAL_CHANNEL, event);
  emitter.emit(`patient:${event.patientId}`, event);
}

export function subscribeAppointmentChanges(
  listener: (event: AppointmentChangeEvent) => void,
  options?: { patientId?: number }
): () => void {
  const channel = options?.patientId
    ? `patient:${options.patientId}`
    : GLOBAL_CHANNEL;
  emitter.on(channel, listener);
  return () => emitter.off(channel, listener);
}
