const Candelstick = require('../models/candelsticks/candlestick')
const Historical = require('../historical')
const { Simple } = require('../strategies')
const randomString = require('randomstring')

class Backtester {
    constructor({ start, end, interval, product}) {
        this.startTime = start
        this.endTime = end
        this.interval = interval
        this.product = product

        this.historical = new Historical ({
            start, end, interval, product
        })
    }

    async start() {
        try {
            const history = await this.historical.getData()
            
            this.strategy = new Simple({
                onBuySignal: (x) => { this.onBuySignal(x)},
                onSellSignal: (x) => { this.onSellSignal(x)}
            })

            await Promise.all(history.map((stick, index) => {
                const sticks = history.slice(0, index + 1)
                return this.strategy.run({
                    sticks, time: stick.startTime
                })
            }))
        } catch (error) {
            console.log(error);           
        }
    }

    async onBuySignal({ price, time }) {
        console.log(`BUY SIGNAL`);
        const id = randomString.generate(20)
        this.strategy.positionOpened({
            price, time, size: 1.0, id
        })    
    }

    async onSellSignal({ price, size, time, position}) {
        console.log('SELL SIGNAL');
        this.strategy.positionClosed({
            price, time, size, id: position.id
        })
    }
}

module.exports = Backtester

