var express = require('express')
  , request = require('request')
  , multer  = require('multer');


var PORT = process.env.PLEX_WEBHOOK_PORT
var PATH = process.env.PLEX_WEBHOOK_PATH

var events = {
  'media.play':    'plex_media_play',
  'media.resume':  'plex_media_play',
  'media.stop':    'plex_media_pause',
  'media.pause':   'plex_media_pause'
};

var hass_event = (event) => {
  request({
    method: 'post',
    url: 'http://hassio.local:8123/api/events/' + events[event],
    headers: {
      "x-ha-access": process.env.HASS_PASSWORD,
      "Content-Type":"application/json"
    }
  });
};

var app = express();
var upload = multer({ dest: 'thumbs/' }); // creates a 'thumbs' directory at root of project.
                                          // Necessary to process the thumbnail portion of the
                                          // multipart webhook request.

app.post('/' + PATH, upload.single('thumb'), function (req, res, next) {
  payload = JSON.parse(req.body.payload);
  if (payload.Player.title == 'TCLRoku TV - YS00JR926545') {
    console.log('Firing event: ' + payload.event);
    hass_event(payload.event);
  };
  res.send({status: 200});
});

app.listen(PORT, () => console.log('Listening for webhooks to: ' + PATH + ' on port ' + PORT));
