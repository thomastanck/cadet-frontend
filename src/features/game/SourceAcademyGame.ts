import * as Phaser from 'phaser';
import { AwardProperty } from 'src/features/game/awards/GameAwardsTypes';
import { Constants, screenSize } from 'src/features/game/commons/CommonConstants';
import { ItemId } from 'src/features/game/commons/CommonTypes';
import GameSaveManager from 'src/features/game/save/GameSaveManager';
import AwardsHall from 'src/features/game/scenes/awardsHall/AwardsHall';
import Bindings from 'src/features/game/scenes/bindings/Bindings';
import ChapterSelect from 'src/features/game/scenes/chapterSelect/ChapterSelect';
import CheckpointTransition from 'src/features/game/scenes/checkpointTransition/CheckpointTransition';
import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import MainMenu from 'src/features/game/scenes/mainMenu/MainMenu';
import RoomPreview from 'src/features/game/scenes/roomPreview/RoomPreview';
import Settings from 'src/features/game/scenes/settings/Settings';
import GameSoundManager from 'src/features/game/sound/GameSoundManager';
import { mandatory } from 'src/features/game/utils/GameUtils';
import { StorySimState } from 'src/features/storySimulator/StorySimulatorTypes';

import { fetchGameChapters } from './chapter/GameChapterHelpers';
import GameChapterMocks from './chapter/GameChapterMocks';
import { GameChapter } from './chapter/GameChapterTypes';
import EntryScene from './scenes/entry/EntryScene';
import { getRoomPreviewCode } from './scenes/roomPreview/RoomPreviewHelper';
import GameUserStateManager from './state/GameUserStateManager';

export type AccountInfo = {
  accessToken: string;
  refreshToken: string;
  role: string;
  name: string;
};

export enum GameType {
  Simulator = 'Simulator',
  Game = 'Game'
}

type GlobalGameProps = {
  accountInfo: AccountInfo | undefined;
  setStorySimState: (value: React.SetStateAction<string>) => void;
  awardsMapping: Map<ItemId, AwardProperty>;
  currentSceneRef?: Phaser.Scene;
  soundManager: GameSoundManager;
  saveManager: GameSaveManager;
  userStateManager: GameUserStateManager;
  gameType: GameType;
  gameChapters: GameChapter[];
  ssChapterSimFilenames: string[];
  isUsingMock: boolean;
  roomCode: string;
};

export default class SourceAcademyGame extends Phaser.Game {
  static instance: SourceAcademyGame;
  protected global: GlobalGameProps;
  public isMounted: boolean;

  constructor(config: Phaser.Types.Core.GameConfig, gameType: GameType) {
    super(config);
    SourceAcademyGame.instance = this;
    this.isMounted = true;
    this.global = {
      awardsMapping: new Map<ItemId, AwardProperty>(),
      accountInfo: undefined,
      setStorySimState: Constants.nullFunction,
      currentSceneRef: undefined,
      soundManager: new GameSoundManager(),
      saveManager: new GameSaveManager(),
      userStateManager: new GameUserStateManager(),
      gameType,
      gameChapters: [],
      ssChapterSimFilenames: [],
      isUsingMock: false,
      roomCode: ''
    };
  }

  static getInstance = () => mandatory(SourceAcademyGame.instance);

  public stopAllSounds() {
    this.sound.stopAll();
  }

  public setAccountInfo(acc: AccountInfo | undefined) {
    this.global.accountInfo = acc;
  }

  public setAwardsMapping(awardsMapping: Map<ItemId, AwardProperty>) {
    this.global.awardsMapping = awardsMapping;
  }

  public setStorySimStateSetter(setStorySimState: (value: React.SetStateAction<string>) => void) {
    this.setStorySimState = setStorySimState;
  }

  public async loadGameChapters() {
    this.global.gameChapters = await fetchGameChapters();
  }

  public async loadRoomCode() {
    this.global.roomCode = await getRoomPreviewCode();
  }

  public setStorySimState(state: StorySimState) {
    this.global.setStorySimState(state);
  }

  public setCurrentSceneRef(scene: Phaser.Scene) {
    this.global.currentSceneRef = scene;
  }

  public toggleUsingMock() {
    this.global.isUsingMock = !this.global.isUsingMock;
  }

  public setChapterSimStack(checkpointFilenames: string[]) {
    this.global.ssChapterSimFilenames = checkpointFilenames.reverse();
  }

  public getAwardsMapping = () => mandatory(this.global.awardsMapping);
  public getAccountInfo = () => mandatory(this.global.accountInfo);
  public getSoundManager = () => mandatory(this.global.soundManager);
  public getUserStateManager = () => mandatory(this.global.userStateManager);
  public getSaveManager = () => mandatory(this.global.saveManager);
  public getCurrentSceneRef = () => mandatory(this.global.currentSceneRef);
  public isGameType = (gameType: GameType) => this.global.gameType === gameType;
  public getSSChapterSimFilenames = () => this.global.ssChapterSimFilenames;
  public getIsUsingMock = () => this.global.isUsingMock;
  public getRoomCode = () => this.global.roomCode;
  public getGameChapters = () =>
    this.global.isUsingMock ? GameChapterMocks : this.global.gameChapters;
}

const config = {
  debug: true,
  type: Phaser.WEBGL,
  width: screenSize.x,
  height: screenSize.y,
  physics: {
    default: 'arcade'
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-display'
  },
  scene: [
    EntryScene,
    MainMenu,
    Settings,
    ChapterSelect,
    GameManager,
    CheckpointTransition,
    AwardsHall,
    RoomPreview,
    Bindings
  ]
};

export const createSourceAcademyGame = () => {
  return new SourceAcademyGame(config, GameType.Game);
};
