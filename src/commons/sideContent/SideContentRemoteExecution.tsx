import {
  Button,
  Callout,
  Classes,
  ContextMenu,
  Dialog,
  FormGroup,
  HTMLSelect,
  Menu,
  MenuDivider,
  MenuItem,
  NonIdealState,
  Spinner
} from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import { OverallState } from '../application/ApplicationTypes';
import { actions } from '../utils/ActionsHelper';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';

export interface SideContentRemoteExecutionProps {
  workspace: WorkspaceLocation;
}

interface AddDeviceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddDeviceDialog = ({ isOpen, onClose }: AddDeviceDialogProps) => {
  return (
    <Dialog
      title="Add new device"
      isOpen={isOpen}
      className={Classes.DARK}
      onClose={onClose}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
    >
      <div className={Classes.DIALOG_BODY}>
        <FormGroup
          label="Name"
          labelFor="sa-remote-execution-name"
          helperText="Shown to you only. You can key in a different name from other users."
        >
          <input
            id="sa-remote-execution-name"
            className={classNames(Classes.INPUT, Classes.FILL)}
            type="text"
          />
        </FormGroup>

        <FormGroup label="Type" labelFor="sa-remote-execution-type">
          <HTMLSelect id="sa-remote-execution-type" className={classNames(Classes.FILL)}>
            <option>A</option>
            <option>B</option>
          </HTMLSelect>
        </FormGroup>

        <FormGroup label="Secret" labelFor="sa-remote-execution-secret">
          <input
            id="sa-remote-execution-secret"
            className={classNames(Classes.INPUT, Classes.FILL)}
            type="text"
          />
        </FormGroup>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>Cancel</Button>
          <Button intent="primary" onClick={onClose}>
            Add
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

const SideContentRemoteExecution: React.FC<SideContentRemoteExecutionProps> = props => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  const [, isLoggedIn, devices, currentSession] = useSelector((store: OverallState) => [
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
    if (!devices && isLoggedIn) {
      dispatch(actions.remoteExecFetchDevices());
    }
  }, [dispatch, devices, isLoggedIn]);

  React.useEffect(
    () => () => {
      // note the double () => - this function is a destructor
      dispatch(actions.remoteExecDisconnect());
    },
    [dispatch]
  );

  if (!isLoggedIn) {
    return (
      <Callout intent="danger">
        Please <NavLink to="/login">log in</NavLink> to execute on a remote device.
      </Callout>
    );
  }

  const currentDevice = currentSession?.device;

  return (
    <div className="sa-remote-execution row">
      <div className="col-xs-6">
        {!currentDevice && (
          <>
            <p>Not connected to a device&mdash;programs are run in your local browser.</p>
            <p>Select a device from the right.</p>
          </>
        )}
        {currentDevice &&
          (isConnecting ? (
            <NonIdealState description="Connecting..." icon={<Spinner />} />
          ) : (
            <p>
              Connected to {currentDevice.title} ({currentDevice.type}).
            </p>
          ))}
      </div>
      <div className="col-xs-6 devices-menu-container">
        <Menu className={classNames(Classes.ELEVATION_0)}>
          <MenuItem
            text="Browser"
            onClick={() => dispatch(actions.remoteExecDisconnect())}
            icon={!currentDevice ? 'tick' : undefined}
            intent={!currentDevice ? 'success' : undefined}
          />
          <MenuDivider title="Devices; right click to edit" />
          {devices &&
            devices.map(device => {
              const thisConnected = currentDevice?.id === device.id;
              return (
                <MenuItem
                  key={device.id}
                  onClick={() => dispatch(actions.remoteExecConnect(props.workspace, device))}
                  onContextMenu={e => {
                    e.preventDefault();
                    ContextMenu.show(
                      <Menu>
                        <MenuItem icon="edit" text="Rename" />
                        <MenuItem icon="delete" text="Delete" />
                      </Menu>,
                      { left: e.clientX, top: e.clientY },
                      undefined,
                      true
                    );
                  }}
                  text={`${device.title} (${device.type})`}
                  icon={thisConnected ? 'tick' : undefined}
                  label={thisConnected ? 'Connected' : undefined}
                  intent={thisConnected ? 'success' : undefined}
                />
              );
            })}
          <MenuDivider />
          <MenuItem
            text="Add new device..."
            icon={'add'}
            onClick={() => setIsAddDialogOpen(true)}
          />
        </Menu>
      </div>
      <AddDeviceDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} />
    </div>
  );
};

export default SideContentRemoteExecution;
