import {BrowserWindow, ipcMain, screen} from 'electron'
import axios from 'axios'
import path from 'path'
import {fileURLToPath} from 'url';
import {isValidUrl} from './imageUtil.js';


const NotificationBase = (options) => {

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    let {
        title,
        message,
        icon,
        index,
        type = `info`,
        duration = 5000,
        onClose,
        onCloseCommand,
        onRender,
        needDownloadIcon = false,
        size: {
            width,
            height
        },
        location: {
            x,
            y
        }
    } = options || {};

    let notification = null;

    ipcMain.on('close-notify', (e, i) => {
        onCloseCommand(i);
    });


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
                sendMeta()
                notification.show()
            }
            setTimeout(() => {
                close();
            }, duration * 1.1)
        });
        if (needDownloadIcon && isValidUrl(icon)) {
            downloadIconAsBase64(icon).then((base64) => {
                icon = base64;
            }).finally(() => {
                sendMeta()
                notification.show()
            });
        } else {
            sendMeta()
            notification.show()
        }
    };

    const sendMeta = () => {
        const meta = {
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
        }
        notification.webContents.send('set-meta', meta);
    }

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
        notifyWindow.loadFile(path.join(__dirname, '/templates/default.html'));
        notifyWindow.on('closed', () => {
            onClose(index)
        });
        if ((onRender != null && onRender != undefined)) {
            onRender(notifyWindow);
        }
        return notifyWindow;
    }

    const close = () => {
        if (!notification.isDestroyed()) {
            notification.close()
        }
    }


    return {show, notification};
}

export default NotificationBase;

