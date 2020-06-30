import { action } from 'typesafe-actions';

import {
  REMOTE_EXEC_FETCH_DEVICES,
  REMOTE_EXEC_UPDATE_DEVICES,
  Device
} from './RemoteExecutionTypes';

export const remoteExecFetchDevices = () => action(REMOTE_EXEC_FETCH_DEVICES);

export const remoteExecUpdateDevices = (devices: Device[]) =>
  action(REMOTE_EXEC_UPDATE_DEVICES, devices);
