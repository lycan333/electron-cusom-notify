import defaultNotify from './NotificationBase.js'
import positionManager from './NotificationPositionManager.js'
import {screen} from 'electron'

const NotificationManager = (options) => {

    const notifications = [];


    const {
        defaultHeight = 100,
        defaultWidth = 350,
        gap = 1,
        duration = 10000,
        position = "bottomRight"
    } = options || {}


    const animateMoveTo = (win, targetY, duration = 120) => {
        const intervalTime = 10; // ~60fps
        const steps = duration / intervalTime;
        let currentBounds = win.getBounds();
        let stepY = (targetY - currentBounds.y) / steps;

        let count = 0;

        const interval = setInterval(() => {
            if (win.isDestroyed()) {
                clearInterval(interval);
                return;
            }

            currentBounds = win.getBounds();
            const newY = currentBounds.y + stepY;

            win.setBounds({
                x: currentBounds.x,
                y: Math.round(newY),
                width: currentBounds.width,
                height: currentBounds.height
            });

            count++;

            if (count >= steps) {
                // End animation — snap to final position
                win.setBounds({
                    x: currentBounds.x,
                    y: targetY,
                    width: currentBounds.width,
                    height: currentBounds.height
                });
                clearInterval(interval);
            }
        }, intervalTime);
    }

    const repositionNotifications = (startIndex) => {
        for (let i = startIndex; i < notifications.length; i++) {
            const win = notifications[i].window;
            if (!win.isDestroyed()) {
                const {width, height} = screen.getPrimaryDisplay().workAreaSize;
                const newY = height - ((defaultHeight + gap) * (i + 1));
                animateMoveTo(win, newY);
            }
        }
    }

    const getGroupWidth = (width) => {
        return width + gap
    }
    const getGroupHeight = (height) => {
        const index = notifications.length;
        return (height + gap) * (index + 1)
    }


    const createNotification = (ops) => {
        const {index} = ops

        ops = {
            size: {
                width: defaultWidth,
                height: defaultHeight,
            },
            ...ops
        }

        const posMan = positionManager({
            position: position,
            groupWidth: getGroupWidth(ops.size.width),
            groupHeight: getGroupHeight(ops.size.height)
        });
        const pos = posMan.getPosition();

        ops.location = {
            x: pos.x,
            y: pos.y
        }


        ops.onCloseCommand = (index) => {
            const win = getWindowByUUID(index);
            if ((win != null && win != undefined))
                if (!win.isDestroyed()) {
                    win.close()
                }
        }

        ops.onClose = (index) => {
            const closedIndex = getNotifyIndexByUUID(index);
            if (closedIndex !== -1) {
                notifications.splice(closedIndex, 1);
                repositionNotifications(closedIndex);
            }
        }

        ops.onRender = (win) => {
            if ((win != null && win != undefined)){
                const notificationObject = {
                    uuid: index,
                    window: win
                };
                notifications.push(notificationObject);
            }
        }

        const notification = defaultNotify(ops);
        notification.show();


    }

    const getWindowByUUID = (uuid) => {
        const found = notifications.find(w => w.uuid === uuid);
        if (found) {
            const win = found.window;
            if ((win != null && win != undefined))
                return win;
        }
        return null;
    }

    const getNotifyIndexByUUID = (uuid) => {
        const found = notifications.find(w => w.uuid === uuid);
        if ((found != null && found != undefined)){
            return notifications.indexOf(found);
        }
        return null;
    }

    return {createNotification};
}
export default NotificationManager
