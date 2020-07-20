const Candelstick = require('../models/candelsticks/candlestick')
const Historical = require('../historical')
const {Factory } = require('../strategies')
const randomString = require('randomstring')
const colors = require('colors/safe')

class Backtester {
    constructor({ start, end, interval, product, strategyType}) {
        this.startTime = start
        this.endTime = end
        this.interval = interval
        this.product = product
        this.strategyType = strategyType

        this.historical = new Historical ({
            start, end, interval, product
        })
    }

    async start() {
        try {
            console.log(`Strategy: ${this.strategyType}`);
            
            const history = await this.historical.getData()
            
            this.strategy = Factory.create(this.strategyType, {
                onBuySignal: (x) => { this.onBuySignal(x)},
                onSellSignal: (x) => { this.onSellSignal(x)}
            })
            
            await Promise.all(history.map((stick, index) => {
                const sticks = history.slice(0, index + 1)
                return this.strategy.run({
                    sticks, time: stick.startTime
                })
            }))

            const positions = this.strategy.getPositions()
            positions.forEach((p) => {
                p.print()
            });

            const total = positions.reduce((r, p) => {
                return r + p.profit()
            }, 0)

            const prof = `${total}`
            const colored = total > 0 ? colors.green(prof) : colors.red(prof)
            console.log(`Total Profit: ${colored}`);
            

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

