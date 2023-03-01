"use strict";
/*
Original work Copyright (c) rust-analyzer (MIT/Apache 2)
See ThirdPartyNotices.txt in the project root for license information.
All modifications Copyright (c) Robocorp Technologies Inc.
All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License")
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http: // www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySnippetTextEdits = exports.applySnippetWorkspaceEdit = void 0;
// From: https://github.com/rust-lang/rust-analyzer/blob/master/editors/code/src/snippets.ts
const vscode = require("vscode");
const channel_1 = require("./channel");
async function applySnippetWorkspaceEdit(edit) {
    if (edit.entries().length === 1) {
        const [uri, edits] = edit.entries()[0];
        const editor = await editorFromUri(uri);
        if (editor) {
            await applySnippetTextEdits(editor, edits);
        }
        return;
    }
    for (const [uri, edits] of edit.entries()) {
        const editor = await editorFromUri(uri);
        if (editor) {
            await editor.edit((builder) => {
                for (const indel of edits) {
                    if (!parseSnippet(indel.newText)) {
                        channel_1.OUTPUT_CHANNEL.appendLine(`bad ws edit: snippet received with multiple edits: ${JSON.stringify(edit)}`);
                    }
                    builder.replace(indel.range, indel.newText);
                }
            });
        }
    }
}
exports.applySnippetWorkspaceEdit = applySnippetWorkspaceEdit;
async function editorFromUri(uri) {
    if (vscode.window.activeTextEditor?.document.uri !== uri) {
        // `vscode.window.visibleTextEditors` only contains editors whose contents are being displayed
        await vscode.window.showTextDocument(uri, {});
    }
    return vscode.window.visibleTextEditors.find((it) => it.document.uri.toString() === uri.toString());
}
async function applySnippetTextEdits(editor, edits) {
    const selections = [];
    let lineDelta = 0;
    await editor.edit((builder) => {
        for (const indel of edits) {
            const parsed = parseSnippet(indel.newText);
            if (parsed) {
                const [newText, [placeholderStart, placeholderLength]] = parsed;
                const prefix = newText.substr(0, placeholderStart);
                const lastNewline = prefix.lastIndexOf("\n");
                const startLine = indel.range.start.line + lineDelta + countLines(prefix);
                const startColumn = lastNewline === -1
                    ? indel.range.start.character + placeholderStart
                    : prefix.length - lastNewline - 1;
                const endColumn = startColumn + placeholderLength;
                selections.push(new vscode.Selection(new vscode.Position(startLine, startColumn), new vscode.Position(startLine, endColumn)));
                builder.replace(indel.range, newText);
            }
            else {
                builder.replace(indel.range, indel.newText);
            }
            lineDelta += countLines(indel.newText) - (indel.range.end.line - indel.range.start.line);
        }
    });
    if (selections.length > 0) {
        editor.selections = selections;
    }
    if (selections.length === 1) {
        editor.revealRange(selections[0], vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    }
}
exports.applySnippetTextEdits = applySnippetTextEdits;
function parseSnippet(snip) {
    const m = snip.match(/\$(0|\{0:([^}]*)\})/);
    if (!m) {
        return undefined;
    }
    const placeholder = m[2] ?? "";
    if (m.index == null) {
        return undefined;
    }
    const range = [m.index, placeholder.length];
    const insert = snip.replace(m[0], placeholder);
    return [insert, range];
}
function countLines(text) {
    return (text.match(/\n/g) || []).length;
}
//# sourceMappingURL=snippet.js.map