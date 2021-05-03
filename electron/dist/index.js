"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var events_1 = require("events");
var electron_1 = require("electron");
var path = require("path");
var holochain_1 = require("./holochain");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    electron_1.app.quit();
}
var BACKGROUND_COLOR = '#fbf9f7';
var BINARY_PATH = '../binaries/acorn';
var createMainWindow = function () {
    // Create the browser window.
    var mainWindow = new electron_1.BrowserWindow({
        height: 1080,
        width: 1920,
        show: false,
        backgroundColor: BACKGROUND_COLOR
    });
    // and load the index.html of the app.
    if (electron_1.app.isPackaged) {
        mainWindow.loadFile(path.join(__dirname, '../../web/dist/index.html'));
    }
    else {
        // development
        mainWindow.loadURL('http://localhost:8080');
    }
    // once its ready to show, show
    mainWindow.once('ready-to-show', function () {
        mainWindow.show();
    });
    return mainWindow;
};
var createSplashWindow = function () {
    // Create the browser window.
    var splashWindow = new electron_1.BrowserWindow({
        height: 450,
        width: 800,
        center: true,
        resizable: false,
        frame: false,
        show: false,
        backgroundColor: BACKGROUND_COLOR,
        // use these settings so that the ui
        // can listen for status change events
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    });
    // and load the splashscreen.html of the app.
    splashWindow.loadFile(path.join(__dirname, '../../web/dist/splashscreen.html'));
    // once its ready to show, show
    splashWindow.once('ready-to-show', function () {
        splashWindow.show();
    });
    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
    return splashWindow;
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', function () { return __awaiter(void 0, void 0, void 0, function () {
    var splashWindow, events, opts, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                splashWindow = createSplashWindow();
                events = new events_1.EventEmitter();
                events.on('status', function (details) {
                    splashWindow.webContents.send('status', details);
                });
                opts = electron_1.app.isPackaged ? holochain_1.prodOptions : holochain_1.devOptions;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, holochain_1.runHolochain(events, opts, BINARY_PATH)];
            case 2:
                _a.sent();
                splashWindow.close();
                createMainWindow();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                alert('there was an error while starting holochain');
                console.log(e_1);
                electron_1.app.quit();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});
//# sourceMappingURL=index.js.map