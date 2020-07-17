import { IconNames } from '@blueprintjs/icons';
import React, { useState } from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

import { AchievementAbility, FilterStatus } from '../../../commons/achievement/AchievementTypes';
import AchievementFilter from './subcomponents/AchievementFilter';
import AchievementModal from './subcomponents/AchievementModal';
import AchievementOverview from './subcomponents/AchievementOverview';
import AchievementTask from './subcomponents/AchievementTask';
import Inferencer from './subcomponents/utils/Inferencer';

export type DispatchProps = {};

export type StateProps = {};

function Dashboard(props: DispatchProps & StateProps) {
  const [now, setNow] = useState<Date>(new Date());

  const inferencer = new Inferencer(mockAchievements, now);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>(FilterStatus.ALL);
  const [modalId, setModalId] = useState<number>(-1);

  const handleFilterColor = (status: FilterStatus) => {
    return status === filterStatus ? '#2dd1f9' : '#ffffff';
  };

  const handleGlow = (id: number) => {
    if (id === modalId) {
      const ability = inferencer.getAchievementItem(id).ability;
      switch (ability) {
        case AchievementAbility.CORE:
          return {
            border: '1px solid #ffb412',
            boxShadow: '0 0 10px #ffb412'
          };
        case AchievementAbility.EFFORT:
          return {
            border: '1px solid #b5ff61',
            boxShadow: '0 0 10px #b5ff61'
          };
        case AchievementAbility.EXPLORATION:
          return {
            border: '1px solid #9ecaed',
            boxShadow: '0 0 10px #9ecaed'
          };
        case AchievementAbility.COMMUNITY:
          return {
            border: '1px solid #ff6780',
            boxShadow: '0 0 10px #ff6780'
          };
        default:
          return {};
      }
    }
    return {};
  };

  const mapAchievementIdsToTasks = (taskIds: number[]) =>
    taskIds.map(id => (
      <AchievementTask
        key={id}
        id={id}
        inferencer={inferencer}
        filterStatus={filterStatus}
        displayModal={setModalId}
        handleGlow={handleGlow}
      />
    ));

  return (
    <div className="AchievementDashboard">
      <div className="achievement-overview">
        <AchievementOverview
          name={'Tester'}
          studio={'T12-A'}
          inferencer={inferencer}
          setNow={setNow}
        />
      </div>
      <div className="achievement-main">
        <div className="filters">
          <AchievementFilter
            filterStatus={FilterStatus.ALL}
            setFilterStatus={setFilterStatus}
            icon={IconNames.GLOBE}
            count={inferencer.getFilterCount(FilterStatus.ALL)}
            handleFilterColor={handleFilterColor}
          />
          <AchievementFilter
            filterStatus={FilterStatus.ACTIVE}
            setFilterStatus={setFilterStatus}
            icon={IconNames.LOCATE}
            count={inferencer.getFilterCount(FilterStatus.ACTIVE)}
            handleFilterColor={handleFilterColor}
          />
          <AchievementFilter
            filterStatus={FilterStatus.COMPLETED}
            setFilterStatus={setFilterStatus}
            icon={IconNames.ENDORSED}
            count={inferencer.getFilterCount(FilterStatus.COMPLETED)}
            handleFilterColor={handleFilterColor}
          />
        </div>

        <ul className="cards-container">
          {mapAchievementIdsToTasks(inferencer.listTaskIdsbyPosition())}
        </ul>

        <div className="modal-container">
          <AchievementModal id={modalId} inferencer={inferencer} handleGlow={handleGlow} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
