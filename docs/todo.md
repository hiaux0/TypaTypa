
# Goals

- practice english
  - by typing each word
    - improve typing speed
    - improve grammar
    - enhance recall of words

# Todo

## Grid

- [ ] show coords in top left cell
- [ ] bug: snapping
- [ ] bug: when dragging panels, and mouse goes over another, then panel being dragged stops
  - IDEA: add mouse events to container
- [x] bug: dragging a panel inserts a new item --> FIXED: add mouseup to cell
  - the way mouse events are handled
    - cell:
      - mousedown
      - mousemove
      - why over cell? To get the (col,row)
    - container
      - mouseup
  - idea: check the mousedown target
- [ ] control grid panels via css variables?
- [ ] how to store column width - a width+height map?


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

# Done

- grid test
  - [x] spreadsheet like headers
  - [x] rows and columns grid

- Typing
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
