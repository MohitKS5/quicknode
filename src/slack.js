const request = require('request');
const fs = require('fs');

class slack {
    message(txt, channel) {
        var payload = {};
        payload.text = txt;
        payload.channel = channel;
        request.post({
            headers: {
                'content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Bearer xoxp-649896602450-661310448213-653654820690-448f7a69f2784c6d376ad4dcd6af95c9'
            },
            url: 'https://slack.com/api/chat.postMessage',
            body: JSON.stringify(payload)
        }, function(error, response, body) {
            console.log(body);
        })
    }
    /**
     * Reads "fileName" and uploads to slack "channel" with "title" and "comment".
     * @param channel
     * @param fileName
     * @param title
     * @param comment
     */
    uploadFile(channel, fileName, title, comment) {
        console.log('[slack]' + fileName + ' to be uploaded on slack: ', channel);
        if (channel.length === 0) return;
        request.post({
            url: 'https://slack.com/api/files.upload',
            headers: {
                'content-type': 'multipart/form-data',
                'Authorization': 'xoxp-649896602450-661310448213-653654820690-448f7a69f2784c6d376ad4dcd6af95c9'
            },
            formData: formData
        }, function (err, res, body) {
            if (err) console.log('[Slack] Error: ', err);
            else if (body && body[6].localeCompare('t') !== 0) console.log('[Slack Error] Response\'s is:', body);
        });
    }
}

module.exports = new slack();
