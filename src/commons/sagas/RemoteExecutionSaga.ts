import { SagaIterator } from 'redux-saga';
import { takeLatest, put, takeEvery, select, call } from 'redux-saga/effects';
import { connect as mqttConnect } from 'mqtt';
import { Context, assemble, compile } from 'js-slang';

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
import { store } from '../../pages/createStore';

// POC
const MQTT_URL =
  'wss://a2ymu7hue04vq7-ats.iot.ap-southeast-1.amazonaws.com/mqtt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAYNU6ZMFNRCSQV3M6%2F20200703%2Fap-southeast-1%2Fiotdevicegateway%2Faws4_request&X-Amz-Date=20200703T081436Z&X-Amz-SignedHeaders=host&X-Amz-Signature=3548404b25cc42676502c7c43ce011c6250656ddf2def0eb57d86963a14176c7';

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
    const client = mqttConnect(MQTT_URL);
    yield put(
      actions.remoteExecUpdateSession({
        ...action.payload,
        connection: { status: 'CONNECTING', client }
      })
    );
    try {
      yield new Promise((resolve, reject) => {
        // hedge against races?
        if (client.connected) {
          resolve();
          return;
        }
        client.once('connect', resolve);
        client.once('error', reject);
      });
      client.on('message', (topic, payload) => {
        const v = JSON.parse(payload.toString('utf8'));
        store.dispatch(actions.evalInterpreterSuccess(v, action.payload.workspace));
      });
      client.subscribe('receiver-test-test/status');
      yield put(
        actions.remoteExecUpdateSession({
          ...action.payload,
          connection: { status: 'CONNECTED', client }
        })
      );
    } catch (err) {
      yield put(
        actions.remoteExecUpdateSession({
          ...action.payload,
          connection: { status: 'FAILED', client, error: err.toString() }
        })
      );
    }
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
    if (!session || session.connection.status !== 'CONNECTED') {
      return;
    }

    const client = session.connection.client;
    const context: Context = yield select(
      (state: OverallState) => state.workspaces[session.workspace].context
    );
    const compiled: ReturnType<typeof compile> = yield call(compile, program, context);
    if (!compiled) {
      yield put(actions.evalInterpreterError([], session.workspace));
    }
    const assembled = assemble(compiled);

    client.publish('receiver-test-test/act', Buffer.from(assembled));

    // TODO
    // yield put(actions.handleConsoleLog(`Evaluating ${program}`, session.workspace));
    // yield delay(200);
    // for (let i = 0; i < 5; ++i) {
    //   yield put(actions.handleConsoleLog(`${i}`, session.workspace));
    //   yield delay(200);
    // }
  });
}

export default remoteExecutionSaga;
