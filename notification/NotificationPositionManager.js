import RightBottomPosition from "./positions/RightBottomPosition";

const PositionManager = (options) => {
    const {position, groupWidth, groupHeight} = options;
    const getPosition = () => {
        switch (this.position) {
            case "bottomRight": {
                return RightBottomPosition({
                    groupWidth: this.groupWidth,
                    groupHeight: this.groupHeight
                });
            }
            default:
                break;
        }

    }
}