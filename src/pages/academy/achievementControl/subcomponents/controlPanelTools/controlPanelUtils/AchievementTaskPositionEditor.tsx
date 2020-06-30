import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';
import Inferencer from '../../../../../achievements/subcomponents/utils/Inferencer';
import AchievementTaskSelector from './AchievementTaskSelector';
import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';

type AchievementTaskPositionEditorProps = {
  editableAchievement: AchievementItem;
  inferencer: Inferencer;
  updateAchievements: any;
};

function AchievementTaskPositionEditor(props: AchievementTaskPositionEditorProps) {
  const { editableAchievement, inferencer, updateAchievements } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const toggleDialogOpen = () => setDialogOpen(!isDialogOpen);

  const taskIDs = inferencer.listTaskIds();

  const [swappedTaskID, setSwappedTaskID] = useState<number>(taskIDs.length === 0 ? 0 : taskIDs[0]);

  const swappingAction = (e: any) => {
    toggleDialogOpen();
    inferencer.swapAchievementPositions(
      editableAchievement,
      inferencer.getAchievementItem(swappedTaskID)
    );
    updateAchievements(inferencer.getAchievements());
  };

  return (
    <>
      <Button className="editor-button" onClick={toggleDialogOpen} text={'Change Pos'} />
      <AchievementTaskSelector
        tasks={taskIDs}
        inferencer={inferencer}
        focusTaskID={swappedTaskID}
        setFocusTaskID={setSwappedTaskID}
        buttonText={'Swap Positions'}
        dialogHeader={"Swap this task's position"}
        emptyTasksMessage={'You have no more tasks to swap with'}
        setDialogOpen={toggleDialogOpen}
        isDialogOpen={isDialogOpen}
        action={swappingAction}
      />
    </>
  );
}

export default AchievementTaskPositionEditor;