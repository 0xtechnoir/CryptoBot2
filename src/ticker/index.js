const coinbase = require('coinbase-pro')
const config = require('../../configuration')

class Ticker {

    constructor({ product, onTick, onError }) {
        this.product = product
        this.onTick = onTick
        this.onError = onError
        this.running = false
    }

    start() {
        console.log("Starting Ticker");
        
        this.running = true
        this.client = new coinbase.WebsocketClient(
            [this.product],
            config.COINBASE_WS_URL,
            null, // no auth required
            { channels: ['ticker', 'heartbeat'] }
        )

        this.client.on('message', async data => {
            if (data.type == 'ticker') {
                await this.onTick(data)
            }
        })

        this.client.on('error', err => {
            this.onError(err)
            this.client.connect()
        })

        this.client.on('close', () => {
            if (this.running) {
                this.client.connect()
            }
        })

    }

    stop() {
        this.running = false
        this.client.close()
    }

}

module.exports = exports = Ticker