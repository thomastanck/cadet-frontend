import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, MenuItem, NonIdealState, Spinner } from '@blueprintjs/core';
import { Select, ItemRenderer } from '@blueprintjs/select';

import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { OverallState } from '../application/ApplicationTypes';
import { Device } from '../../features/remoteExecution/RemoteExecutionTypes';
import { actions } from '../utils/ActionsHelper';

export interface SideContentRemoteExecutionProps {
  workspace: WorkspaceLocation;
}

const LOCAL_DEVICE_TITLE = 'Browser';

const renderDevice: ItemRenderer<Device | undefined> = (device, { handleClick, modifiers }) => {
  return !device ? (
    <MenuItem
      active={modifiers.active}
      key={'LOCAL_DEVICE' /* this is just a react key, not used for anything else */}
      onClick={handleClick}
      text={LOCAL_DEVICE_TITLE}
    />
  ) : (
    <MenuItem
      active={modifiers.active}
      key={device.id}
      onClick={handleClick}
      text={device.name}
      label={device.type}
    />
  );
};

const DeviceSelect = Select.ofType<Device | undefined>();

const SideContentRemoteExecution: React.FC<SideContentRemoteExecutionProps> = props => {
  const [
    isRunning,
    isLoggedIn,
    storeDevices,
    currentSession
  ] = useSelector((store: OverallState) => [
    store.workspaces[props.workspace].isRunning,
    !!store.session.accessToken && !!store.session.role,
    store.session.remoteExecutionDevices,
    store.session.remoteExecutionSession
  ]);
  const dispatch = useDispatch();

  const isConnecting = currentSession && currentSession.connection.status === 'CONNECTING';

  React.useEffect(() => {
    // this is not supposed to happen - the destructor below should disconnect
    // once the user navigates away from the workspace
    if (currentSession && currentSession.workspace !== props.workspace) {
      dispatch(
        actions.remoteExecUpdateSession({
          ...currentSession,
          workspace: props.workspace
        })
      );
    }
  }, [currentSession, dispatch, props.workspace]);

  React.useEffect(() => {
    if (!storeDevices && isLoggedIn) {
      dispatch(actions.remoteExecFetchDevices());
    }
  }, [dispatch, storeDevices, isLoggedIn]);

  React.useEffect(
    () => () => {
      // note the double () => - this function is a destructor
      dispatch(actions.remoteExecDisconnect());
    },
    [dispatch]
  );

  const devices: Array<Device | undefined> = React.useMemo(
    () => [undefined, ...(storeDevices || [])],
    [storeDevices]
  );

  return (
    <div>
      <DeviceSelect
        disabled={!isLoggedIn || isConnecting || isRunning}
        items={devices}
        itemRenderer={renderDevice}
        onItemSelect={device =>
          dispatch(
            device
              ? actions.remoteExecConnect(props.workspace, device)
              : actions.remoteExecDisconnect()
          )
        }
        filterable={false}
        popoverProps={{ minimal: true }}
      >
        <Button
          disabled={!isLoggedIn || isConnecting || isRunning}
          text={currentSession === undefined ? LOCAL_DEVICE_TITLE : currentSession.device.name}
          rightIcon="caret-down"
        />
      </DeviceSelect>
      {!isLoggedIn && (
        <p>
          <strong>Please log in to execute on a remote device.</strong>
        </p>
      )}
      {isConnecting && <NonIdealState description="Connecting..." icon={<Spinner />} />}
    </div>
  );
};

export default SideContentRemoteExecution;
