//TODO: Non-intersecting yellow letters are only available in that word.
// So each word needs its own avail letters where this is accounted for. 

let solveButtonElem = document.querySelector('#solve-button')
solveButtonElem.addEventListener('click', updateGame)
window.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && solveButtonElem.style.display != 'none') {
        updateGame
    }
})

// Initialize gameboard and letters
const gameboardElem = document.querySelector('#gameboard')
const originalDictionary = completeDictionary

let rows = []
let colors = []

// Presets
const deluxePresetRows = [
    ['A', 'T', 'B', 'G', 'R', 'N', 'E'],
    ['R', ' ', 'I', ' ', 'G', ' ', 'M'],
    ['O', 'I', 'E', 'R', 'D', 'A', 'D'],
    ['O', ' ', 'E', ' ', 'L', ' ', 'Y'],
    ['I', 'S', 'D', 'U', 'C', 'A', 'R'],
    ['E', ' ', 'L', ' ', 'O', ' ', 'A'],
    ['E', 'N', 'R', 'V', 'L', 'M', 'L']
]

const deluxePresetColors = [
    ['yellow', 'gray', 'green', 'yellow', 'green', 'gray', 'yellow'],
    ['gray', ' ', 'gray', ' ', 'gray', ' ', 'gray'],
    ['green', 'yellow', 'green', 'green', 'green', 'gray', 'green'],
    ['gray', ' ', 'yellow', ' ', 'gray', ' ', 'yellow'],
    ['green', 'gray', 'green', 'green', 'green', 'gray', 'green'],
    ['yellow', ' ', 'yellow', ' ', 'gray', ' ', 'gray'],
    ['gray', 'gray', 'green', 'gray', 'green', 'yellow', 'yellow']
]

const presetRows = [
    ['P', 'T', 'R', 'R', 'O'],
    ['A', ' ', 'I', ' ', 'E'],
    ['I', 'D', 'E', 'P', 'A'],
    ['E', ' ', 'D', ' ', 'L'],
    ['R', 'L', 'N', 'L', 'Y']
]

const presetColors = [
    ['green', 'gray', 'yellow', 'gray', 'green'],
    ['gray', ' ', 'gray', ' ', 'gray'],
    ['yellow', 'yellow', 'green', 'yellow', 'yellow'],
    ['green', ' ', 'gray', ' ', 'green'],
    ['green', 'gray', 'gray', 'gray', 'green']
]

// Toggle Deluxe mode
let urlParams = new URLSearchParams(window.location.search)

let waffleElem = document.querySelector('#waffle')
waffleElem.addEventListener('click', toggleWaffle)

function toggleWaffle() {

    if (urlParams.get('deluxe') === "1") {
        window.location.href = window.location.href.replace('?deluxe=1', '');
    } else {
        window.location.href += '?deluxe=1';
    }
}

if (urlParams.get('deluxe')) {
    rows = deluxePresetRows
    colors = deluxePresetColors
} else {
    rows = presetRows
    colors = presetColors
}

// Global functions

// Transpose array of arrays
function transpose(rows) {
    return rows[0].map((_, colIndex) => rows.map(row => row[colIndex]));
}

// Function to generate unique letters to filter original dictionary
function returnUniqueLetters(rows) {
    let letters = []
    for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < rows[i].length; j++) {
            letters.push(rows[i][j])
        }
    }
    return [...new Set(letters)]
}

// Filter dictionary to only include words that can be made with the letters in the puzzle
function createFilteredDictionary(dictionary, uniqueLetters, rows) {
    let newDictionary = dictionary.filter(word => word.length === rows.length)
    console.log(newDictionary.length + ' words in original dictionary')
    newDictionary = newDictionary.filter(word => {
        let wordLetters = [...word.split('')]
        for (let letter of wordLetters) {
            if (!uniqueLetters.includes(letter)) {
                return false
            }
        }
        return true
    })
    console.log(newDictionary.length + ' words in filtered dictionary')
    return newDictionary
}

// Generate letters with data
function createLetterObjects(rows, colors, isTransposed, words, isGameboard) {
    let theseWords = []
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i]
        if (row.includes(' ') && !isGameboard) {
            continue
        }
        let word = []
        for (let j = 0; j < row.length; j++) {
            let letter = row[j]
            let letterObj = {
                letter: letter,
                word: row.join(''),
                rowIndex: isTransposed ? j : i,
                colIndex: isTransposed ? i : j,
                wordIndex: words.length,
                letterIndex: j,
                isIntersecting: j % 2 === 0 ? true : false,
                color: colors[i][j]
            }
            word.push(letterObj)
        }
        let wordObj = {
            letters: word,
            word: row.join(''),
            isSolved: false,
            dictionary: filteredDictionary,
        }
        if (isGameboard) {
            theseWords.push(wordObj)
        } else {
            words.push(wordObj)
        }
    }
    if (isGameboard) {
        return theseWords
    }
}

// Create array of words with letter data objects
function createWords(rows, colors) {
    let words = []
    createLetterObjects(rows, colors, false, words, false)
    createLetterObjects(transpose(rows), transpose(colors), true, words, false)
    return words
}

// function to generate HTML gameboard
function createGameboard(newGameboard) {
    gameboardElem.innerHTML = ''
    // Create rows on gameboard
    for (let i = 0; i < newGameboard.length; i++) {
        let rowElem = document.createElement('div')
        rowElem.className = 'row'

        gameboardElem.appendChild(rowElem)
        //Create tiles in rows
        for (let j = 0; j < newGameboard[0].letters.length; j++) {
            let tileElem = document.createElement('input')
            tileElem.maxLength = 1
            tileElem.minLength = 1
            tileElem.dataset.col = j
            tileElem.dataset.row = i
            tileElem.className = 'tile'
            if (newGameboard[i].letters[j].letter === ' ') {
                tileElem.value = '□'
                tileElem.readOnly = true
                tileElem.style.color = 'black'
                tileElem.dataset.color = 'black'
            } else {
                tileElem.value = newGameboard[i].letters[j].letter
                tileElem.dataset.letter = newGameboard[i].letters[j].letter
            }
            tileElem.dataset.color = newGameboard[i].letters[j].color
            rowElem.appendChild(tileElem)
        }
    }
}

// Do intial setup of game
let originalUniqueLetters = returnUniqueLetters(rows)
let filteredDictionary = createFilteredDictionary(originalDictionary, originalUniqueLetters, rows)
let words = createWords(rows, colors)
let newGameboard = createLetterObjects(rows, colors, false, words, true)
createGameboard(newGameboard)
console.log(`original words`, words)
console.log(`original gameboard`, newGameboard)
console.log(`✅ end of initialization.js`)

// Solving function triggered by button
function solveThePuzzle() {

    initialRows = new Array(...rows) // Must be global currently
    solveButtonElem.textContent = 'Solving...'

    ///////////////////////////////////////////////
    // Begin Solver Round One
    // Round one is mostly repurposed Worldle solving
    ///////////////////////////////////////////////
    function solverRound1(puzzleWord) {

        function getColorLetters(word, color) {
            let letters = []
            for (let letter of word) {
                if (letter.color === color) {
                    letters.push(letter)
                }
            }
            return letters
        }

        let puzzleLetters = puzzleWord.letters
        let wordList = puzzleWord.dictionary
        // Create the letter arrays for each color.
        let greenLetters = getColorLetters(puzzleLetters, 'green')
        let yellowLetters = getColorLetters(puzzleLetters, 'yellow')
        let grayLetters = getColorLetters(puzzleLetters, 'gray')

        // Filter the wordList based on green letters
        for (let letter of greenLetters) {
            let letterValue = letter.letter;
            let index = letter.letterIndex;
            wordList = wordList.filter(
                (word) => word.split('')[index] == letterValue
            );
        }

        // Function to remove the green letters from the gray letter list.
        function removeGreenLetters(word, newChar) {
            let cleanWord = word.split('');
            greenLetters.forEach((letter) => {
                let index = letter.letterIndex;
                cleanWord[index] = newChar;
            });
            return cleanWord.join('');
        }

        // Function to remove solved (green) positions from a wordList word for filtering.
        function removeSolvedPositions(word, newChar) {
            let cleanWord = word.split('');
            greenLetters.forEach((letter) => {
                let index = letter.letterIndex;
                cleanWord[index] = newChar;
            });
            return cleanWord.join('');
        }

        // Filter the wordList based on yellow letters
        for (let letter of yellowLetters) {

            let letterValue = letter.letter;
            let index = letter.letterIndex;
            // Remove words where this letter is in this yellow index
            wordList = wordList.filter((word) => {
                let wordLetter = word.split('')[index]
                if (wordLetter === letterValue) {
                    return false
                } else {
                    return true
                }
            });

            if (letter.isIntersecting) { // No further process is needed for intersecting yellow letters
                continue
            }


            wordList = wordList.filter((word) => {
                word = removeSolvedPositions(word, '_');
                return word.split('')[index] != letterValue && word.match(letterValue);
            });

            // Handler for duplicate yellows
            let yellowLettersOnly = [];
            yellowLetters.forEach((letter) => {
                if (!letter.isIntersecting) {
                    yellowLettersOnly.push(letter.letter)
                }
            });
            let duplicateYellows = yellowLettersOnly.filter(
                (letter, index) => yellowLettersOnly.indexOf(letter) != index
            );
            if (duplicateYellows.indexOf(letterValue) > -1) {
                wordList = wordList.filter((word) => {
                    word = removeSolvedPositions(word, '_');
                    word = word.replace(letterValue, '_');
                    return (
                        word.split('')[index] != letterValue && word.match(letterValue)
                    );
                });
            }
        }

        // Filter the wordList based on gray letters, omitting yellows
        // TODO: What to do about intersecting grays? (Important)
        let yellowGrayLetters = []
        let yellowLetterLetters = [...yellowLetters.map(letter => letter.letter)]
        for (let letter of grayLetters) {
            let letterValue = letter.letter;
            // Skip grays that are also yellow - TODO: This is not optimal, but it works for now.
            if (yellowLetterLetters.includes(letterValue)) {
                yellowGrayLetters.push(letter)
                //console.log(puzzleWord.word, 'skipping gray letter: ' + letterValue + ' because it is also a yellow letter')
                continue
            }
            //let index = letter.letterIndex; // TODO: remove this is not used
            wordList = wordList.filter((word) => {
                word = removeGreenLetters(word, '');
                return !word.match(letterValue);
            });
        }

        for (let letter of yellowGrayLetters) {
            let letterValue = letter.letter;
            let letterIndex = letter.letterIndex;
            //console.log(puzzleWord.word, 'removing yellow gray letter: ' + letterValue, letterIndex)
            for (let word of wordList) {
                let wordLetter = word.split('')[letterIndex]
                if (wordLetter === letterValue) {
                    //console.log(puzzleWord.word, 'removing word: ' + word)
                    wordList.splice(wordList.indexOf(word), 1)
                }
            }
        }
        // The original Wordle Solver ends here.

        // Get available positions in the word to check is they can be satified by the board
        let availPositions = [...yellowLetters, ...grayLetters]
        availPositions = availPositions.map(tile => tile.letterIndex)
        // Set availPositions to the puzzleWord object
        puzzleWord.availPositions = availPositions

        // Function to get the letters from the board for a given color
        function getColorLettersFromBoard(color) {
            let letters = []
            for (let i = 0; i < newGameboard.length; i++) {
                row = newGameboard[i]
                for (let j = 0; j < row.letters.length; j++) {
                    tile = row.letters[j]
                    if (tile.color === color) {
                        letters.push(tile.letter)
                    }
                }
            }
            return letters
        }

        // Set initial available letters to the gray and yellow letters on the board
        let availLetters = [...getColorLettersFromBoard('gray'), ...getColorLettersFromBoard('yellow')]
        availLetters = availLetters.map(tile => tile[0])
        // Set availLetters to the puzzleWord object
        newGameboard.availLetters = availLetters

        function filterWordList(wordList, availPositions, availLetters) {
            let filteredWordList = []
            let index = 0
            for (word of wordList) {
                let wordLetters = [...word.split('')]
                let wordPasses = true
                let tempAvailLetters = [...availLetters]
                for (let position of availPositions) {
                    if (!tempAvailLetters.includes(wordLetters[position])) {
                        wordPasses = false
                    }
                    else {
                        index = tempAvailLetters.indexOf(wordLetters[position])
                        tempAvailLetters.splice(index, 1)
                    }
                }
                if (wordPasses) {
                    filteredWordList.push(word)
                }
            }
            return filteredWordList
        }

        wordList = filterWordList(wordList, availPositions, availLetters)
        puzzleWord.dictionary = wordList

        return { puzzleWord, availLetters }
    }

    // Function to carry out round one solving on all words
    function doInitialSolving(words) {
        let newWords = []
        let newAvailLetters = []
        for (let word of words) {
            solution = solverRound1(word)
            newWords.push(solution.puzzleWord)
            newAvailLetters = solution.availLetters
        }
        console.log(countSolvedWords(words) + ' words solved')
        return { newWords, newAvailLetters }
    }

    // Function to count the number of solved words
    function countSolvedWords(words) {
        let solvedWords = 0
        for (let word of words) {
            if (word.isSolved) {
                solvedWords++
            }
        }
        return solvedWords
    }
    // Prepare for Round 2 Solving
    const intitalSolutions = doInitialSolving(words)
    words = intitalSolutions.newWords
    availLetters = intitalSolutions.newAvailLetters
    console.log(`✅ end of solver-1.js`)

    ///////////////////////////////////
    // Round 2 Solving
    // Use new information from prevous round one solving to update the word list

    function solverRound2(theseWords, theseAvailLetters) {

        let round2Words = theseWords
        let round2AvailLetters = theseAvailLetters

        for (let word of round2Words) {
            // Check if there are newly solved words
            if (word.dictionary.length === 1 && !word.isSolved) { // Ignore solved words
                word.isSolved = true

                // Add new intersecting letters to intersecting words by looping through newly solved positions
                for (let position of word.availPositions) {
                    // Only intersecting letters need to be updated
                    if (word.letters[position].isIntersecting) {
                        let rowIndex = word.letters[position].rowIndex
                        let colIndex = word.letters[position].colIndex
                        let letter = word.dictionary[0][position]

                        // Function to add correct letter to intersecting words and make green 
                        function updateLetter(row, col, newLetter) {
                            // Loop through words
                            for (let word of round2Words) {
                                // Make a copy of available positions
                                let tempAvailPositions = [...word.availPositions] // Needed to avoid mutating original array until end
                                // Loop through letters to check if interseting
                                for (let letter of word.letters) {
                                    // If now and col match, then is intersecting
                                    // Update the letter and the color
                                    if (letter.rowIndex === row && letter.colIndex === col) {
                                        letter.color = 'green' // TODO: is the green needed?
                                        letter.letter = newLetter
                                        tempAvailPositions.splice(word.availPositions.indexOf(letter.letterIndex), 1)
                                    }
                                }
                                word.availPositions = tempAvailPositions
                            }
                        }
                        updateLetter(rowIndex, colIndex, letter)
                    }
                    letter = word.dictionary[0][position]
                    round2AvailLetters.splice(round2AvailLetters.indexOf(letter), 1)
                }
                // After the loop of positions for the word has completed.
            } else {
                word.availPositions.forEach(position => {
                    word.letters[position].letter = ''
                    word.letters[position].color = ''
                })
            }
            if (word.dictionary.length === 0) {
                console.log(`❌ ERROR Round 2, Part 1: No words found for ${word.word}`)
                return 'error'
            }
        }
        console.log(`✅ end of solver-2 (first).js`)

        // Begin formerly round 3, now 2.1

        for (let word of round2Words) {

            // If a solved word that has not been dealt with made it through, there is a bug. TODO: Remove if not needed
            if (word.dictionary.length === 1 && !word.isSolved) {
                console.log(`❌ ERROR: Round 2, Part 2: ${word.word} is solved but has false isSolved value`)
                return 'error'
            }

            // Skip any words that are already solved
            if (word.isSolved) {
                continue
            }

            let newWordList = []

            // Check each word in the dictionary against the word's letters and available letters
            // Removed any words that are not possible solutions
            for (let wordListWord of word.dictionary) {

                let wordListWordLetters = [...wordListWord.split('')]
                let wordPasses = true
                let tempAvailLetters = [...round2AvailLetters]

                let joinedWord = ''
                word.letters.forEach(letter => { joinedWord += letter.letter ? letter.letter : '_' })

                let joinedDictionaryWord = [...wordListWordLetters]
                word.availPositions.forEach(position => joinedDictionaryWord[position] = '_')

                joinedDictionaryWord = joinedDictionaryWord.join('')

                if (joinedDictionaryWord !== joinedWord) {
                    wordPasses = false
                } else {
                    // If the dictionary word matches the word's known letters, check the board's available letters and the word's available positions
                    for (let position of word.availPositions) {
                        // If it doesn't match, the word is not a possible solution
                        if (!tempAvailLetters.includes(wordListWordLetters[position])) {
                            wordPasses = false
                        }
                        // If it does match, remove the letter from the available letters so it can't be used again
                        else {
                            index = tempAvailLetters.indexOf(wordListWordLetters[position])
                            tempAvailLetters.splice(index, 1)
                        }
                    }
                }
                if (wordPasses) {
                    newWordList.push(wordListWord)
                }
                word.dictionary = newWordList

            }
            if (word.dictionary.length === 0) {
                console.log(`❌ ERROR round 2.1: No words found for ${word.word}`)
                return 'error'
            }

        }
        console.log(countSolvedWords(words) + ' words solved.')
        console.log(`✅ end of solver-2 (second).js`)
        console.log(`words after Round 2/3 solve`, round2Words)


        for (let word of round2Words) {
            if (word.dictionary.length === 1 && !word.isSolved) {
                solverRound2(round2Words, round2AvailLetters)
                if (allSolved) {
                    return { words: round2Words, availLetters: round2AvailLetters }
                }
            }
        }

        allSolved = true
        for (let word of round2Words) {
            if (!word.isSolved) {
                allSolved = false
            }
        }

        if (allSolved) {
            console.log(`⭐⭐⭐ Solved during Round 2!`)
            for (let word of round2Words) {
                console.log(word.word + ' is ' + word.dictionary[0])
            }
        }
        console.log(countSolvedWords(words) + ' words solved.')
        return { words: round2Words, availLetters: round2AvailLetters }
    }

    const round2Solutions = solverRound2(words, availLetters)

    words = round2Solutions.words
    availLetters = round2Solutions.availLetters

    ////////////////////////////
    // Round 3
    ////////////////////////////

    function solverRound3(words) {

        // Create list of dictionaries and form every possible combination of words
        let dictionaries = words.map(word => word.dictionary)

        let possibleSolutions = []
        dictionaries.forEach((list, index) => {
            if (index === 0) {
                list.forEach(item => {
                    possibleSolutions.push([item])
                })
            } else {
                let temp = []
                list.forEach(item => {
                    possibleSolutions.forEach(solution => {
                        temp.push([...solution, item])
                    })
                })
                possibleSolutions = temp
            }
        })

        console.log(possibleSolutions.length + ' combinations of words initially.')

        // Remove non-intersecting letters and transpose cols into rows for comparison
        function processSolutions(possibleSolutions) {

            let thesePossibleSolutions = []
            for (let i = 0; i < possibleSolutions.length; i++) {
                let theseRows = []
                let theseCols = []
                let solutionSet = possibleSolutions[i]
                for (let j = 0; j < solutionSet.length; j++) {
                    let solution = solutionSet[j].split('')

                    if (j < rows.length / 2) {
                        // Remove non-intersecting letters from rows
                        solution = removeEvens(solution)
                        theseRows.push(solution)
                    } else {
                        theseCols.push(solution)

                    }
                }
                // Remove non-intersecting letters from cols
                theseCols = removeEvens(transpose(theseCols))
                theseRows = theseRows.map(row => row.join('')).join('')
                theseCols = theseCols.map(row => row.join('')).join('')
                thesePossibleSolutions.push([theseRows, theseCols])
            }
            return thesePossibleSolutions
        }

        let processedPossibleSolutions = processSolutions(possibleSolutions)
        let tempPossibleSolutions = [] // Copy to preserve words after modification

        // Remove solutions that do not share intersecting letters
        processedPossibleSolutions.forEach((solutionString, index) => {
            if (solutionString[0] === solutionString[1]) {
                tempPossibleSolutions.push(possibleSolutions[index])
            }
        })
        possibleSolutions = tempPossibleSolutions
        console.log(tempPossibleSolutions.length + ' combinations of words after checking intersecting letters.')

        let unmodfiedPossibleSolutions = tempPossibleSolutions
        function removeEvens(array) {
            let newArray = []
            for (let i = 0; i < array.length; i++) {
                if (i % 2 === 0) {
                    newArray.push(array[i])
                }
            }
            return newArray
        }

        tempPossibleSolutions = []
        // Remove letters from words that are not in the gameboard due to overlapping
        for (let i = 0; i < possibleSolutions.length; i++) {
            let combo = possibleSolutions[i]
            let newCombo = []
            for (let j = 0; j < combo.length; j++) {
                let word = combo[j].split('')
                for (let k = 0; k < word.length; k++) {
                    if (j < rows.length / 2 && (k % 2 === 0)) {
                        word[k] = ''
                    }
                }
                word = word.join('')
                newCombo.push(word)
            }
            tempPossibleSolutions.push(newCombo)
        }
        possibleSolutions = tempPossibleSolutions

        // Create a key that represent the letter of the gameboard and sort it
        let key = ''
        rows.forEach((row) => {
            row.forEach((letter) => {
                if (letter !== ' ') {
                    key += letter
                }
            })
        })

        key = key.split('').sort().join('')
        theSolution = []
        console.log('Key: ' + key)

        // Create keys for each combination of words to compare against master key
        possibleSolutions = possibleSolutions.map(combination => combination.join('')) // Join two halves (rows key and cols key) of keys
        possibleSolutions = possibleSolutions.map(combination => combination.split('').sort().join('')) // Split into letters, sort and rejoin
        possibleSolutions.forEach((combo, index) => {
            // If a key matches the master key, print the words
            if (combo === key) {
                theSolution.push(unmodfiedPossibleSolutions[index])
                console.log('⭐⭐⭐ Solutions found:')
                unmodfiedPossibleSolutions[index].forEach((word, solutionIndex) => {
                    console.log((solutionIndex + 1) + '. ' + word)
                })
            }
        })
    }

    try {
        solverRound3(words)
    } catch (e) {
        alert("No solutions found. This means your gameboard is likely invalid. If you believe this is an error, contact the developer.")
        solveButtonElem.textContent = 'Try Again'
        return
    }


    function createRowsFromTheSolution() {
        if (theSolution.length === 0) {
            alert("No solutions found. This means your gameboard is likely invalid. If you believe this is an error, contact the developer.")
            solveButtonElem.textContent = 'Try Again'
            return
        }
        if (theSolution.length > 1) {
            alert(theSolution.length + " solutions found! This is an unusual event. Please contact the developer with your gameboard. See the console for the alternative(s).")
        }
        theSolution = theSolution[0]
        let finalRows = []
        let finalCols = []
        for (let i = 0; i < theSolution.length; i++) {
            let solutionWord = theSolution[i]

            solutionWord = solutionWord.split('')
            if (i < theSolution.length / 2) {
                finalRows.push(solutionWord)
                if (i !== theSolution.length / 2 - 1) {
                    let row = []
                    for (let j = 0; j < theSolution.length - 1; j++) {
                        row.push(' ')
                    }
                    finalRows.push(row)
                }
            } else {
                finalCols.push(solutionWord)
                if (i !== theSolution.length) {
                    let row = []
                    for (let j = 0; j < theSolution.length - 1; j++) {
                        row.push(' ')
                    }
                    finalCols.push(row)
                }
            }
        }
        finalCols = transpose(finalCols)

        for (let i = 0; i < finalRows.length - 1; i++) {
            let row = finalRows[i]
            row.forEach((letter, index) => {
                if (letter === ' ') {
                    row[index] = finalCols[i][index]
                }
            })

        }

        return finalRows
    }

    let finalRows = createRowsFromTheSolution()
    let finalTiles = document.querySelectorAll('.tile')

    for (let i = 0; i < finalTiles.length; i++) {
        let tile = finalTiles[i]
        tile.readOnly = true
        let row = tile.dataset.row
        let col = tile.dataset.col
        finalTiles[i].dataset.letter = finalRows[row][col]
        if (tile.style.color !== 'black') {
            tile.value = finalRows[row][col]
            tile.dataset.color = 'green'
        }

    }
    inputs = document.querySelectorAll('.tile');
    inputs.forEach((input) => input.removeEventListener('click', changeColor));
    solveButtonElem.style.display = 'none'
    return finalRows
}

function changeColor() {

    switch (this.dataset.color) {
        case 'black':
            this.dataset.color = 'black';
            break;
        case '':
            this.dataset.color = 'gray';
            break;
        case 'gray':
            this.dataset.color = 'yellow';
            break;
        case 'yellow':
            this.dataset.color = 'green';
            break;
        case 'green':
            this.dataset.color = 'gray';
            break;
        default:
            this.dataset.color = 'black';
    }
}

inputs = document.querySelectorAll('.tile');
inputs.forEach((input) => input.addEventListener('click', changeColor));

function updateGame() {

    tiles = document.querySelectorAll('.tile')
    let newRowsRow = []
    let newColorsRow = []
    let updatedRows = []
    let updateColors = []
    for (let i = 0; i < tiles.length; i++) {
        let tile = tiles[i]
        tile.value = tile.value.toUpperCase()

        if (tile.style.color !== 'black') {
            newRowsRow.push(tile.value)
            newColorsRow.push(tile.dataset.color)
        } else {
            newRowsRow.push(' ')
            newColorsRow.push(' ')
        }
        if (i !== 0 && (i + 1) % Math.sqrt(tiles.length) === 0) {
            updatedRows.push(newRowsRow)
            updateColors.push(newColorsRow)
            newRowsRow = []
            newColorsRow = []

        }

    }
    console.log(`updatedRows`, updatedRows)
    console.log(`updatedColors`, updateColors)
    updatedUniqueLetters = returnUniqueLetters(updatedRows)
    filteredDictionary = createFilteredDictionary(originalDictionary, updatedUniqueLetters, rows)
    words = createWords(updatedRows, updateColors, filteredDictionary)
    newGameboard = createLetterObjects(updatedRows, updateColors, false, words, true)
    let finalRows = solveThePuzzle(updatedRows, updateColors)
    logOutSteps(initialRows, finalRows)
}


// Figure out the fewest possible steps to solve the puzzle
function logOutSteps(initialRows, finalRows) {

    let steps = []
    let problem = initialRows
    let solution = finalRows
    let problemRow = problem.reduce((acc, row) => acc.concat(row), [])
    let solutionRow = solution.reduce((acc, row) => acc.concat(row), [])
    let g2g = 0
    let iterations = 0

    function addStep(i, j, problemLetter, potentialSolutionLetter) {

        rowLength = initialRows.length

        let solutionRow = Math.floor((i + rowLength) / rowLength)
        let solutionCol = (i + rowLength + 1) % rowLength === 0 ? rowLength : (i + rowLength + 1) % rowLength
        let problemRow = Math.floor((j + rowLength) / rowLength)
        let problemCol = (j + rowLength + 1) % rowLength === 0 ? rowLength : (j + rowLength + 1) % rowLength
        let stepString = `Swap ${potentialSolutionLetter} with ${problemLetter} (${problemRow},${problemCol} to ${solutionRow},${solutionCol})`
        steps.push({ solutionCol, solutionRow, problemCol, problemRow, stepString })

    }

    function doSwapping(problemRow) {
        for (let i = 0; i < problemRow.length; i++) {
            let problemLetter = problemRow[i]
            let solutionLetter = solutionRow[i]
            if (problemLetter === solutionLetter) {
                continue
            }
            for (let j = 0; j < problemRow.length; j++) {
                let potentialSolutionLetter = problemRow[j]
                let thePotentialCounterpart = solutionRow[j]
                if (potentialSolutionLetter === thePotentialCounterpart) {
                    continue
                }
                if (solutionLetter === potentialSolutionLetter && problemLetter === thePotentialCounterpart) {
                    addStep(i, j, problemLetter, potentialSolutionLetter)
                    iterations++
                    g2g++
                    problemRow[j] = problemLetter
                    problemRow[i] = solutionLetter
                    break
                }
            }
        }
        doSwapping2()
    }

    function doSwapping2(giveUp) {
        for (let i = 0; i < problemRow.length; i++) {
            let problemLetter = problemRow[i]
            let solutionLetter = solutionRow[i]
            if (problemLetter === solutionLetter) {
                continue
            }
            for (let j = 0; j < problemRow.length; j++) {
                let potentialSolutionLetter = problemRow[j]
                let thePotentialCounterpart = solutionRow[j]
                if (potentialSolutionLetter === thePotentialCounterpart) {
                    continue
                }
                if (solutionLetter === potentialSolutionLetter && problemLetter === thePotentialCounterpart) {
                    addStep(i, j, problemLetter, potentialSolutionLetter)
                    iterations++
                    g2g++
                    problemRow[j] = problemLetter
                    problemRow[i] = potentialSolutionLetter
                    break
                } else if (solutionLetter === potentialSolutionLetter || problemLetter === thePotentialCounterpart) {

                    let temp = new Array(...problemRow)
                    temp[j] = problemLetter
                    temp[i] = potentialSolutionLetter
                    temp = checkIfNextIsGreenToGreen(temp)
                    if (temp) {
                        iterations++
                        addStep(i, j, problemLetter, potentialSolutionLetter)
                        let lastStep = steps.pop()
                        let secondLastStep = steps.pop()
                        steps.push(lastStep)
                        steps.push(secondLastStep)
                        problemRow = temp
                        break
                    }
                    if (giveUp) {
                        problemRow[j] = problemLetter
                        problemRow[i] = potentialSolutionLetter
                        addStep(i, j, problemLetter, potentialSolutionLetter)
                        break
                    }
                }
            }
        }
        if (!giveUp) {
            doSwapping2(true)
        }

    }

    function checkIfNextIsGreenToGreen(thisProblemRow) {
        for (let i = 0; i < thisProblemRow.length; i++) {
            if (thisProblemRow[i] === solutionRow[i]) {
                continue
            }
            let problemLetter = thisProblemRow[i]
            let solutionLetter = solutionRow[i]

            for (let j = 0; j < thisProblemRow.length; j++) {
                if (thisProblemRow[j] === solutionRow[j]) {
                    continue
                }
                let potentialSolutionLetter = thisProblemRow[j]
                let thePotentialCounterpart = solutionRow[j]

                if (potentialSolutionLetter === solutionLetter && problemLetter === thePotentialCounterpart) {
                    thisProblemRow[j] = problemLetter
                    thisProblemRow[i] = solutionLetter
                    addStep(i, j, problemLetter, potentialSolutionLetter, 'NG')
                    g2g++
                    iterations++
                    return thisProblemRow
                }
            }
        }
    }

    // Print out swapping instructions

    doSwapping(problemRow)
    steps.forEach((step, index) => console.log((index + 1) + '. ' + step.stepString))

    let gameElementsElem = document.querySelector('#game-elements')
    // Create word list container and append it to the gameboard
    // If a word list elem already exists, remove it
    if (document.getElementById('word-list')) {
        document.getElementById('word-list').remove()
    }

    let wordListContainerElem = document.createElement('div')
    wordListContainerElem.id = 'word-list'
    gameElementsElem.appendChild(wordListContainerElem)

    // Create the word list and append it to the word list container
    let wordListElem = document.createElement('ol')
    wordListContainerElem.appendChild(wordListElem)
    steps.forEach((item) => {
        let listItem = document.createElement('li')
        listItem.dataset.solutionCol = item.solutionCol
        listItem.dataset.solutionRow = item.solutionRow
        listItem.dataset.problemCol = item.problemCol
        listItem.dataset.problemRow = item.problemRow
        listItem.textContent = item.stepString
        listItem.addEventListener('mouseover', (e) => colorWord(e))
        listItem.addEventListener('mouseleave', (e) => colorWord(e))
        wordListElem.appendChild(listItem)
    })
    wordListContainerElem.appendChild(wordListElem)
    gameElementsElem.classList.add('solved')
}

function colorWord(e) {
    //if event type was click
    let elem = e.target
    if (e.type === 'mouseleave' && elem.dataset.clicked === "true") {
        return
    }
    if (e.type === 'mouseover' && elem.dataset.clicked === "true") {
        return
    }

    problemRow = elem.dataset.problemRow
    problemCol = elem.dataset.problemCol
    let targetProblemTile = document.querySelector(`[data-row="${problemRow - 1}"][data-col="${problemCol - 1}"]`)
    let targetSolutionTile = document.querySelector(`[data-row="${elem.dataset.solutionRow - 1}"][data-col="${elem.dataset.solutionCol - 1}"]`)

    if (elem.dataset.active === "true") {
        targetProblemTile.dataset.active = ""
        targetProblemTile.value = targetProblemTile.dataset.letter
        targetSolutionTile.dataset.active = ""
        targetSolutionTile.value = targetSolutionTile.dataset.letter
        elem.dataset.active = ""
        return
    }
    targetProblemTile.dataset.active = "true"
    targetProblemTile.value = '🧇'
    targetSolutionTile.dataset.active = "true"
    targetSolutionTile.value = '🧇'
    elem.dataset.active = "true"
}