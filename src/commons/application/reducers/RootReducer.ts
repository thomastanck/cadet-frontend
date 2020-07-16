import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { combineReducers } from 'redux';

import { AcademyReducer as academy } from '../../../features/academy/AcademyReducer';
import { DashboardReducer as dashboard } from '../../../features/dashboard/DashboardReducer';
import { PlaygroundReducer as playground } from '../../../features/playground/PlaygroundReducer';
import { AchievementReducer as achievements } from '../../achievements/AchievementReducer';
import { WorkspaceReducer as workspaces } from '../../workspace/WorkspaceReducer';
import { ApplicationReducer as application } from '../ApplicationReducer';
import { SessionsReducer as session } from './SessionsReducer';

const createRootReducer = (history: History) =>
  combineReducers({
    router: connectRouter(history),
    academy,
    achievements,
    application,
    dashboard,
    playground,
    session,
    workspaces
  });

export default createRootReducer;
