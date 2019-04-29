const { globalShortcut, Menu } = require('electron');
const Menubar = require('menubar');

const menubar = Menubar({
    webPreferences: { nodeIntegration: true },
    preloadWindow: true,
    index: `file://${__dirname}/index.html`
});

const secondaryMenu = Menu.buildFromTemplate([
    {
        label: 'Quit',
        click: () => menubar.app.quit(),
        accelerator: 'CmdOrCtrl+Q'
    }
]);

menubar.on('ready', () => {
    console.log('Application is ready.');

    menubar.tray.on('right-click', () =>
        menubar.tray.popUpContextMenu(secondaryMenu)
    );

    const createClipping = globalShortcut.register('CmdOrCtrl+Option+!', () => {
        menubar.window.webContents.send('create-new-clipping');
    });

    const writeClipping = globalShortcut.register('CmdOrCtrl+Option+@', () => {
        menubar.window.webContents.send('write-to-clipboard');
    });

    const publishClipping = globalShortcut.register(
        'CmdOrCtrl+Option+#',
        () => {
            menubar.window.webContents.send('publish-clipping');
        }
    );

    if (!createClipping) console.error('Registration failed', 'createClipping');

    if (!writeClipping) console.error('Registration failed', 'writeClipping');

    if (!publishClipping)
        console.error('Registration failed', 'publishClipping');
});

menubar.on('after-create-window', () => {
    menubar.window.loadURL(`file://${__dirname}/index.html`);
});
