const Strategy = require('./strategy')

class SimpleStrategy extends Strategy {

    async run ({ sticks, time }) {

        console.log("Running on Simple Strategy");
        
        const len = sticks.length

        if (len < 20) { return }

        const penu = sticks[len - 2].close
        const last = sticks[len - 1].close
        const price = last        

        const open = this.openPositions()

        console.log(`Open positions: ${open.length}`);
        console.log(`Penu: ${penu}`);
        console.log(`last: ${last}`);

        
        if (open.length == 0) {  
                      
            // if (last < penu) {
                console.log("We should Buy");
                
                this.onBuySignal({ price, time })
            // }

        } else if ( last > penu ) {
                
            open.forEach(p => {
                if (p.enter.price * 1.01 < price) {
                    console.log("We should sell")
                    this.onSellSignal({             
                        price, size: p.enter.size, time, position: p
                    })
                }
            })
        }
    } 
}

module.exports = SimpleStrategy