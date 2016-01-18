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

exports.tracks = {
	1: {
		name: 'Cute',
		url: '/media/Cute.mp3'
		namepic: 'dio'
		urlpic: 'iyi'
	},
	2: {
		name: 'Dubstep',
		url: '/media/Dubstep.mp3'
		namepic: 'dio'
		urlpic: 'iyi'		
	},
	3: {
		name: 'Epic',
		url: '/media/Epic.mp3'
		namepic: 'dio'
		urlpic: 'iyi'		
	},
	4: {
		name: 'Littleidea',
		url: '/media/Littleidea.mp3'
		namepic: 'dio'
		urlpic: 'iyi'		
	}
};
