import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../../../commons/mocks/AchievementMocks';
import AchievementInferencer from '../../../../../dashboard/subcomponents/utils/AchievementInferencer';
import TaskDeleter from '../TaskDeleter';

const mockProps = {
  editableAchievement: mockAchievements[0],
  inferencer: new AchievementInferencer(mockAchievements),
  saveChanges: () => {}
};

test('TaskDeleter component renders correctly', () => {
  const component = <TaskDeleter {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
