import { WorkspaceLocation } from 'src/commons/workspace/WorkspaceTypes';

export const REMOTE_EXEC_FETCH_DEVICES = 'REMOTE_EXEC_FETCH_DEVICES';
export const REMOTE_EXEC_UPDATE_DEVICES = 'REMOTE_EXEC_UPDATE_DEVICES';
export const REMOTE_EXEC_UPDATE_SESSION = 'REMOTE_EXEC_UPDATE_SESSION';

export const REMOTE_EXEC_CONNECT = 'REMOTE_EXEC_CONNECT';
export const REMOTE_EXEC_DISCONNECT = 'REMOTE_EXEC_DISCONNECT';

export const REMOTE_EXEC_RUN = 'REMOTE_EXEC_RUN';
export const REMOTE_EXEC_REPL_INPUT = 'REMOTE_EXEC_REPL_INPUT';

export interface Device {
  id: number;
  name: string;
  type: string;
}

export type DeviceConnectionStatus =
  | { status: 'CONNECTING' }
  | { status: 'CONNECTED' }
  | { status: 'FAILED'; error?: string };

export interface DeviceSession {
  workspace: WorkspaceLocation;
  device: Device;
  status: DeviceConnectionStatus;
}
