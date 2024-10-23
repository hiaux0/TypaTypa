# Goals

- practice english
  - by typing each word
    - improve typing speed
    - improve grammar
    - enhance recall of words
- Grid
  - be able to create a diary

# Todo

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

## Grid

- [ ] feat:
- [ ] feat: cells----
- [ ] feat: panels---
- [ ] feat: toolbar--

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

- [ ] feat: grid: todo cell
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
- [ ] b scroll

# Done
## Grid

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


