import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Inferencer from 'src/pages/achievement/dashboard/subcomponents/utils/Inferencer';

import {
  editAchievement,
  getAchievements,
  removeAchievement,
  removeGoal,
  saveAchievements
} from '../../../commons/achievement/AchievementActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import AchievementControl, { DispatchProps, StateProps } from './AchievementControl';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: new Inferencer(state.achievement.achievements, new Date())
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchAchievements: getAchievements,
      handleSaveAchievements: saveAchievements,
      handleEditAchievement: editAchievement,
      handleRemoveGoal: removeGoal,
      handleRemoveAchievement: removeAchievement
    },
    dispatch
  );

const AchievementControlContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AchievementControl);

export default AchievementControlContainer;
