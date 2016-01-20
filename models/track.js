/* 

Modelo de datos de canciones (track)

track_id: {
	name: nombre de la canción,
	url: url del fichero de audio,
	namepic: nombre de la carátula,
	urlpic: url del fichero de la carátula
} 

*/

var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

var musicSchema = new Schema({  
  name:     { type: String },
  url:      { type: String },
  namepic:  { type: String },
  urlpic:   { type: String },
});

module.exports = mongoose.model('Music', musicSchema);

};
