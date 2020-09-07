const Runner = require('../runner')
const Ticker = require('../ticker')
const Broker = require('../broker')
const candlestick = require('../models/candelsticks/candlestick')
const { parse } = require('commander')
const randomString = require('randomstring')


class Trader extends Runner {

    constructor(data) {
        super(data)
        this.funds = data.funds
        this.isLIve = data.live
        this.broker = new Broker({ isLive: this.isLive, product: this.product })
        this.ticker = new Ticker({
            product: this.product,
            onTick: async (tick) => { this.onTick(tick) },
            onError: (error) => { this.onError(error) }
        })
    }

    async start() {
        console.log("Trading Live");
        
        this.currentCandle = null
        this.history = await this.historical.getData()
        this.ticker.start()
        this.broker.start()
    }

    async onBuySignal({ price, time }) {
        console.log(`Trader BUY SIGNAL`);
        const result = await this.broker.buy({ funds: this.funds, price })
        if(!result) { return }
        const id = randomString.generate(20)
        this.strategy.positionOpened({
            price: result.price, time, size: result.size, id
        })    
    }

    async onSellSignal({ price, size, time, position}) {
        console.log('Trader SELL SIGNAL');
        const result = await this.broker.sell({ size, price })
        if(!result) { return }
        this.strategy.positionClosed({
            price: result.price, time, size: result.size, id: position.id
        })
    }

    async onTick(tick) {        
        const parsed = Date.parse(tick.time)
        const time = isNaN(parsed) ? new Date() : new Date(parsed)
        const price = parseFloat(tick.price)
        const volume = parseFloat(tick.last_size)

        console.log(`Time: ${time}     Price: ${price.toFixed(2)}     Volume: ${volume}`);

        try {
            if (this.currentCandle) {
                this.currentCandle.onPrice({ price, volume, time })
            } else {
                this.currentCandle = new candlestick({ 
                    price: price, 
                    volume: volume, 
                    interval: this.interval,
                    startTime: time
                })
            }
            
            const sticks = this.history.slice()
            console.log(`Candlesticl No: ${sticks.length}`);
            
            sticks.push(this.currentCandle)

            await this.strategy.run({
                sticks: sticks,
                time: time
            })

            if (this.currentCandle.state === 'closed') {
                const candle = this.currentCandle
                this.currentCandle = null
                this.history.push(candle)

                this.printPositions()
                this.printProfit()
            }
        } catch (err) {
            console.log(err); 
        }
    }

    onError(error) {

    }

}

module.exports = exports = Trader