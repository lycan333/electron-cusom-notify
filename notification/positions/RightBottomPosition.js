import {screen} from 'electron'

const RightBottomPosition = (options) => {
    const {groupWidth, groupHeight} = options;
    const display = screen.getPrimaryDisplay();
    const {width, height} = display.workArea
    return {
        x: width - groupWidth,
        y: height - groupHeight,
    }
}
export default RightBottomPosition;