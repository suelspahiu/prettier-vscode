import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { Prettier, ParserOption } from '../src/types';
const prettier = require('prettier') as Prettier;
// import * as PrettierVSCode from '../src/extension';

const EXT_PARSER: { [ext: string]: ParserOption } = {
    css: 'postcss',
    json: 'json',
    ts: 'typescript',
};
/**
 * Compare prettier's output (default settings)
 * with the output from extension.
 * @param file path relative to workspace root
 */
function formatSameAsPrettier(file: string) {
    const absPath = path.join(
        vscode.workspace.rootPath! /* Test are run in a workspace */,
        file
    );
    return vscode.workspace.openTextDocument(absPath).then(doc => {
        const text = doc.getText();
        return vscode.window.showTextDocument(doc).then(
            () => {
                return vscode.commands
                    .executeCommand('editor.action.formatDocument')
                    .then(() => {
                        const prettierFormatted = prettier.format(text, {
                            parser:
                                EXT_PARSER[path.extname(file).slice(1)] ||
                                'babylon',
                        });
                        assert.equal(doc.getText(), prettierFormatted);
                    });
            },
            e => console.error(e)
        );
    });
}

suite('Test format Document', function() {
    test('it formats JavaScript', () =>
        formatSameAsPrettier('formatTest/ugly.js'));
    test('it formats TypeScript', () =>
        formatSameAsPrettier('formatTest/ugly.ts'));
    test('it formats CSS', () => formatSameAsPrettier('formatTest/ugly.css'));
    test('it formats JSON', () => formatSameAsPrettier('formatTest/ugly.json'));
    // one would need to register that language for it to work ...
    // test('it formats GraphQL', () => {
    //     return;
    // });
});
