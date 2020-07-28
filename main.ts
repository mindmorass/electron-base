import { app, BrowserWindow, screen, Menu } from 'electron';
import { MainProcessAutoUpdateService } from './main-process/core/services/auto-update/auto-update.service';
import { MainProcessSecurity } from './main-process/core/security';
import { MainProcessNotificationService } from './main-process/core/services/notifications/notifications.service';
import { MainProcessConfigService } from './main-process/core/services/config/config.service';
import { MainProcessMenu } from './main-process/core/menu';
import { MainProcessLogsService } from './main-process/core/services/logs/logs.service';
import { MainProcessWebrequestsService } from './main-process/core/services/webrequests/webrequests.service';
import { MainProcessAwsCliService } from './main-process/core/services/aws-cli/aws-cli.service';
import { MainProcessAwsStsService } from './main-process/core/services/aws-sts/aws-sts.service';
import { MainProcessAwsIamService } from './main-process/core/services/aws-iam/aws-iam.service';

import { ipcMain } from 'electron-better-ipc';
import * as path from 'path';
import * as url from 'url';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');
const notificationService = new MainProcessNotificationService();
const webrequest = new MainProcessWebrequestsService();
const loggingService = new MainProcessLogsService();
const awsCliService = new MainProcessAwsCliService();
const awsStsService = new MainProcessAwsStsService();
const awsIamService = new MainProcessAwsIamService();

webrequest.listen();
notificationService.listen();
awsCliService.listen();
awsStsService.listen();
awsIamService.listen();

function createWindow(): BrowserWindow {
  const onlineStatusWindow = new BrowserWindow({ width: 0, height: 0, show: false });
  const security = new MainProcessSecurity();
  const configService = new MainProcessConfigService();
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;
  const winWidth = configService.read('app.window.width', size.width);
  const winHeight = configService.read('app.window.height', size.height);
  const winX = configService.read('app.window.position.x_coords', 0);
  const winY = configService.read('app.window.position.y_coords', 0);

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: winWidth,
    height: winHeight,
    webPreferences: {
      spellcheck: true,
      nodeIntegration: true,
      webviewTag: false,
      allowRunningInsecureContent: (serve) ? true : false,
    },
  });

  win.setPosition(winX, winY);

  // initialize main electron services from electron/main-service libraries

  security.contentSecurityPolicy();

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });

    win.loadURL('http://localhost:4200');

    onlineStatusWindow.loadURL('http://localhost:4200/online-status.html');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));

    onlineStatusWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/online-status.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  ipcMain.on('online-status-changed', (_, status) => {
    win.webContents.send('online-status-service', status);
  });

  ipcMain.answerRenderer('developer-tools', async action => {
    switch (action) {
      case 'toggle':
        win.webContents.toggleDevTools();
        break; 
      case 'off':
        win.webContents.closeDevTools();
        break; 
      case 'on':
        win.webContents.openDevTools();
        break; 
    }

    return win.webContents.isDevToolsOpened();
  });

  if (serve) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  win.on('move', () => {
    const currentPosition = win.getPosition();
    configService.write('app.window.position.x_coords', currentPosition[0]);
    configService.write('app.window.position.y_coords', currentPosition[1]);
  });

  win.on('resize', () => {
    const currentSize = win.getSize();
    configService.write('app.window.width', currentSize[0]);
    configService.write('app.window.height', currentSize[1]);
  });

  const update = new MainProcessAutoUpdateService(win);
  update.watchForUpdates();
  
  return win;
}

try {

  app.allowRendererProcessReuse = true;
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    const menu = new MainProcessMenu(win);
    const template: object[] = menu.getTemplate(app);

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    setTimeout(createWindow, 400)
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  loggingService.logEvent(e);
  // Catch Error
  // throw e;
}
