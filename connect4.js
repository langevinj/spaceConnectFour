/** Connect Four
 *
 * Players alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */
class Game {
   constructor(playerObjs,  height = 6, width = 7) {
     this.players = [...playerObjs];
     this.height = height;
     this.width = width;
     this.currPlayer = this.players[0];
     this.makeBoard();
     this.makeHtmlBoard();
     this.gameOver = false;
     this.clickDisabled = false;
   }

   //Create the empty board//
   makeBoard() {
    this.board = [];
    for (let y = 0; y < this.height; y++) {
      this.board.push(Array.from({ length: this.width }));
    }
   }
  
   //Add coordinates, cells, and show the board. Also make the top row clickable
   makeHtmlBoard() {
      const board = document.getElementById('board');
      board.innerHTML = '';
      // make column tops (clickable area for adding a piece to that column)
      const top = document.createElement('tr');
      top.setAttribute('id', 'column-top');
      
     this.handleGameClick = this.handleClick.bind(this);
     top.addEventListener('click', this.handleGameClick);

     for (let x = 0; x < this.width; x++) {
       const headCell = document.createElement('td');
       headCell.setAttribute('id', x);
       const previewPiece = document.createElement('div');
       previewPiece.id = "previewPiece";
       headCell.append(previewPiece);
       top.append(headCell);
     }
     board.append(top);


    this.makeMainBoard();
    }

   makeMainBoard(){
     const board = document.getElementById('board');
     for (let y = 0; y < this.height; y++) {
       const row = document.createElement('tr');
       for (let x = 0; x < this.width; x++) {
         const cell = document.createElement('td');
         cell.setAttribute('id', `${y}-${x}`);
         row.append(cell);
       }
       board.append(row);
     }
   }

   //Find the next available spot for a piece, or if there isn't one
   findSpotForCol(x) {
     for (let y = this.height - 1; y >= 0; y--) {
        if(!this.board[y][x]){return y;} 
     }
     return null;
   }

   //create and place the new piece at its position
   placeInTable(y, x) {
      const piece = document.createElement('div');
      piece.classList.add('piece', `p${this.currPlayer.name}`);
      piece.style.top = -50 * (y + 2);
      piece.style.backgroundColor = this.currPlayer.color;
      const spot = document.getElementById(`${y}-${x}`);
      spot.append(piece);
   }

   //create box with ending message
   endGame(msg) {
        let winBox = document.createElement("div");
        winBox.innerText = msg;
        winBox.id = "winBox";

        let close = document.createElement("button");//button to close endGame message
        close.innerText = "close";
        close.addEventListener("click", function() { winBox.remove() });

        winBox.append(close);
        const container = document.getElementById("container");
        setTimeout(function () { container.prepend(winBox);}, 300);
   }
   
   //handle click of a space on the top row, turns off clickability while a piece is dropping
   handleClick(evt) {
     if(!this.gameOver){
      if(this.clickDisabled){
        return;
      } else if (!this.clickDisabled) {
        this.clickDisabled = true;

        //get ID of clicked cell
        const x = +evt.target.id;
        const y = this.findSpotForCol(x);
        if(y === null) {return; }
        this.board[y][x] = this.currPlayer.name;
        this.placeInTable(y, x);
        this.checkForTie();
        this.didSomeoneWin();
        this.switchPlayers();
        setTimeout(function(){
          this.clickDisabled = false;
        }.bind(this), 1000);
      }
    }
  }

    didSomeoneWin(){
      if (this.checkForWin()) {
        this.gameOver = true;
        this.endGame(`Player ${this.currPlayer.name[1]} won!`);
      }
    }

    checkForTie(){//could possibly just check top row
      if (this.board.every(row => row.every(cell => cell))) {
        this.gameOver = true;
        this.endGame(`It's a tie!!!`);
      }
    }

    switchPlayers(){
      let index = this.players.indexOf(this.currPlayer);
      let newIndex = (index + 1) % this.players.length;
      this.currPlayer = this.players[newIndex];
      this.createPiecePreview();
    }

    //change the color of the preview piece
    createPiecePreview(){
      let previewPieces = Array.from(document.querySelectorAll("#previewPiece"));
      for(let i = 0; i < previewPieces.length; i++){
        previewPieces[i].style.backgroundColor = this.currPlayer.color;
      }
    }

    checkForWin() {
         // Check four cells to see if they're all color of current player
         //  - cells: list of four (y, x) cells
         //  - returns true if all are legal coordinates & all match currPlayer
         const _win = (cells) => 
         cells.every(
           ([y, x]) => 
             this.board[y, x] !== undefined && //this should speed things up?
             y >= 0 &&
             y < this.height &&
             x >= 0 &&
             x < this.width &&
             this.board[y][x] === this.currPlayer.name
           );

           for (let y = 0; y < this.height; y++) {
             for (let x = 0; x < this.width; x++) {
               // get "check list" of 4 cells (starting here) for each of the different
               // ways to win'
               const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
               const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
               const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
               const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];
     
               // find winner (only checking each win-possibility as needed)
               if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
                 return true;
               }
             }
           }
    } 
}


class GameButtons {
  constructor(){
    this.topLine = document.getElementById("inputs");
    this.createPlayerInput();
    this.createSubmitButton();
  }

  createPlayerInput(){
    let playerCountInput = document.createElement('input');
    playerCountInput.setAttribute('type', 'text');
    playerCountInput.id = 'playerCount';
    playerCountInput.setAttribute('placeholder', "Enter # of players 2-4");
    this.addToTopLine(playerCountInput);
  }

  createSubmitButton(){ 
    let submitButton = document.createElement('button');
    submitButton.id = 'playersSubmit';
    submitButton.innerText = 'submit';

    submitButton.addEventListener('click', function(){
      let countInput = document.getElementById('playerCount');
      let count = parseInt(countInput.value);
      
      if (![2, 3, 4].includes(count)) {
        countInput.value = '';
        return;
      } else {
        this.colorsAndStart(count);
        this.startGameButton(count);
        document.getElementById('playerCount').remove();
        submitButton.remove();
        countInput.value = '';
      }
      countInput.value = '';
    }.bind(this));

    this.addToTopLine(submitButton);
  }

  addToTopLine(el){
    let tempDiv = document.createElement('div');
    tempDiv.append(el);
    this.topLine.append(tempDiv);
  }

  colorsAndStart(playerCount){
    //create color input fields
    for (let i = 1; i <= playerCount; i++) {
      let tempInput = document.createElement("input");
      tempInput.setAttribute('id', `player${i}color`);
      tempInput.setAttribute('placeholder', `player${i}'s color`);
      tempInput.setAttribute('type', 'text');
      let tempDiv = document.createElement('div');
      tempDiv.append(tempInput);
      this.topLine.append(tempDiv);
    }
  }

  startGameButton(numPlayers){
    const newButton = document.createElement("button");
    newButton.id = "startGame";
    newButton.innerText = "Start Game";
    let players = numPlayers;

    newButton.addEventListener("click", function(){
        this.setUpPlayers(players);
    }.bind(this));

    this.addToTopLine(newButton);
  }

  //validate color inputs and set up the player array to pass to the Player class
  setUpPlayers(numPlayers){
    let playerArr = [];

    for (let x = 1; x <= numPlayers; x++) {
      let tempPlayer = document.getElementById(`player${x}color`);
      if (!this.isColor(tempPlayer.value.toLowerCase())) {//resets inputs if any color isn't valid
        let colorInput = Array.from(document.getElementsByTagName('input'));
        for (let z = 0; z < colorInput.length; z++) {
          colorInput[z].value = '';
        }
        return;
      }
      playerArr.push({ name: `p${x}`, color: tempPlayer.value.toLowerCase() });
      tempPlayer.value = "";
    }

    if (!this.checkForDuplicateColors(playerArr)) {
      new Player(playerArr);
    }
  }

  isColor = (str) => {
    const s = new Option().style;
    s.color = str;
    return s.color !== '';
  }

  checkForDuplicateColors(playerArr) {
    const checkColors = new Set();

    for (let x = 0; x < playerArr.length; x++) {
      checkColors.add(playerArr[x].color)
    }
    return checkColors.size === playerArr.length ? false : true;
  }
}

class Player {
  constructor(playerArr) {
    this.players = [];
    for (let q = 0; q < playerArr.length; q++) {
      this.players.push(playerArr[q]);
    }
    this.startGame(this.players);//need to refactor for number of players
  }

  startGame(playerObjs) {
    new Game(playerObjs);
  }
}

new GameButtons();