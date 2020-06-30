import { SagaIterator } from 'redux-saga';
import { takeLatest, put } from 'redux-saga/effects';
import {
  REMOTE_EXEC_FETCH_DEVICES,
  Device
} from 'src/features/remoteExecution/RemoteExecutionTypes';
import { actions } from '../utils/ActionsHelper';

export function* remoteExecutionSaga(): SagaIterator {
  yield takeLatest(REMOTE_EXEC_FETCH_DEVICES, function* () {
    // TODO backend
    const devices: Device[] = [
      {
        id: 1,
        name: 'Test device',
        type: 'Test type'
      }
    ];

    yield put(actions.remoteExecUpdateDevices(devices));
  });
}

export default remoteExecutionSaga;
