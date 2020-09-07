const coinbase = require('coinbase-pro')
const config = require('../../configuration')

const key = config.COINBASE_PRO_API_KEY
const secret = config.COINBASE_PRO_API_SECRET
const passphrase = config.COINBASE_PRO_API_PASSPHRASE
const wsUrl = config.COINBASE_WS_URL

class Feed {
    constructor({ product, onUpdate, onError }) {
        this.product = product
        this.onUpdate = onUpdate
        this.onError = onError
        this.running = false
    }

    async start() {
        console.log("Starting Feed");
        console.log("API Key: " + key);
        console.log("API Secret: " + secret);
        console.log("API passphrase: " + passphrase);
        
        this.running = true
        this.socket = new coinbase.WebsocketClient(
            [this.product],
            wsUrl,
            { key, secret, passphrase },
            { channels: ['user', 'heartbeat'] }
        )

        console.log("Socket Message: " + JSON.stringify(this.socket.message));
        console.log("Socket Error: " + JSON.stringify(this.socket.error));

        this.socket.on('message', data => {
            if (data.type === 'heartbeat') {return}
            this.onUpdate(data)
        })

        this.socket.on('open', () => {
            console.log("socket opened")
            
        })

        this.socket.on('error', error => {
            this.onError(error)
            console.log("Feed socket error: " + JSON.stringify(error));
            
            this.socket.connect()
        })

        this.socket.on('close', () => {
            if (this.running) {
                this.socket.connect()
            }
        })
    }

    async stop() {
        this.running = false
        this.socket.close()
    }

    
}

module.exports = exports = Feed