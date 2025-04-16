import path from "path";

const uuid = require('uuid')
const {BrowserWindow, ipcMain, screen} = require('electron')
const axios = require('axios');

const NotificationBase = (options) => {
    let {
        title,
        message,
        icon,
        index,
        type = `info`,
        duration = 5000,
        onClose,
        onCloseCommand,
        config: {
            needDownloadIcon = false,
        },
        size: {
            width,
            height
        },
        location: {
            x,
            y
        }
    } = options;

    let notification = null;

    ipcMain.on('close-notify', onCloseCommand);


    const downloadIconAsBase64 = async (url) => {
        const response = await axios.get(url, {responseType: 'arraybuffer'});
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        const contentType = response.headers['content-type'];
        return `data:${contentType};base64,${base64}`;
    }


    const show = () => {
        notification = render();
        notification.once('ready-to-show', () => {
            if (!needDownloadIcon) {
                notification.show()
            }
            setTimeout(() => {
                close();
            }, duration * 1.1)
        });
        if (needDownloadIcon) {
            downloadIconAsBase64(icon).then((base64) => {
                icon = base64;
            }).finally(() => {
                notification.webContents.send('set-meta', {
                    content: {
                        title: title,
                        description: message,
                        icon: icon,
                        type: type,
                    },
                    style: {
                        maxLength: width,
                    },
                    lifeTime: duration,
                    index: index,
                });
                notification.show()
            });
        }
    };

    const render = () => {
        const notifyWindow = new BrowserWindow({
            width: width,
            height: height,
            x: x,
            y: y,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            skipTaskbar: true,
            resizable: false,
            movable: false,
            focusable: false,
            show: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            }
        });
        notifyWindow.loadFile(path.join(__dirname, '/../templates/default.html'));
        notifyWindow.on('closed', () => {
            onClose()
        });
        return notifyWindow;
    }

    const close = () => {
        if (!notification.isDestroyed()) {
            notification.close()
        }
    }

    return notification;
}

export default NotificationBase;

