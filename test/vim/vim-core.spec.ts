import { describe, expect, test } from "vitest";
import { cloneDeep } from "../../src/common/modules/cloneDeep";
import {
  Cursor,
  QueueInputReturn,
  VimMode,
} from "../../src/features/vim/vim-types";
import { VimCore } from "../../src/features/vim/vimCore/VimCore";
import {
  findCursor,
  replaceCursorFromRaw,
} from "../common-test/vim-test-setup/vim-test-helpers";
import { TestError, testError } from "../common-test/errors/test-errors";
import { GherkinTestUtil } from "../common-test/gherkin/gherkin-test-util";
import {
  VIM_COMMAND,
  VIM_COMMANDS,
} from "../../src/features/vim/vim-commands-repository";
import { VimStateClass } from "../../src/features/vim/vim-state";

// !! sucrase and ts-jest not able to handle named typed arrays
type TestCaseList = [
  /* testCaseOptions */ TestCaseOptions,
  /* rawContent */ string,
  /* rawInput */ string,
  /* rawColumns */ string,
  // /* rawCommands */ string,
  /* moreAssertions */ MoreTestCaseAssertions?,
];

interface TestCaseOptions {
  focus?: boolean;
}

interface MoreTestCaseAssertions {
  rawLines?: string;
  rawTexts?: string;
  numOfLines?: number;
  previousText?: string;
  mode?: VimMode;
  expectedMode?: VimMode;
  focus?: boolean;
}

const RAW_SPLIT = ";";

let initialCursor: Cursor;
let vim: VimCore;
let manyQueuedInput: QueueInputReturn[] = [];

/* prettier-ignore */
let testCaseAsList: TestCaseList[] = [
    //    , 'rawContent'     , 'rawInput'    , 'rawColumns'     ,
    //[ {}  , '|012 456'       , 'b'           , '0'            , ]                           ,
    //[ {}  , '012 45|6'       , 'b'           , '4'            , ]                           ,
    //[ {}  , '012 45|6'       , 'bb'          , '4;0'          , ]                           ,
    [ {}  , '012\n|456'       , 'bb'          , '0;0'          , ]                           ,
    //[ {}  , '012 |456'       , 'dd'          , '0'            , {rawTexts: ''}]       ,
    //[ {}  , '012 |456\nabc'  , 'dd'          , '0'            , {rawTexts: 'abc'}]       ,
    //[ {}  , '|012 456'       , 'diw'         , '0'            , {rawTexts: '` 456`'}]       ,
    //[ {}  , '|012 456'       , 'e'           , '2'            , ]                           ,
    //[ {}  , '| 12'           , 'e'           , '2'            , ]                           ,
    //[ {}  , '|012 456'       , 'eee'         , '2;6;'         , ]                           ,
    //[ {}  , '012 4|56'       , 'F0'          , '0'            , ]                           ,
    //[ {}  , '012 4|56'       , 'F6'          , '5'            , ]                           ,
    //[ {}  , '|012 456'       , 'f0'          , '0'            , ]                           ,
    //[ {}  , '01|2 456'       , 'f0'          , '2'            , ]                           ,
    //[ {}  , '01|2 456'       , 'f5'          , '5'            , ]                           ,
    //[ {}  , '|012 456'       , 'h'           , '0'            , ]                           ,
    //[ {}  , '01|2 456'       , 'h'           , '1'            , ]                           ,
    //[ {}  , ''               , 'i'           , '0'            , ]                           ,
    //[ {}  , '|foo\nbar'      , 'k'           , '0'            , {rawTexts: 'foo' }]         ,
    //[ {}  , 'foo\n|bar'      , 'k'           , '0'            , {rawTexts: 'foo' }]         ,
    //[ {}  , 'hi\n012 456|'   , 'k'           , '1'            , {rawTexts: 'hi' }]          ,
    //[ {}  , '|foo'           , 'll'          , '1;2'          , {rawTexts: 'foo;'}]         ,
    //[ {}  , '|foo'           , 'lli!'        , '1;2;;3'       , {rawTexts: 'foo;;;fo!o'}]   ,
    //[ {}  , '|foo'           , 'o'           , '0'            , {rawLines: '1', rawTexts: ''}]   ,
    //[ {}  , '012|\nfoo'      , 'o'           , '0'            , {rawLines: '1', rawTexts: ''}]   ,
    //[ {}  , '   |\nfoo'      , 'o'           , '3'            , {rawLines: '1', rawTexts: '   '}]   ,
    //[ {}  , '|012 456'       , 't0'          , '0'            , ]                           ,
    //[ {}  , ''               , 'v'           , '0'            , ]                           ,
    //[ {}  , '012 4|56'       , 'T0'          , '1'            , ]                           ,
    //[ {}  , '012 4|56'       , 'T6'          , '5'            , ]                           ,
    //[ {}  , '01|2 456'       , 't0'          , '2'            , ]                           ,
    //[ {}  , '01|2 456'       , 't5'          , '4'            , ]                           ,
    //[ {}  , '|foo'           , 'r'           , ''             , { rawTexts: 'foo'} ]           ,
    //[ {}  , '|foo'           , 'rs'          , '0'            , { rawTexts: 'soo'} ]           ,
    //[ {}  , '|foo'           , 'rx'          , '0'            , { rawTexts: 'xoo'} ]           ,
    //[ {}  , '|foo\nbar'      , 'u'           , '0'            , {rawLines: '1'              , rawTexts: 'bar'} ]           ,
    //[ {}  , 'foo\n|bar'      , 'u'           , '0'            , {rawLines: '1'              , rawTexts: 'bar'} ]           ,
    //[ {}  , '|hi\n012 456'   , 'uee'         , '0;2;6'        , {rawLines: '1;;'            , rawTexts: '012 456;;'} ]     ,
    //[ {}  , '|hi\n012 456'   , 'ueek'        , '0;2;6;1'      , {rawLines: '1;;;0'          , rawTexts: '012 456;;;hi'} ]  ,
    //[ {}  , '012 456|'       , '^'           , '0'            , ]                           ,
    //[ {}  , '|012 456'       , '$'           , '6'            , ]                           ,
    //[ {}  , '|012 456'       , '<Control>]'  , '4'            , {rawTexts: '`    012 456`'} ]  ,
    //[ {}  , '|012 456'       , '<Control>['  , '0'            , {rawTexts: '012 456'} ]     ,
    //[ {}  , ' |012 456'      , '<Control>['  , '0'            , {rawTexts: '012 456'} ]     ,
    //[ {}  , '|012 456'       , '<Enter>'     , '0'            , {rawLines: '1'              , rawTexts: '012 456'} ]       ,
    //[ {}  , '01|2 456'       , '<Enter>'     , '0'            , {rawLines: '1'              , rawTexts: '2 456'            , previousText: '01'} ]    ,
    //[ {}  , '01|2 456\nabc'  , '<Enter>'     , '0'            , {rawLines: '1'              , rawTexts: '2 456'            , previousText: '01'       , numOfLines: 3} ]  ,
    //[ {}  , '012 456|'       , '<Enter>'     , '0'            , {rawLines: '1'              , rawTexts: ''                 , previousText: '012 456'  , numOfLines: 2} ]  ,
    //[ {}  , ''               , '<Escape>'    , '0'            , {mode: VimMode.INSERT} ]    ,
    //[ {}  , ''               , '<Escape>'    , '0'            , {mode: VimMode.VISUAL} ]    ,
    //// [ {focus: true}  , '012 |456'       , '<Enter><Escape>ku' , '0;0;0;0'      , 'newLine;enterNormalMode;cursorUp;cursorDown', {rawLines: '1;1;0;1'              , rawTexts: '456'                 , previousText: '012 '  , numOfLines: 2} ]  ,
    //[ {focus: false}  , '012 |456'       , '<Enter>ku' , '0;0;0'      , 'newLine;cursorUp;cursorDown', {rawLines: '1;0;1'              , rawTexts: '456'                 , previousText: '012 '  , numOfLines: 2} ]  ,
    //// [ {focus: true}  , '|012'       , '<Delete' , '0'      , 'newLine', {rawLines: '1'              , rawTexts: '456'                 , previousText: '012 '  , numOfLines: 2} ]  ,
    ////    , 'rawContent'     , 'rawInput'    , 'rawCommands'  , 'rawColumns'                                 ,
];
// [ {}  , 'hi\n012 456|'   , 'ku'        , '1'            , 'cursorUp'                                   , {rawTexts: 'hi' }]         , // @todo eeku should leave cursor at last position of below line
// [ {focus:true}  , '    |012 456'       , '<Control>['   , '0'            , 'indentLeft'                                    , {rawTexts: '012 456'} ]    ,

describe.only("Vim input.", () => {
  const focussedTestCases = testCaseAsList.filter(
    (testCase) => testCase[0].focus,
  );

  if (focussedTestCases.length > 0) {
    testCaseAsList = focussedTestCases;
  }

  testCaseAsList.forEach(
    ([
      _testCaseOptions,
      rawContent,
      rawInput,
      rawColumns,
      // rawCommands,
      moreAssertions = {},
    ]) => {
      const {
        expectedMode,
        mode,
        numOfLines,
        previousText,
        rawLines,
        rawTexts,
      } = moreAssertions;
      const rawCommands = "";
      const finalMode = mode ?? VimMode.NORMAL;
      describe(`Letter - ${rawInput[0]}.`, () => {
        describe(`${rawInput} - ${rawCommands}.`, () => {
          test(`Given I activate Vim with the following input: "${rawContent}"`, () => {
            const rawInput = rawContent.split("\n");
            const input = replaceCursorFromRaw(rawInput).map((text) => ({
              text,
            }));

            // If we provide rawContent, then also a cursor
            if (rawContent) {
              initialCursor = findCursor(rawInput);
              const vimState = VimStateClass.create(
                initialCursor,
                cloneDeep(input),
              ).serialize();
              vim = new VimCore({ vimState });
            } else {
              initialCursor = findCursor(rawInput);
              const vimState = VimStateClass.createEmpty().serialize();
              vimState.lines = cloneDeep(input);
              vim = new VimCore({ vimState });
            }
          });

          test(`And I'm in "${finalMode}" mode.`, () => {
            switch (finalMode.toLowerCase()) {
              case "insert": {
                // vim.enterInsertMode();
                vim.executeCommand(VIM_COMMAND.enterInsertMode, "");
                expect(vim.getVimState().mode).toBe(VimMode.INSERT);
                break;
              }
              case "normal": {
                vim.executeCommand(VIM_COMMAND.enterNormalMode, "");
                expect(vim.getVimState().mode).toBe(VimMode.NORMAL);
                break;
              }
              case "visual": {
                vim.executeCommand(VIM_COMMAND.enterVisualMode, "");
                expect(vim.getVimState().mode).toBe(VimMode.VISUAL);
                break;
              }
              default: {
                throw new TestError("Not valid/supported mode");
              }
            }
          });

          test(`When I type "${rawInput}"`, async () => {
            if (["replace"].includes(rawCommands)) {
              return;
            }

            const input = GherkinTestUtil.replaceQuotes(rawInput);

            manyQueuedInput = await vim.queueInputSequence(input);
            // expect(true).toBeFalsy();
          });

          //test(`Then the expected commands should be "${rawCommands}"`, () => {
          //  if (["replace"].includes(rawCommands)) {
          //    return;
          //  }
          //
          //  const conmmands = rawCommands.split(RAW_SPLIT);
          //  expect(conmmands.length).toBe(manyQueuedInput.length);
          //
          //  let expectedCommand = "";
          //  conmmands.forEach((command, index) => {
          //    expectedCommand = memoizeExpected(command, expectedCommand);
          //
          //    theExpectedCommandShouldBe(
          //      manyQueuedInput[index],
          //      expectedCommand,
          //    );
          //    // expect(true).toBeFalsy();
          //  });
          //});

          if (numOfLines !== undefined) {
            test(`there should be "${numOfLines}" lines`, () => {
              expect(
                manyQueuedInput[manyQueuedInput.length - 1].vimState?.lines
                  .length,
              ).toBe(Number(numOfLines));
            });
          }

          // it.skip(`And the cursors should be at line "${
          test(`And the cursors should be at line "${
            rawLines ?? 0
          }" and column "${rawColumns}"`, () => {
            if (["replace"].includes(rawCommands)) {
              return;
            }

            const columns = rawColumns.split(RAW_SPLIT);
            expect(columns.length).toBe(manyQueuedInput.length);

            let expectedColumn;
            // manyQueuedInput; /*?*/
            columns.forEach((column, index) => {
              expectedColumn = memoizeExpected(column, expectedColumn);

              expect(manyQueuedInput[index]?.vimState?.cursor.col).toEqual(
                Number(expectedColumn),
              );
            });

            if (!(rawLines ?? "")) return;

            const lines = rawLines?.split(RAW_SPLIT);
            expect(lines?.length).toBe(manyQueuedInput.length);
            let expectedLine;
            lines?.forEach((line, index) => {
              expectedLine = memoizeExpected(line, expectedLine);
              expect(manyQueuedInput[index]?.vimState?.cursor.line).toEqual(
                Number(expectedLine),
              );
            });
          });

          if (rawTexts !== undefined) {
            // it.skip(`And the texts should be "${rawTexts}"`, () => {
            test(`And the texts should be "${rawTexts}"`, () => {
              if (["replace"].includes(rawCommands)) {
                return;
              }

              const rawTextsSplit = rawTexts.split(RAW_SPLIT);

              let lastExpectedText = "";
              rawTextsSplit.forEach((rawText, index) => {
                const text = GherkinTestUtil.replaceQuotes(rawText);
                lastExpectedText = memoizeExpected(text, lastExpectedText);

                const asClass = new VimStateClass(
                  manyQueuedInput[index]?.vimState,
                );
                const activeLine = asClass.getActiveLine();
                expect(activeLine?.text).toBe(lastExpectedText);
              });
            });
          }

          if (previousText !== undefined) {
            test(`And the previous line text should be "${previousText}"`, () => {
              const previousLine =
                manyQueuedInput[manyQueuedInput.length - 1].vimState?.lines[
                  initialCursor.line
                ];
              expect(previousLine?.text).toBe(previousText);
            });
          }

          // Modes
          if (expectedMode !== undefined) {
            test(`And I should go into "${expectedMode}" mode`, () => {
              switch (mode?.toLocaleLowerCase()) {
                case "insert": {
                  expect(vim.getVimState().mode).toBe(VimMode.INSERT);
                  break;
                }
                case "normal": {
                  expect(vim.getVimState().mode).toBe(VimMode.NORMAL);
                  break;
                }
                case "visual": {
                  expect(vim.getVimState().mode).toBe(VimMode.VISUAL);
                  break;
                }
                default: {
                  throw new TestError("Not valid/supported mode");
                }
              }
            });
          }
        });
      });
    },
  );
});

function theExpectedCommandShouldBe(
  expectedInput: QueueInputReturn,
  rawCommand: string,
) {
  const command = GherkinTestUtil.replaceQuotes(rawCommand) as VIM_COMMAND;

  verifyCommandsName(command);

  expect(expectedInput.targetCommand).toBe(command);
}

/**
 * Better DX: allow sth like "foo;;,bar"
 */
function memoizeExpected(input: string, expected: string) {
  if (input === "") {
    // use expected
  } else if (expected !== input) {
    expected = input;
  } else if (input === undefined) {
    testError.log("Expected results and inputs not equal");
  }

  return expected;
}

function verifyCommandsName(command: VIM_COMMAND) {
  const isValid = VIM_COMMANDS.includes(command);

  if (!isValid) {
    // testError.log(`Command not in list, was: >> ${command} <<.`);
    throw new TestError(`Command not in list, was: >> ${command} <<.`);
  }

  return true;
}
