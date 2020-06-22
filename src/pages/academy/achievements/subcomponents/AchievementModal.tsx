import React from 'react';

import Inferencer from './utils/Inferencer';
import { Card } from '@blueprintjs/core';
import AchievementExp from './utils/AchievementExp';
import AchievementModalDescription from './modal/AchievementModalDescription';
import AchievementModalGoal from './modal/AchievementModalGoal';
import AchievementModalCompletion from './modal/AchievementModalCompletion';

type AchievementModalProps = {
  id: number;
  inferencer: Inferencer;
};

function AchievementModal(props: AchievementModalProps) {
  const { id, inferencer } = props;

  const modal = inferencer.getModalItem(id);

  if (modal === undefined) return null;

  const { title, exp } = inferencer.getAchievementItem(id);
  const { modalImageUrl, description, goalText, completionText } = modal;

  return (
    <div className="modal">
      <Card className="modal-container">
        <h1>{title}</h1>
        <div>
          <img src={modalImageUrl} alt={title} />
        </div>
        <AchievementExp exp={exp} />
        <AchievementModalDescription description={description} />
        <AchievementModalGoal goalText={goalText} />
        <AchievementModalCompletion completionText={completionText} />
      </Card>
    </div>
  );
}

export default AchievementModal;
