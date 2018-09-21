const fromWei = require('web3').utils.fromWei
const EventEmitter = require('events').EventEmitter

module.exports = class Transaction extends EventEmitter {
    constructor ({value, to, symbol}, timeoutDuration) {
        super()

        this.symbol = symbol
        this.timeout = setTimeout(() => this.onTimeout(), timeoutDuration)
    }

    verify (transaction) {
        if (this.to === transaction.to && this.value === fromWei(transaction.value)) {
            this.cancelTimeout()

            this.emit('found', {
                symbol: this.symbol,
                transaction: transaction
            })
        }
    }

    cancelTimeout () {
        unsetTimeout(this.timeout)
    }

    onTimeout () {
        this.emit('timeout', this.symbol)
    }
}