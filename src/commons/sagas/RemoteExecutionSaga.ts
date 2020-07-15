import { assemble, compile, Context } from 'js-slang';
import { connect as mqttConnect } from 'mqtt';
import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  Device,
  DeviceSession,
  REMOTE_EXEC_CONNECT,
  REMOTE_EXEC_DISCONNECT,
  REMOTE_EXEC_FETCH_DEVICES,
  REMOTE_EXEC_RUN,
  WebSocketEndpointInformation
} from 'src/features/remoteExecution/RemoteExecutionTypes';

import { store } from '../../pages/createStore';
import { OverallState } from '../application/ApplicationTypes';
import { actions } from '../utils/ActionsHelper';
import { fetchDevices, getDeviceWSEndpoint } from './RequestsSaga';

export function* remoteExecutionSaga(): SagaIterator {
  yield takeLatest(REMOTE_EXEC_FETCH_DEVICES, function* () {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const devices: Device[] = yield call(fetchDevices, tokens);

    yield put(actions.remoteExecUpdateDevices(devices));
  });

  yield takeLatest(REMOTE_EXEC_CONNECT, function* (
    action: ReturnType<typeof actions.remoteExecConnect>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const endpoint: WebSocketEndpointInformation | null = yield call(
      getDeviceWSEndpoint,
      action.payload.device,
      tokens
    );
    if (!endpoint) {
      // TODO handle error
      return;
    }
    const client = mqttConnect(endpoint.endpoint, {
      clientId: `${endpoint.clientNamePrefix}${generateClientNonce()}`
    });
    yield put(
      actions.remoteExecUpdateSession({
        ...action.payload,
        connection: { status: 'CONNECTING', client, endpoint }
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
      client.subscribe(`${endpoint.thingName}/status`);
      yield put(
        actions.remoteExecUpdateSession({
          ...action.payload,
          connection: { status: 'CONNECTED', client, endpoint }
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

    client.publish(`${session.connection.endpoint.thingName}/act`, Buffer.from(assembled));

    // TODO
    // yield put(actions.handleConsoleLog(`Evaluating ${program}`, session.workspace));
    // yield delay(200);
    // for (let i = 0; i < 5; ++i) {
    //   yield put(actions.handleConsoleLog(`${i}`, session.workspace));
    //   yield delay(200);
    // }
  });
}

const ALPHANUMERIC = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const generateClientNonce = () =>
  new Array(16)
    .fill(undefined)
    .map(_ => ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)])
    .join('');

export default remoteExecutionSaga;
