import { Menu, app, globalShortcut } from "electron";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";
import path from "path";
// (optional) import { pathToFileURL } from "url";

import { createMainWindow } from "./appMainWindow";
import { UdpProxyOptions } from "./parser/UdpProxy";
import Proxy from "./parser/Proxy";
import { createOverlayServer } from "./overlayServer";
import { registerGlobalShortcuts } from "./globalShortcuts";
import { menu } from "./menu";
import { addIpcListeners } from "./listeners";

const initProxy = (): Proxy => {
  const proxyOptions: UdpProxyOptions = {
    remoteAddress: "74.208.130.140",
    remotePort: 2593,
    localAddress: "0.0.0.0",
    localPort: 53535,
  };

  return new Proxy(proxyOptions);
};

let proxy: Proxy;

app.on("ready", async () => {
  Menu.setApplicationMenu(menu);

  // Only needed for dev (it wires up the dev server)
  if (isDev) {
    await prepareNext("./renderer");
  }

  const mainWindow = createMainWindow();

  if (isDev) {
    mainWindow.webContents.openDevTools();
    await mainWindow.loadURL("http://localhost:8000/");
  } else {
    const indexHtml = path.join(__dirname, "../renderer/out/index.html");
    await mainWindow.loadFile(indexHtml);

    // Alternative (also fine):
    // const indexUrl = pathToFileURL(indexHtml).toString();
    // await mainWindow.loadURL(indexUrl);
  }

  proxy = initProxy();
  await createOverlayServer();

  registerGlobalShortcuts();
  addIpcListeners();
});

app.on("window-all-closed", app.quit);
app.on("will-quit", () => globalShortcut.unregisterAll());

export const getProxy = (): Proxy => proxy;
