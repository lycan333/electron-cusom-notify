import NotificationBase from './NotificationBase'
import {isNil} from "lodash";
import {screen} from "electron";

const NotificationManager = () => {
    let notifications = [];
    const defaultHeight = 100;
    const defaultWidth = 350;
    const defaultGap = 1;
    let defaultLifeTime = 10000;

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
            console.log(notifications[i]);
            if (!win.isDestroyed()) {
                const {width, height} = screen.getPrimaryDisplay().workAreaSize;
                const newY = height - ((defaultWidth + defaultHeight) * (i + 1));
                animateMoveTo(win, newY);
            }
        }
    }

    const createNotification = (options) => {
        const {index} = options

        options.onCloseCommand = () => {
            options.onCloseCommand();
            const win = getWindowByUUID(index);
            console.log("close notification with index", index);
            if (!isNil(win))
                if (!win.isDestroyed()) {
                    win.close()
                }
        }

        options.onClose = () => {
            options.onClose();
            console.log("closed");
            const win = getWindowByUUID(index);
            if (!isNil(win)) {
                const closedIndex = notifications.indexOf({
                    uuid: index,
                    window: win
                });
                console.log("closedIndex", closedIndex);
                if (closedIndex !== -1) {
                    notifications.splice(closedIndex, 1);
                    repositionNotifications(closedIndex);
                }
            }
        }

        const notification = NotificationBase(options);
        const notificationObject = {
            uuid: index,
            window: notification
        };
        notifications.push(notificationObject);

    }

    const getWindowByUUID = (uuid) => {
        const found = notifications.find(w => w.uuid === uuid);
        if (found) {
            const win = found.window;
            if (!isNil(win)) return win;
        }
        return null;
    }

    return { createNotification };
}
module.exports = NotificationManager
