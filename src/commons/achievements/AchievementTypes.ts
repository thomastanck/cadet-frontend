export const UPDATE_ACHIEVEMENTS = 'UPDATE_ACHIEVEMENTS';
export const SAVE_ACHIEVEMENTS = 'SAVE_ACHIEVEMENTS';
export const GET_ACHIEVEMENTS = 'GET_ACHIEVEMENTS';
export const EDIT_ACHIEVEMENT = 'EDIT_ACHIEVEMENT';
export const REMOVE_ACHIEVEMENT = 'REMOVE_ACHIEVEMENT';

export const REMOVE_GOAL = 'REMOVE_GOAL';

// TODO: Rename abilities
export enum AchievementAbility {
  CORE = 'Core',
  EFFORT = 'Effort',
  EXPLORATION = 'Exploration',
  COMMUNITY = 'Community'
}

export const achievementAbilities = [
  AchievementAbility.CORE,
  AchievementAbility.EFFORT,
  AchievementAbility.EXPLORATION,
  AchievementAbility.COMMUNITY
];

export enum AchievementStatus {
  ACTIVE = 'ACTIVE', // deadline not over and not completed
  COMPLETED = 'COMPLETED', // completed, regardless of deadline
  EXPIRED = 'EXPIRED' // deadline over and not completed
}

export enum FilterStatus {
  ALL = 'ALL', // show all achievements
  ACTIVE = 'ACTIVE', // show active achievements only
  COMPLETED = 'COMPLETED' // show completed achievements only
}

/**
 * Information of an achievement item
 *
 * @param {number} id unique id, primary key of the achievement item
 * @param {string} title title of the achievement item
 * @param {AchievementAbility} ability ability of the achievement item
 * @param {String} backgroundImageUrl background image of the achievement's card
 * @param {Date} deadline Optional, the deadline of the achievement item
 * @param {Date} release Optional, the release date of the achievement item
 * @param {boolean} isTask the achievement item is rendered as an achievement task if true
 * @param {number[]} prerequisiteIds an array of the prerequisites id
 * @param {AchievementGoal[]} goals an array of achievement goals
 * @param {AchievementModalItem} modal modal item of the achievement
 * @param {number} position ordering position of the achievement, value is 0 for non-tasks
 */
export type AchievementItem = {
  id: number;
  title: string;
  ability: AchievementAbility;
  backgroundImageUrl: string;
  deadline?: Date;
  release?: Date;
  isTask: boolean;
  prerequisiteIds: number[];
  goals: AchievementGoal[];
  modal: AchievementModalItem;
  position: number;
};

/**
 * Information of an achievement goal
 *
 * @param {number} goalId id of the goal
 * @param {string} goalText describes the goal requirement
 * @param {number} goalProgress student's current xp of this goal
 * @param {number} goalTarget maximum xp of this goal
 */
export type AchievementGoal = {
  goalId: number;
  goalText: string;
  goalProgress: number;
  goalTarget: number;
};

/**
 * Information of an achievement in a modal
 *
 * @param {string} modalImageUrl URL of the modal image
 * @param {string} description fixed text that displays under title
 * @param {string} completionText text that displays after student completes the achievement
 */
export type AchievementModalItem = {
  modalImageUrl: string;
  description: string;
  completionText: string;
};

export type AchievementState = {
  achievements: AchievementItem[];
};

export const defaultAchievements: AchievementState = {
  achievements: []
};

// Start of the week
export const semester1Weeks: Map<number, Date> = new Map([
  [1, new Date(2020, 7, 10, 0, 0, 0)],
  [2, new Date(2020, 7, 17, 0, 0, 0)],
  [3, new Date(2020, 7, 24, 0, 0, 0)],
  [4, new Date(2020, 7, 31, 0, 0, 0)],
  [5, new Date(2020, 8, 7, 0, 0, 0)],
  [6, new Date(2020, 8, 14, 0, 0, 0)],
  [6.5, new Date(2020, 8, 19, 0, 0, 0)], // recess week
  [7, new Date(2020, 8, 28, 0, 0, 0)],
  [8, new Date(2020, 9, 5, 0, 0, 0)],
  [9, new Date(2020, 9, 12, 0, 0, 0)],
  [10, new Date(2020, 9, 19, 0, 0, 0)],
  [11, new Date(2020, 9, 26, 0, 0, 0)],
  [12, new Date(2020, 10, 2, 0, 0, 0)],
  [13, new Date(2020, 10, 9, 0, 0, 0)],
  [14, new Date(2020, 10, 14, 0, 0, 0)], // reading week
  [15.1, new Date(2020, 10, 21, 0, 0, 0)], // exam week 1
  [15.2, new Date(2020, 10, 28, 0, 0, 0)], // exam week 2
  [16, new Date(2020, 11, 6, 0, 0, 0)] // vacation
]);
