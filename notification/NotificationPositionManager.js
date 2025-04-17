const RightBottomPosition = require("./positions/RightBottomPosition.js");

const PositionManager = (options) => {
    const {position, groupWidth, groupHeight} = options;
    const getPosition = () => {
        switch (position) {
            case "bottomRight": {
                return RightBottomPosition({
                    groupWidth: groupWidth,
                    groupHeight: groupHeight
                });
            }
            default:
                break;
        }
    }
    return {getPosition}
}

module.exports = PositionManager