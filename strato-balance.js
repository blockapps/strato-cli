const { getBalance } = require('./balance');

getBalance()
    .then((result) => {
        if (result.balance > 0) {
            console.log('Balance for ' + result.username + ' (' + result.address + '): ' + result.balance);
        } else {
            console.log('Balance for ' + result.username + ' (' + result.address + '): NIL');
        }
    })
    .catch((err) => {
        console.error('Error: ' + err);
        process.exit();
    });