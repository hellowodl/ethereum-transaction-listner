const EventEmitter = require('events').EventEmitter
const Web3 = require('web3')

module.exports = class TransactionEmitter extends EventEmitter {
    constructor (wsProvider) {
        super()

        this.web3 = new Web3(wsProvider)

        this.subNewBlockHeaders()

        this.on('newBlockHeaders', this.onNewBlockHeaders)
        this.on('newBlock', this.emitTransactions)

        this.on('error', console.error)
    }


    subNewBlockHeaders () {
        this.web3.eth.subscribe('newBlockHeaders')
            .on('data', (blockHeaders) => this.emit('newBlockHeaders', blockHeaders))
            .on('error', (error) => this.emit('error', error))
    }

    async onNewBlockHeaders (newBlockHeaders) {
        const block = await this.web3.eth.getBlock(newBlockHeaders.hash, true)

        if (block === null) {
            this.emit('error', new Error('Block is null, check https://github.com/INFURA/infura/issues/43'))
        } else {
            this.emit('newBlock', block)
        }
    }

    emitTransactions (block) {
        block.transactions.forEach(transaction => this.emit('newTransaction', transaction))
    }
}
