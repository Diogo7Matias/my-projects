const prompt = require("prompt-sync")();

const ROWS = 3;
const COLS = 3;

const SYMBOLS_COUNT = {
    "S": 3,
    "A": 5,
    "B": 8,
    "C": 10
}

const SYMBOL_MULTIPLIERS = {
    "S": 10,
    "A": 4,
    "B": 2.5,
    "C": 1.5
}

const deposit = () => {
    while (true){
        const amount = parseFloat(prompt("Enter the amount to deposit: "));
    
        if (isNaN(amount) || amount <= 0)
            console.log("Invalid deposit amount.");
        else
            return amount;
    }
}

const numberOfLines = () => {
    while (true){
        const lines = parseInt(prompt("Number of lines to bet on (1-3): "));
    
        if (isNaN(lines) || lines <= 0 || lines > 3)
            console.log("Invalid number of lines.");
        else
            return lines;
    }
}

const getBet = (balance, lines) => {
    while (true){
        const bet = parseFloat(prompt("How much do you want to bet? (per line): "));
    
        if (isNaN(bet) || bet <= 0 || bet > balance / lines)
            console.log("Invalid bet.");
        else
            return bet;
    }
}

const spin = () => {
    const symbols = [];
    const reels = [];

    // available symbols
    for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)){
        for (let i = 0; i < count; i++){
            symbols.push(symbol);
        }
    }
    // build the reels
    for (let i = 0; i < COLS; i++){
        reels.push([])
        const reelSymbols = [...symbols];
        for (let j = 0; j < ROWS; j++){
            const randomIndex = Math.floor(Math.random() * reelSymbols.length);
            const selectedSymbol = reelSymbols[randomIndex];
            reels[i].push(selectedSymbol);
            reelSymbols.splice(randomIndex, 1);
        }
    }
    return reels;
}

const transpose = (reels) => {
    const rows = [];
    for (let i = 0; i < ROWS; i++){
        rows.push([]);
        for (let j = 0; j < COLS; j++){
            rows[i].push(reels[j][i]);
        }
    }
    return rows;
}

const printRows = (rows) => {
    for (const row of rows){
        let rowString = ""
        for (const [i, symbol] of row.entries()){
            rowString += symbol;
            if (i != row.length - 1)
                rowString += " | ";
        }
        console.log(rowString);
    }
}

const getWinnings = (rows, bet, lines) => {
    let winnings = 0;

    for (let i = 0; i < lines; i++){
        const symbols = rows[i];
        let allSame = true;

        for (const symbol of symbols){
            if (symbol != symbols[0]){
                allSame = false;
                break;
            }
        }

        if (allSame){
            winnings += bet * SYMBOL_MULTIPLIERS[symbols[0]];
        }
    }
    return winnings;
}

const displayOdds = () => {
    let symbolsPerColumn = 0
    for (const count of Object.values(SYMBOLS_COUNT)){
        symbolsPerColumn += count;
    }

    console.log("SYMBOL\t|CHANCE\t|MULTIPLIER");
    for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)){
        const change = (Math.pow(count / symbolsPerColumn, COLS) * 100).toFixed(2);
        const multiplier = SYMBOL_MULTIPLIERS[symbol];
        console.log(symbol + "\t| " + change + "%" + "\t| " + multiplier);
    }
    console.log("")
}

const game = () => {
    console.log("SLOT MACHINE")
    console.log("")
    console.log("Rules & Clarification: When you bet on a single line you are betting on the first line.");
    console.log("If you bet on two lines, you are betting on the first and second lines and so on.");
    console.log("")
    displayOdds();
    let keepPlaying = true;
    let balance = deposit();

    while (keepPlaying){
        // display balance
        console.log("Balance: " + balance + "€");

        // get user input 
        const lines = numberOfLines();
        const bet = getBet(balance, lines);
        balance -= bet * lines;
        
        // spin and handle winnings
        const rows = transpose(spin());
        printRows(rows);
        const winnings = getWinnings(rows, bet, lines);
        balance += winnings;
        console.log("You won " + winnings + "€");

        // end the loop
        if (balance == 0){
            console.log("The game has ended because you have no money left.");
            break;
        }
        keepPlaying = prompt("Do you want to keep playing? (y/n): ") == "y";
    }
    console.log("You left the gaame with a balance of " + balance + "€");
}

game();