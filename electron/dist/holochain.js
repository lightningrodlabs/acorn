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
exports.StateSignal = exports.runHolochain = exports.prodOptions = exports.devOptions = void 0;
var childProcess = require("child_process");
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
var split = require("split");
// these messages get seen on the splash page
var StateSignal;
(function (StateSignal) {
    StateSignal["IsFirstRun"] = "Welcome to Acorn...";
    StateSignal["IsNotFirstRun"] = "Loading...";
    StateSignal["CreatingKeys"] = "Creating cryptographic keys...";
    StateSignal["RegisteringDna"] = "Registering Profiles DNA to Holochain...";
    StateSignal["InstallingApp"] = "Installing DNA bundle to Holochain...";
    StateSignal["ActivatingApp"] = "Activating DNA bundle...";
    StateSignal["SettingUpCells"] = "Writing first entries to source chain...";
    StateSignal["AddingAppInterface"] = "Attaching API network port...";
    // this one doesn't show to UI, it's
    // used to close the splash screen and launch the main window
    StateSignal["IsReady"] = "IsReady";
})(StateSignal || (StateSignal = {}));
exports.StateSignal = StateSignal;
function stdoutToStateSignal(string) {
    switch (string) {
        case '0':
            return StateSignal.IsFirstRun;
        case '1':
            return StateSignal.IsNotFirstRun;
        // IsFirstRun events
        case '2':
            return StateSignal.CreatingKeys;
        case '3':
            return StateSignal.RegisteringDna;
        case '4':
            return StateSignal.InstallingApp;
        case '5':
            return StateSignal.ActivatingApp;
        case '6':
            return StateSignal.SettingUpCells;
        case '7':
            return StateSignal.AddingAppInterface;
        // Done/Ready Event
        case '8':
            return StateSignal.IsReady;
        default:
            return null;
    }
}
var MAIN_APP_ID = 'main-app';
var COMMUNITY_PROXY_URL = 'kitsune-proxy://SYVd4CF3BdJ4DS7KwLLgeU3_DbHoZ34Y-qroZ79DOs8/kitsune-quic/h/165.22.32.11/p/5779/--';
console.log(__dirname);
var devOptions = {
    datastorePath: '../tmp/databases',
    appId: MAIN_APP_ID,
    appWsPort: 8888,
    adminWsPort: 1234,
    keystorePath: '../tmp/keystore',
    proxyUrl: COMMUNITY_PROXY_URL
};
exports.devOptions = devOptions;
var prodOptions = {
    datastorePath: '../tmp/prod/databases',
    appId: MAIN_APP_ID,
    appWsPort: 8889,
    adminWsPort: 1235,
    keystorePath: '../tmp/prod/keystore',
    proxyUrl: COMMUNITY_PROXY_URL
};
exports.prodOptions = prodOptions;
var constructOptions = function (options) {
    return [
        '--app-id',
        options.appId,
        '--app-ws-port',
        options.appWsPort.toString(),
        '--admin-ws-port',
        options.adminWsPort.toString(),
        '--keystore-path',
        options.keystorePath,
        '--proxy-url',
        options.proxyUrl,
        options.datastorePath,
    ];
};
var runHolochain = function (emitter, options) { return __awaiter(void 0, void 0, void 0, function () {
    var optionsArray, holochainHandle;
    return __generator(this, function (_a) {
        optionsArray = constructOptions(options);
        holochainHandle = childProcess.spawn("../binaries/acorn", optionsArray);
        return [2 /*return*/, new Promise(function (resolve, reject) {
                // split divides up the stream line by line
                holochainHandle.stdout.pipe(split()).on('data', function (line) {
                    console.log(line);
                    var checkIfSignal = stdoutToStateSignal(line);
                    if (checkIfSignal === StateSignal.IsReady) {
                        resolve();
                    }
                    else if (checkIfSignal !== null) {
                        emitter.emit('status', checkIfSignal);
                    }
                });
                holochainHandle.stdout.on('error', function (e) {
                    console.log(e);
                    // reject()
                });
                holochainHandle.stderr.on('data', function (e) {
                    console.log(e.toString());
                    // reject()
                });
            })];
    });
}); };
exports.runHolochain = runHolochain;
//# sourceMappingURL=holochain.js.map