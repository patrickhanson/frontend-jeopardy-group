'use strict';

function Board(height, width, gridElement) {
  this.height = height;
  this.width = width;
  this.gridElement = gridElement;
  this.grid = new Array(this.height).fill().map(() => new Array(this.width).fill());
  this.clickFunction = this.clickEvent.bind(this);
  this.points = 0;
  this.pointsOut = document.getElementById('points');

  const submit = document.getElementById('answer');
  submit.addEventListener('click', this.submitEvent.bind(this));
}
Board.prototype = {
  createBoard: function() {
    this.createElement();
    this.grid.forEach((_, rowIndex) => {
      const rowElement = document.createElement('div');
      rowElement.classList.add('row');
      this.element.appendChild(rowElement);

      for (let colIndex = 0; colIndex < this.width; colIndex++) {
        this.grid[rowIndex][colIndex] = new Cell(rowIndex, colIndex, rowElement);
      }

      this.fetchData(rowIndex, 1);
    });
  },

  createElement: function() {
    this.element = document.createElement('div');
    this.element.id = 'grid';
    this.gridElement.appendChild(this.element);
  },
  fetchData: function(rowIndex, offset) {
    fetch(`http://jservice.io/api/category?id=${rowIndex + offset}`)
      .then(response => response.json())
      .then(category => {
        category.clues = category.clues.filter(clue => clue.question);
        if (category.clues.length < this.width || !category.clues) {
          this.fetchData(rowIndex, offset + 1);
          return;
        }

        this.grid[rowIndex].forEach((_, cellIndex) => {
          this.assignCategory(category, rowIndex, cellIndex);
          console.log(category);
          this.assignValue(rowIndex, cellIndex);
          let text = '';
          this.grid[rowIndex][cellIndex].category = category;

          if (cellIndex === 0) {
            text = category.title;
          } else {
            text = this.grid[rowIndex][cellIndex].value;
            this.grid[rowIndex][cellIndex].cellElement.addEventListener(
              'click',
              this.clickFunction
            );
            this.grid[rowIndex][cellIndex].cellElement.isClickable = true;
          }
          this.grid[rowIndex][cellIndex].cellElement.textContent = text;
        });
      });
  },

  assignCategory: function(category, rowIndex, cellIndex) {
    let startingPoint = Math.floor(Math.random() * category.clues.length - this.width) + 1;
    if (startingPoint < 1) startingPoint = 1;
    this.grid[rowIndex][cellIndex].clue = category.clues[cellIndex];

    this.grid[rowIndex].title = category.title;
  },

  assignValue: function(rowIndex, cellIndex) {
    console.log('grid', cellIndex);
    this.grid[rowIndex][cellIndex].value = cellIndex * 200;
  },
  toggleEventListeners: function() {
    for (let row of this.grid) {
      for (let cell of row) {
        if (cell.cellElement.isClickable) {
          cell.cellElement.removeEventListener('click', this.clickFunction);
          cell.cellElement.isClickable = false;
        } else {
          cell.cellElement.addEventListener('click', this.clickFunction);
          cell.cellElement.isClickable = true;
        }
      }
    }
  },

  clickEvent: function(event) {
    const rowIndex = event.target.dataset.rowIndex;
    const cellIndex = event.target.dataset.colIndex;
    const gridCell = this.grid[rowIndex][cellIndex];
    console.log('gridcell', gridCell.clue);
    gridCell.cellElement.textContent = gridCell.clue.question;
    this.currentAnswer = gridCell.clue.answer;
    this.currentGridCell = gridCell;
    this.toggleEventListeners();
  },
  submitEvent: function() {
    const input = document.getElementById('input');
    const answer = input.value;
    if (answer.toLowerCase() === this.currentAnswer.toLowerCase()) {
      this.currentGridCell.cellElement.textContent = '';
      this.points += this.currentGridCell.value;
    } else {
      this.currentGridCell.cellElement.textContent = this.currentAnswer;
      this.points -= this.currentGridCell.value;
    }
    this.currentAnswer = null;
    this.currentGridCell.cellElement.removeEventListener('click', this.clickFunction);
    this.pointsOut.textContent = this.points;
    this.toggleEventListeners();
  },

  constructor: Board,
};

const inputs = new Board(6, 6, document.getElementById('output'));

inputs.createBoard();