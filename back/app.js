const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const axios = require('axios');

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/webhook', async (req, res) => {
    try{
        let reply_token = req.body.events[0].replyToken
        if(req.body.events[0].message.text){
            let msg = req.body.events[0].message.text.toLowerCase();
            msg = msg.trim()
            const textsum = await aigen(msg)
            console.log(textsum)
            reply(reply_token, textsum)
           return res.sendStatus(200)
        }else{
            return res.sendStatus(400)
        }
    }catch(err){
        return res.sendStatus(500)
    }
})

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });

async function aigen(msg) {
    try {
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${msg}`);
        const data = response.data;
        let checkNoun = true
        let checkVerb = true
        let test = ''
        
        data.forEach((item,index) => {
            
            if(item.word == msg && (checkNoun == true || checkVerb == true)){
                const meaning = item.meanings
                meaning.forEach((i,j)=>{
                    if(i.partOfSpeech == 'noun' && checkNoun == true){
                        const randomarray = Math.floor(Math.random() * i.definitions.length);
                        const randomtext = i.definitions[randomarray].definition
                        test += `Noun: ${randomtext}\n` 
                        checkNoun = false;
                    }
                    if(i.partOfSpeech == 'verb' && checkVerb == true){
                        const randomarray = Math.floor(Math.random() * i.definitions.length);
                        const randomtext = i.definitions[randomarray].definition
                        test += `Verb: ${randomtext}\n` 
                        checkVerb = false;
                    }
                })
               
            }

        });

        return test;

      } catch (error) {
        // console.error('Error fetching data:', error);
        
        return 'data not found';
      }


}


function reply(reply_token, msg) {
    
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer {6RfAaySFER7u4talSDzOPxJPc6ndWPFXIfaEaVbny4tjBgnnUW/7mrO3uJL7KYQd9ToYkdjiUtd7dNJxt/OIICwTi9xjfDgvXog/cgn90NHQoGpz8vFFaLEsX3ec8k4w5aWeECh12tnxep9n47yqfgdB04t89/1O/w1cDnyilFU=}`
        }
        let body = JSON.stringify({
            replyToken: reply_token,
            messages: [{
                type: 'text',
                text: msg
            }]
        })
        request.post({
            url: 'https://api.line.me/v2/bot/message/reply',
            headers: headers,
            body: body
        }, (err, res, body) => {
            console.log('status = ' + res.statusCode);
        });
    
   
}