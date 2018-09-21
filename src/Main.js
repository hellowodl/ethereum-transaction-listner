const EventEmitter = require('events').EventEmitter

const TransactionEmitter = require('./TransactionEmitter')
const Transaction = require('./Transaction')

module.exports = class Main extends EventEmitter {
    constructor (config) {
        super()

        this.config = config

        this.transansactionEmitter = new TransactionEmitter(config.wsProvider)
        this.transactionMap = new Map()

        this.transansactionEmitter.on('newTransaction', (ethTransaction) => this.compareTransactions(ethTransaction))
    }

    push (value, to) {
        const symbol = Symbol()
        const transaction = new Transaction({value, to, symbol}, this.config.timeoutDuration)

        this.transactionMap.set(symbol, transaction)

        transaction.on('found', result => this.onTransactionFound(result))
        transaction.on('timeout', symbol => this.onTransactionTimeout(symbol))
    }

    compareTransactions (ethTransaction) {
        if (this.transactionMap.size > 0)
            this.transactionMap.forEach(transaction => transaction.verify(ethTransaction))
    }

    onTransactionFound (result) {
        this.transactionMap.delete(result.symbol)

        this.emit('transactionFound', result.transaction)
    }

    onTransactionTimeout (symbol) {
        this.transactionMap.delete(symbol)
    }
}