import FontAssets from '../../assets/FontAssets';
import { screenCenter } from '../../commons/CommonConstants';
import { BitmapFontStyle } from '../../commons/CommonTypes';
import { HexColor } from '../../utils/StyleUtils';

export const transitionTextStyle: BitmapFontStyle = {
  key: FontAssets.alienCowsFont.key,
  size: 80,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const tweenDuration = 1500;

const checkpointConstants = {
  chapterText: 'Chapter completed.',
  checkpointText: 'Checkpoint reached.',
  transitionTextConfig: { x: screenCenter.x, y: screenCenter.y, oriX: 0.5, oriY: 0.5 },
  tweenDuration: tweenDuration,
  entryTween: {
    alpha: 1,
    duration: tweenDuration,
    ease: 'Power2'
  },
  exitTween: {
    alpha: 0,
    duration: tweenDuration,
    ease: 'Power2'
  }
};

export default checkpointConstants;
