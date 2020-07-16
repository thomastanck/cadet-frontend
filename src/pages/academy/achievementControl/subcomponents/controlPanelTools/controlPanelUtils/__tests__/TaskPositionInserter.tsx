import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';
import Inferencer from 'src/pages/achievements/subcomponents/utils/Inferencer';

import TaskPositionInserter from '../TaskPositionInserter';

const mockProps = {
  editableAchievement: mockAchievements[0],
  setEditableAchievement: () => {},
  inferencer: new Inferencer(mockAchievements),
  saveChanges: () => {}
};

test('TaskPositionInserter component renders correctly', () => {
  const component = <TaskPositionInserter {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
