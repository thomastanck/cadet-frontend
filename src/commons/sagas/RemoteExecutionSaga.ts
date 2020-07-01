import { SagaIterator } from 'redux-saga';
import { takeLatest, put, delay, takeEvery, select } from 'redux-saga/effects';
import {
  REMOTE_EXEC_FETCH_DEVICES,
  Device,
  REMOTE_EXEC_CONNECT,
  REMOTE_EXEC_DISCONNECT,
  REMOTE_EXEC_RUN,
  DeviceSession
} from 'src/features/remoteExecution/RemoteExecutionTypes';
import { actions } from '../utils/ActionsHelper';
import { OverallState } from '../application/ApplicationTypes';

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

  yield takeLatest(REMOTE_EXEC_CONNECT, function* (
    action: ReturnType<typeof actions.remoteExecConnect>
  ) {
    // TODO connect
    yield put(
      actions.remoteExecUpdateSession({
        ...action.payload,
        status: { status: 'CONNECTING' }
      })
    );
    yield delay(1000);
    yield put(
      actions.remoteExecUpdateSession({
        ...action.payload,
        status: { status: 'CONNECTED' }
      })
    );
  });

  yield takeLatest(REMOTE_EXEC_DISCONNECT, function* (
    action: ReturnType<typeof actions.remoteExecDisconnect>
  ) {
    // TODO disconnect
    yield put(actions.remoteExecUpdateSession(undefined));
  });

  yield takeEvery(REMOTE_EXEC_RUN, function* ({
    payload: program
  }: ReturnType<typeof actions.remoteExecRun>) {
    const session: DeviceSession | undefined = yield select(
      (state: OverallState) => state.session.remoteExecutionSession
    );
    if (!session) {
      return;
    }

    // TODO
    yield put(actions.handleConsoleLog(`Evaluating ${program}`, session.workspace));
    yield delay(200);
    for (let i = 0; i < 5; ++i) {
      yield put(actions.handleConsoleLog(`${i}`, session.workspace));
      yield delay(200);
    }
    yield put(actions.evalInterpreterSuccess('Done!', session.workspace));
  });
}

export default remoteExecutionSaga;
