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

- [ ] refac: mapping-- `new KeyMappingService().init(` should be in `initVim`

## Grid

- [ ] feat:
- [ ] feat: cells----
- [ ] feat: panels---
- [ ] feat: toolbar--

- [ ] feat: panels--- when escaping out of panel should put cursor in top left corner
- [ ] feat: panels--- "o" to switch from top left to bottom right corner, when under a panle
  - check "autoinput?" there is a component or custom attribute
- [ ] feat: panels--- use shortcuts to move between panels
  - 2. this is lower prio
    - or by hjkl?
- [ ] feat: save to local storage
- [ ] feat: panels--- grouping-- create groups for panels
- [ ] feat: panels--- toolbar--- mini toolbar for panels
- [ ] feat: selection should include panels
- [ ] feat: toolbar-- layout edit mode
- [ ] feat: control grid headers and panels via css variables? (on resize)
  - [ ] feat: how to store column width - a width+height map?
- [ ] feat: resize panels
- [ ] feat: calendar
- [ ] bug:

# Done
## Grid

- [x] feat: panels--- move mode
- [x] feat: panels--- should autoexpand when textarea also growth
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
