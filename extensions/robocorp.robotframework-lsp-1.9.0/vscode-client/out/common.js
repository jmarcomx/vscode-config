"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceFolderForUriAndShowInfoIfNotFound = exports.debounce = void 0;
const vscode_1 = require("vscode");
const channel_1 = require("./channel");
const debounce = (func, wait) => {
    let timeout;
    return function wrapper(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
exports.debounce = debounce;
function getWorkspaceFolderForUriAndShowInfoIfNotFound(uri) {
    const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(uri);
    if (workspaceFolder === undefined) {
        const folders = [];
        for (let ws of vscode_1.workspace.workspaceFolders) {
            folders.push(ws.uri.toString());
        }
        channel_1.OUTPUT_CHANNEL.appendLine(`${uri} is not found as being inside any workspace folder (${folders.join(", ")}).`);
    }
    return workspaceFolder;
}
exports.getWorkspaceFolderForUriAndShowInfoIfNotFound = getWorkspaceFolderForUriAndShowInfoIfNotFound;
//# sourceMappingURL=common.js.map