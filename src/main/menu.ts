import { Menu, BrowserWindow, app } from 'electron';
import { getRecentFiles } from './recentFiles';
import { handleNewBoard, handleOpenBoard, handleOpenRecentPath } from './ipcHandlers';

export async function buildMenu(mainWindow: BrowserWindow): Promise<Menu> {
  const recentFiles = await getRecentFiles();

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Board',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            handleNewBoard(mainWindow);
          },
        },
        {
          label: 'Open Board',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            handleOpenBoard(mainWindow);
          },
        },
        { type: 'separator' },
        {
          label: 'Recent Boards',
          submenu: recentFiles.length > 0
            ? recentFiles.map((entry) => ({
                label: entry.boardName,
                click: () => {
                  handleOpenRecentPath(mainWindow, entry.filePath);
                },
              }))
            : [{ label: 'No recent boards', enabled: false }],
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}

export async function refreshMenu(mainWindow: BrowserWindow): Promise<void> {
  const menu = await buildMenu(mainWindow);
  Menu.setApplicationMenu(menu);
}
