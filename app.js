let editedPlayer = 0;
let activeplayer=0;
let players = [
    {
        playername: '',
        symbole: 'X'
    }
    , {
        playername: '',
        symbole: 'O'
    }
]
const modaleConfig = document.querySelector('#config_overlay');
const backdropConfig = document.querySelector('#backdrop');
const mainGame = document.querySelector('#main_Game');

const edite2 = document.querySelector('#button_edite2');
const edite1 = document.querySelector('#button_edite1');
const cancel = document.querySelector('#cancel');
const form = document.querySelector('form');
const startGameBtn = document.querySelector('#start_gamebtn');
const liElement= document.querySelectorAll('.game_board li');

edite1.addEventListener('click', show);
edite2.addEventListener('click', show);
cancel.addEventListener('click', close)
form.addEventListener('submit', gettingName);
startGameBtn.addEventListener('click', startGame);
let forplayer1=0;
let forplayer2=0;

for(let element of liElement){
element.addEventListener('click', givingValues);
}