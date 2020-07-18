import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';
import AchievementInferencer from 'src/pages/achievement/dashboard/subcomponents/utils/AchievementInferencer';

import PrerequisitePositionEditor from '../PrerequisitePositionEditor';

const mockProps = {
  editableAchievement: mockAchievements[0],
  inferencer: new AchievementInferencer(mockAchievements),
  saveChanges: () => {}
};

test('PrerequisitePositionEditor component renders correctly', () => {
  const component = <PrerequisitePositionEditor {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
