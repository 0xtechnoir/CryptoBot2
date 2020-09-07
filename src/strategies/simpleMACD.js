const Strategy = require('./strategy')
const tulind = require('tulind')

// MACD = Moving Average Convergence/Divergence 

class SimpleMACD extends Strategy {
    async run({ sticks, time }) {

        console.log("Running on SimpleMACD Strategy");
        
        const prices = sticks.map(stick => stick.average())

        const shortPeriod = 12
        const longPeriod = 26
        const signalPeriod = 9
        const indicator = tulind.indicators.macd.indicator

        const results = await indicator([prices], [shortPeriod, longPeriod, signalPeriod])

        const histogram = results[2]
        const signal = results[1]
        const macd = results[0]
        
        const length = histogram.length
        if (length < 2) { return }

        const penultimate = histogram[length - 2]
        const last = histogram[length - 1]


        const boundary = 0.3

        const wasAbove = penultimate > boundary
        const wasBelow = penultimate < -boundary
        const isAbove = last > boundary
        const isBelow = last < -boundary

        const open = this.openPositions()

        const price = sticks[sticks.length - 1].close

        if (open.length == 0) {
     
            console.log("No open positions");
            console.log(`Boundary: ${boundary}`);
            console.log(`Penultimate: ${penultimate}`);
            console.log(`Last: ${last}`);

            console.log(`Was Above: ${wasAbove}`);
            console.log(`Is Below: ${isBelow}`);

            if (wasAbove && isBelow) {
                console.log("Lets buy");
                
                this.onBuySignal({ price, time })
            }
        } else {

            console.log("We have open poistions");
            
            open.forEach(p => {
                if (isAbove && wasBelow) {
                    open.forEach(p => {
                        if (price > p.enter.price * 1.02) {
                            console.log("We should sell");
                            
                            this.onSellSignal({ price, time, size: p.enter.size, position: p })
                        }
                    })
                
                } else {
                    // if (p.enter.price * 0.95 > price) {
                    //     this.onSellSignal({ price, time, size: p.enter.size, position: p })
                    // }
                }
            })
            
        }
    
    }
}

module.exports = SimpleMACD