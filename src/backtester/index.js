const Candelstick = require('../models/candelsticks/candlestick')
const randomString = require('randomstring')
const Runner = require('../runner')

class Backtester extends Runner {

    async start() {
        console.log("Backtesting");

        try {
            const history = await this.historical.getData()
            
            await Promise.all(history.map((stick, index) => {
                const sticks = history.slice(0, index + 1)
                return this.strategy.run({
                    sticks, time: stick.startTime
                })
            }))

            this.printPositions()
            this.printProfit()

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

