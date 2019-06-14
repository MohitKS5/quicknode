const request = require('request');
const slack = require('./slack');
class Getres{
    ping(){
        setInterval(() =>
            request.get('http://results.jeeadv.ac.in', (err,res,body) => {
                if(body.search('502 Server Error')!==88) {
                    console.log('DONE',body);
                    slack.message(`it came`,'general')
                }
            }),3000)
    }
}

module.exports = new Getres();
