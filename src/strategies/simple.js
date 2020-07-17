const Strategy = require('./strategy')

class SimpleStrategy extends Strategy {

    async run ({ sticks, time }) {
        const len = sticks.length

        if (len < 20) { return }

        const penu = sticks[len - 2].close
        const last = sticks[len - 1].close
        const price = last        

        const open = this.openPositions()
        
        if (open.length == 0) {  
                      
            if (last < penu) {
                this.onBuySignal({ price, time })
            }

        } else if ( last > penu ) {
                
            open.forEach(p => {
                
                this.onSellSignal({ 
                    price, size: p.enter.size, time, position: p
                })
            })
        }
    } 
}

module.exports = SimpleStrategy