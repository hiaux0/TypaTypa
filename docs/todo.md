# Goals

- practice english
  - by typing each word
    - improve typing speed
    - improve grammar
    - enhance recall of words
- Grid
  - be able to create a diary

# Think about
## contenteditable vs input
- contenteditable
  - annoying to deal with white spaces
  + directly edit text without much processing?
    + handles new lines
  - <span class="bruh-line" contenteditable="">h<br>i</span>
    - note the "br", when I enter
      - this messes with new lines and repeat.for

- input
  - need to handle new line case

- textarea
  - no weird dom interaction?

# Ideas
- [ ] step by step (manual) model fine tuning
  1. each row represents a step in how I would fine-tune a prompt
  2. Example: "Extract tags from a link"
    1. Provide link in a cell
    2. right to it, the ai generates tags
    3. next row, adjust the prompt
    4. repeat 1.-3.
  - diff view

# Acceptance criteria
- Use contenteditable
    Reasons
        - use existing browser implementation
        - can help with clipboard permissions
        - supports Vietnamese out of the box (composition event)
    - Use DIV
        - keeps the elements
        - SPAN inserts <BR>
        - BUT
            - within DIV, <BR>s can still occur
- Have highlighting update correctly
    - Means, to re-highlight on every keystroke
    - HAVE to accept constant re-rendering?
        - [ ] Performance impact

- Have internal vim code be aware of the lines
    - parse HTML to array of lines
        - Start: Normal = JS 
        - Enter Insert = HTML
        - Edit in Insert = HTML
        - Escape to Normal = HTML -> JS
        - Back to Normal = JS
                         = HTML repeat.for from JS

- LETS ACCEPT RERENDERING for now

# Todo

- [ ] autocomplete: add 110/110, on type 65/110 in input

## Typing

- ui
  - [ ] make background darker when drawer open
- data
  - [ ] reduce size of dictionary data
    - [ ] filter out a list of all words
      - one way to reduce the size, is by removing really rare words
- dictionary
  - [ ] if no meaning, then check syn and deduce singular form
    - inspections -> no meaning obj, but syn
      - inspection -> okay
  - [ ] if no hit, then search for similar
  - [ ] Use another dic <<<<<<<
- intro
  - [ ] have typing text be an intro
- keyboard
  - [ ] support backspace in typing-container
- setting
  - not random words, but as the text is
- topics
  - [ ] fix(topics):
  - [ ] topics: ctrl+v global -> add into "unsorted" topic
- typing
  - [ ] loop

## Vim

- [ ] refac:
- [ ] refac: don't just merge custom mappings,
  - but somehow mark them as custom
  - so, that they don't trigger the default implementations
    - maybe make that optional
- [ ] refac: fuse mappings [VimMode.Normal]: <commandName> and object
  - helps to reduce ambiguity, and know in ONE place, which keys are assigned
- [ ] refac: mapping-- `new KeyMappingService().init(` should be in `initVim`
- [ ] c-o, c-i
  - remember cursor positions
  - across files
- how to fix insert and normal mode, make it better and simplier
```
hello darkness my old friend
this time we are showing you
it has all I need to write content
BUT, what about formatting?
I want to have live-editor
## Heading
**bold**
```
  - --> probably mulitple input elements, and up and down moves between them
    - [ ]  think about difference between grid based and editor based
      - grid: per cell, cell can have editor inside
      - editor: contained inside grid
- [ ] bug: e: not putting cursor at 4
    vimState.lines = [{ text: "0123" }, { text: "4 6789" }];
    vimState.cursor = { line: 0, col: 3 };

## Errors
- Uncaught (in promise) TypeError: vimState.lines[line] is undefined
    convertOffsetToVimStateCursor VimHelper.ts:102

## Grid

- [ ] feat:
- [ ] feat: cells----
- [ ] feat: panels---
- [ ] feat: toolbar--

- [ ] feat: pro cons
- [ ] feat: tables
- [ ] feat: panels--- when escaping out of panel should put cursor in top left corner
- [ ] feat: panels--- "o" to switch from top left to bottom right corner, when under a panle
- [ ] feat: panels--- use shortcuts to move between panels
  - 2. this is lower prio
    - or by hjkl?
- [ ] feat: panels--- grouping-- create groups for panels
- [ ] feat: panels--- toolbar--- mini toolbar for panels
- [ ] feat: calendar
- [ ] feat: selection should include panels
- [ ] feat: toolbar-- layout edit mode

- [ ] feat: cells---- merge cells
- [ ] bug:
- [ ] feat:
- [ ] refac:

- [ ] todo shadcn componetns
  - [ ] Accordion
  - [ ] Alert
  - [ ] Alert Dialog
  - [ ] Aspect Ratio
  - [ ] Avatar
  - [ ] Badge
  - [ ] Breadcrumb
  - [x] Button
  - [ ] Calendar
  - [ ] Card
  - [ ] Carousel
  - [ ] Chart
  - [ ] Checkbox
  - [ ] Collapsible
  - [ ] Combobox
  - [ ] Command
  - [ ] Context Menu
  - [ ] Data Table
  - [ ] Date Picker
  - [ ] Dialog
  - [ ] Drawer
  - [ ] Dropdown Menu
  - [ ] Form
  - [ ] Hover Card
  - [ ] Input
  - [ ] Input OTP
  - [ ] Label
  - [ ] Menubar
  - [ ] Navigation Menu
  - [ ] Pagination
  - [ ] Popover
  - [ ] Progress
  - [ ] Radio Group
  - [ ] Resizable
  - [ ] Scroll Area
  - [ ] Select
  - [ ] Separator
  - [ ] Sheet
  - [ ] Sidebar
  - [ ] Skeleton
  - [ ] Slider
  - [ ] Sonner
  - [ ] Switch
  - [ ] Table
  - [ ] Tabs
  - [ ] Textarea
  - [ ] Toast
  - [ ] Toggle
  - [ ] Toggle Group
  - [ ] Tooltip

- [ ] feat: quick way to add unknown words hedonic
- [ ] feat: reader mode, bottom to top
  - bg: jump to the bottom to get summary and gist
    - only then start to read "up"
- [ ] feat: sidebar, when highlight
- [ ] feat: grid: todo cell
- [ ] feat: grid: inline lookup / definition / comments / notes
- [ ] feat: add custom column name
  - Col8 = vocab for Col6
- [ ] fix: grid: >> and undo redo
- [ ] feat: search
- [ ] feat: grid----- vim ------ after paste, show completions, for recent pastes
  - then can choose one, and it could be replaced
    - replace by 1.undo 2. redo with additional args, or, replaced text
- [ ] refac: improve cell selection and scroll position (scrollTop, scrollLeft); eg. autoscroll to right cell
  - convert columns/rows into lines, and update cell coords based on vimState
- [ ] fix: resize and overflow resets to cell_width
- [ ] feat: navigation (e, b) scrolls to cell
  - [ ] add method scrollTo, that only scroll, when out of view port
    - for this, check `scrollEditor`, but make it take coords
      - set the cell first, so we can query `.selected-cell` elements for their x,y?
        - this makes it more dependent on html (cf. measureText)
- [ ] feat: quickly toggle settings
- [ ] fix: grid: paste: newlines or white space at start should be reduced (when copying code blocks)
- [ ] E
  - [x] until cell with no content
  - [ ] if no overflow, then until next empty cell 
- [ ] space+o
- [ ] fix highlight in visual mode, with mulitple cells class="cell selected-cell"
  - problem: overflown cell
- [ ] fix: grid: highlight overflow in cell more to the right not same as to the left
  - should be adjusted properly
    current position - screenRight
- [ ] feat: grid: hide overflow
  - ? how to handle wrapped lines "within a line"?
    - maybe have the VimLine text prop, also be an array?
      - so I can navigate with vim motions
- [ ] feat: grid: join (J), if below line is empty, than delete it
- [ ] feat: grid: how to invoke settings on specific cells
  - eg. this cell has this settings, how to change the settings of everything involved with this cell?
- [ ] feat: grid: highlight text, then be able to hide other text
- [ ] feat: grid: flash previous selected cell, when moving multiple cells at once
  - bg: sometimes lose the reading position, when scrolling to many rows
  - idea: blink a short second, where the old cell was scrolled to (the top)
- [ ] feat: status line
  - mode, commands
- [ ] feat: command: "Delete new lines in column"
  - in the command palette have fields to change options
- [ ] feat: cell: restrict cell width to maxWidth
  - so wide cells not too hard to read
- [ ] feat: when generated content comes in, make it appear on top of a cell, then be able to move around and press enter
  - so that the cell gets the content
  - if content already present, then move existing content (where?)
- [ ] fix: cannot escape from visual mode
- [ ] fix undo redo (again)
- [ ] add rows button
- [ ] // const startingMode = text ? VimMode.NORMAL : VimMode.INSERT; // TODO, properly init cursor
- [ ] macros
  - save sequence in array
  - letter registers
- [ ] cell type: timestamp
- [ ] feat: functions: =AUDIO('start', A0)

# Done
## Grid

- [x] html cell button
- [x] feat: grid: multi-row cells
- [x] feat: command palette: recent
- [x] bug: overflow vertical not showing (only hori)
- [x] bug: fix undo redo
- [x] vimeditor
- [x] feat: ui styling
- [x] feat: grid: overflow cells, but leave a cell margin left
  - bg: overflow cut off, but hard to read with the cell on the right
  - idea: leave some cells to the left empty
- [x] b scroll
- [x] fix: grid: onInputWidthChanged, has scrollbar -> should auto increase cell
- [x] feat: grid: zz
- [x] feat: prevent 'repearCommand' for navigation
- [x] refac: grid----- vim ------ use existing vimCore logic --> no, because lines and cell behave differently
  - eg. {} on grid, will not work on lines of text
    - I would like to only move along columns, but the vimCore logic only operates on rows
    - [x] THOUGH, I could always invoke a new vimInstance?
- [x] overflowww
- [x] fix: grid: // TODO partial completion like the terminal
- [x] change width on autocomplete partial accept
- [x] bug: new cell, does not add Cell obj
- [x] bug: textarea input out of place
  - [x] bug: fix layout of col and row and css uuugh
  - [x] bug: enter edit mode, should show all 2024-10-14 11:41
  - [x] bug: autoexpand when typing
  - [x] bug: initial width vs colHeaderWidth
- [x] bug: col header width adjust does not gets saved --> did not enable autosave
- [x] feat: upload state
- [x] feat: dark mode
- [x] bug: overflow and adjusted col widths
  - [x] feat: control grid headers and panels via css variables? (on resize)
    - [x] feat: how to store column width - a width+height map?
- [x] bug: test data with column adjust
  - 01 x P
  - BUG: overflow of 02 wrong
- [x] bug: undo redo on column delete. BUG: does not undo properly
  - 2024-10-12 15:51: cursor movements also gets recorded
  - [x] bug: undo needs to be hit twice
- [x] bug: x should delete whole col, BUG: but clears only first
- [x] feat: click on col, should select whole col
- [x] feat: grid----- overflow: add overflow support
- [x] feat: grid----- overflow: update scrollWidth on content change
- [x] feat: grid----- overflow: ENTER on long content (eg. paste, or typing long)
- [x] feat: grid vim ctrl+x
- [x] feat: {, }
- [x] feat: grid----- vim ------ improve scripting capabilities
  - [x] iterateOverCell
- [x] feat: download state
- [x] feat: <<, >>
- [x] feat: gg, G
- [x] feat: scrolling
  - [x] feat: scrolling -- offset to the top
- [x] feat: cc
- [x] feat: o, O
- [x] feat: dd
- [x] feat: $ and ^
- [x] feat: cells---- typing any character should enter edit mode
- [x] feat: cells---- enter should go into next cell
- [x] feat: save to local storage
- [x] feat: panels--- x and p
- [x] feat: panels--- move mode
- [x] feat: panels--- should autoexpand when textarea also growth
  - check "autoinput?" there is a component or custom attribute
- [x] feat: panels--- add new panel on enter
- [x] bug: cells: selection does not adjust correctl
- [x] bug: cells---- dragging should go into visual mode
- [x] bug: panels--- update coords in `panel` entity after dragging
- [x] feat: panels--- use shortcuts to move between panels
  - 1.
    - <space>pn
    - <space>pp
- [x] feat: panels--- tab should set "active"
- [x] feat: cells--- navigate with shortcuts
- [x] feat: delete panels
- [x] feat: toolbar: add panel at seletion
- [x] feat: snapping
- [x] bug: cannot drag elements in column 0
  - because, event.target not correct
- [x] bug: when dragging panels, and mouse goes over another, then panel being dragged stops
  - IDEA: add mouse events to container
- [x] show coords in top left cell
- [x] bug: dragging a panel inserts a new item --> FIXED: add mouseup to cell
  - the way mouse events are handled
    - cell:
      - mousedown
      - mousemove
      - why over cell? To get the (col,row)
    - container
      - mouseup
  - idea: check the mousedown target
  - [x] spreadsheet like headers
  - [x] rows and columns grid

## Typing

- [x] fix(topics): search bar appears again
- [x] fix(topics): click inside also close
- [x] close on outside click
- [x] look up: add highlight to current word in the history
- [x] "T" Topics
- [x] "R" Remember
- [x] "D" Dictionary
- [x] add button
- [x] hook up "topics" with typing
- [x] "?" should switch to "dictionary" tab
- [x] add search bar
- [x] be able to lookup any words
- [x] show lookup history

## Vim

- [x] fix: merging with same key, should overwrite existing
- [x] feat: vim hydra, eg `<space>pn` `nnn` will repeat `<space>pn`
  - keep track of "last" commandSequence
  - if the last letter is the pressed Key, then repeat?

# On Hold

## Grid

- [ ] feat: resize panels --> partially done via autosize

# Features

- [ ] pass your own text into the app
  - [x] save passed text (convience)
  - [ ] strip out common english words
  - [x] mark words, that you already know
    - [x] with "!"? (or already done via "-"?)
- [x] choose different [topics]
  - [x] add [topics] to texts
- typing
  - [x] "." to skip word
- [ ] en dictionary
  - [x] type "?" to get dictionary defintion
  - [ ] type "!" to ???
  - [x] type "+" to add to words "to learn""
  - [x] type "-" to remove words from "to learn"
- [ ] double click on word to add it to lessons/topics
- [x] help
  - [x] list all shortcuts

# Backlog

    - [ ]  support vn chars
        - https://stackoverflow.com/questions/26543329/java-regex-to-match-vietnamese-chars



```ts
export const keyBindings: KeyBindingModes = {
  normal: [],
  [VimMode.NORMAL]: [
    { key: "<Space>tc", sequence: "^elrx" },
    { key: "<Space>fu", command: VIM_COMMAND.unfoldAll },
    { key: "a", command: VIM_COMMAND.enterInsertAfterMode },
    { key: "cc", command: "clearLine" },

/////////////////

private mappingByCommandName: MappingByCommandName = {
  // @ts-ignore
  [VimMode.NORMAL]: {
    [VIM_COMMAND.cursorLineEnd]: () => {


/////////////////

const mappingByKey = {
  //"<Control>r": () => {
  //  // return true;
  //},
  "<Control>s": () => {
    this.save();
    return true;
  },

```


hello
helmet


# user experiments
validate nang lucwj ngon ngu
- in real life is good, but in academy failed

## task breakdown
- desire to change
  - what do you want to change?
- strategy
  - from goal to application
- practice
  - repeat

1. I want to clean up
  - Why
    - interior
    - cleaniness
  - time
    - how long can you spare for this task
2. strategy
  - work load breakdown
  - goal defintion
    - resources
    - match "dot and lines"
      - powder, sink, sponge
    - step by step
      - spray
      - wait
3. practice
  
- "I want to learn psycholgy"
  - Why?
    - Want to help friends -> healer
  - What in psychology, can you help me?


## How
- leave empty spaces

