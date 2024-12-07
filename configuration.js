function show(event) {
    editedPlayer = event.target.dataset.playerid;
    backdrop.style.display = 'block';
    modaleConfig.style.display = 'block';
    document.querySelector('#displayError').textContent = ''

}
function close() {
    modaleConfig.style.display = 'none';
    backdropConfig.style.display = 'none';


}
function gettingName(event) {
    event.preventDefault();
    const takenName = document.querySelector('#playerName').value;
    if (!takenName) {
        document.querySelector('#displayError').textContent = "please enter a valid name"
        document.querySelector('#displayError').classList.add('error');
        document.querySelector('#labelElement').classList.add('error')
    }
    else {
        document.querySelector('#displayError').textContent = '';
        document.querySelector('#labelElement').classList.remove('error')
        document.querySelector('#playerName').value = "";
        close();
    }
    if (editedPlayer == 1) {
        document.querySelector('#firstPlayer').textContent = takenName;
    } else {
        document.querySelector('#secondPlayer').textContent = takenName;
    }
    players[editedPlayer - 1].playername = takenName;
}