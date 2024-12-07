function startGame() {
    if (players[0].playername == '' || players[1].playername == '') {
        alert('first enter valid names for players');
        return;
    }
    else {
        mainGame.style.display = 'block';
    }
    document.querySelector('#active_playerName').textContent=players[1].playername;
}
function givingValues(event) {
    document.querySelector('#active_playerName').textContent=players[activeplayer].playername;
    let num = Math.floor(Math.random() * 10)  +Math.floor(Math.random() * 10);
    event.target.classList.add('disable')
    if (num % 2 == 0) {
        event.target.textContent = 'X';
        forplayer1 = forplayer1 + 1;
    }
    else {
        event.target.textContent = 'O';
        forplayer2 = forplayer2 + 1;

    }
    if (forplayer1 == 4 || forplayer2 == 4) {

        if (forplayer1 == 4) { document.querySelector('#winner').textContent=players[0].playername }
        else { document.querySelector('#winner').textContent=players[1].playername }

        
        document.querySelector('#backdrop').style.display = 'block';
        document.querySelector('.winner').style.display = 'block';
    }
    switch(activeplayer){
        case 0:
            activeplayer=1;
            break;
        case 1:
            activeplayer=0;
            break;
    }

}