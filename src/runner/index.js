const Historical = require('../historical')
const { Factory } = require('../strategies')
const colors = require('colors/safe')

class Runner {

    constructor({ start, end, interval, product, strategyType}) {
        this.startTime = start
        this.endTime = end
        this.interval = interval
        this.product = product
        this.strategyType = strategyType

        this.historical = new Historical ({
            start, end, interval, product
        })

        console.log(`Strategy Type: ${this.strategyType}`);
        
        this.strategy = Factory.create(this.strategyType, {
            onBuySignal: (x) => { this.onBuySignal(x)},
            onSellSignal: (x) => { this.onSellSignal(x)}
        })
    }

    async printPositions() {
        const positions = this.strategy.getPositions()
        positions.forEach((p) => {
            p.print()
        });
    }

    async printProfit() {
        const positions = this.strategy.getPositions()
        console.log("Positions: " + JSON.stringify(positions));
        
        const total = positions.reduce((accumulator, position) => {
            return accumulator + position.profit()
        }, 0)

        const prof = `${total}`
            const colored = total > 0 ? colors.green(prof) : colors.red(prof)
            console.log(`Total Profit: ${colored}`);
    }

    async start() {}
    async onBuySignal(data) {}
    async onSellSignal(data) {}
    
}
module.exports = exports = Runner