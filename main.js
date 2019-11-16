const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const { Docker } = require('node-docker-api');

let win;

async function getContainers() {
    const docker = new Docker({ socketPath: '/var/run/docker.sock' });

    let containers = await docker.container.list({ all: true });

    return containers;
}

function createWindow() {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('index.html');

    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

ipcMain.on('get-containers', async (event, args) => {
    event.sender.send('containers-list', await getContainers());
});