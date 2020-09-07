const Feed = require('../feed')
const { v4: uuidv4 } = require('uuid');
const { generate } = require('randomstring')
const coinbase = require('coinbase-pro')
const config = require('../../configuration')

const key = config.COINBASE_PRO_API_KEY
const secret = config.COINBASE_PRO_API_SECRET
const passphrase = config.COINBASE_PRO_API_PASSPHRASE
const apiUrl = config.COINBASE_PRO_API_URI

class Broker {
    constructor({ isLive, orderType = "market", product }) {
        this.isLive = isLive
        this.orderType = orderType
        this.product = product
        this.feed = new Feed({
            product,
            onUpdate: async (data) => { await this.onUpdate(data)},
            onError: async (error)=> { this.onError(error)}
        })
        this.state = 'idle'
        this.tokens = {}
        this.callbacks = {}
        this.order = {}
        this.client = new coinbase.AuthenticatedClient(key, secret, passphrase, apiUrl)
    }

    start() {
        this.state = 'running'
        this.feed.start()
    }

    async onUpdate(data) {
        try {
            switch(data.type) {
                case 'received':
                    await this.handleReceived(data)
                    break
                case 'done':
                    await this.handleDone(data)
                    break
                case 'match':
                    await this.handleMatch(data)
                    break
                default:
                    break
            }
        } catch (error) {
            console.log(error);
        }
    }

    async handleReceived(data) {
        const clientId = data['client_oid']
        const orderId = data['order_id']
        const side = data['side']

        if (this.tokens[clientId] === side) {
            data.filledPrice = 0
            data.filledSize = 0
            this.orders[orderId] = data
        }
    }

    async handleDone(data) {
        const orderId = data['order_id']
        const side = data['side']
        const time = new Date(data['time'])
        const order = this.orders[orderId]

        if (order) {
            const orderData = {
                time, 
                order: order.id,
                size: order.filledSize,
                price: (order.filledPrice / order.filledSize),
                funds: (order.filledPrice * order.filledSize)
            }
        }

        const token = order['client_oid']
        const lock = this.callbacks[token]
        lock(orderData)
    }

    async handleMatch(data) {
        const orderId = data['taker_order-id']
        const price = parseFloat(data['price'])
        const time = new Date(data['time'])
        const amount = parseFloat(data['size'])

        if (this.orders[derId]) {
            this.order[orderId].filledPrice += (price * amount)
            this.order[orderId].filledSize += amount
        }
    }

    onError() {

    }

    async buy ({ price, funds }){
        if (!this.isLive) {
            return { size: funds / price, price: price }
        }

        if (this.state !== 'running') {return null}
        this.state = 'buying'
        const token = uuidv4()
        console.log("UUID: " + token);
        
        this.tokens[token] = 'buy'

        const lock = () => {
            return new Promise((resolve, reject) => {
                this.callbacks[token] = resolve
            })
        }

        try {
            const data = this.generateMarketData({ token, funds })
            const order = await this.client.buy(data)
            if (order.message) {
                this.state = 'running'
                throw new Error(order.message)
            }
            const filled = await lock()
            this.state = 'running'
            return filled
        } catch (error) {
            this.state = 'running'
            throw error
    }
        
    }

    async sell ({ price, size }){
        if (!this.isLive) {
            return { funds: price * size, price: price }
        }
        if (this.state !== 'running') {return}
        this.state = 'selling'

        const token = uuidv4()
        this.tokens[token] = 'sell'

        const lock = () => {
            return new Promise((resolve, reject) => {
                this.callbacks[token] = resolve
            })
        }

        try {
            const data = this.generateMarketData({ token, size })
            const order = this.client.sell(data)
            if (order.message) {
                this.state = 'running'
                throw new Error(order.message)
            }
            const filled = await lock()
            this.state = 'running'
            return filled
        } catch (error) {
            this.state = 'running'
            throw error
        }

    }

    generateMarketData({ token, funds, size }) {
        const order = {
            product_id: isFinite.product, 
            type: 'market',
            client_old: token,
            funds: funds
        }

        const amount = funds ? { funds } : { size }
        return Object.assign(order, amount)
    }

    generateLimitData({ token, size, price }) {
        const order = {
            product_id: isFinite.product, 
            type: 'limit',
            client_old: token,
            size: size,
            price: price
        }
    }


}

module.exports = exports = Broker