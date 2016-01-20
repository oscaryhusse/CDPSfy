var express = require('express');
var fs = require('fs');
var http = require('http');
var mongoose = require('mongoose');
var needle = require('needle');
var querystring = require('querystring');

var info = '';
var music = mongoose.model('Music');

// Devuelve una lista de las canciones disponibles y sus metadatos
exports.list = function (req, res) {
	music.find(function(err, tracks) {
		if (err)
			res.send(500, err.message);
		res.render('tracks/index', {tracks: tracks});
	});
};

// Devuelve la vista del formulario para subir una nueva canción
exports.new = function (req, res) {
	res.render('tracks/new', {info:info});
};

// Devuelve la vista de reproducción de una canción.
// El campo track.url contiene la url donde se encuentra el fichero de audio
exports.show = function (req, res) {
	console.log(req.params);
	music.findOne({name: req.params.trackId}, function(err, track) {
	if (err)
		return res.send(500, err.message);
	res.render('tracks/show', {track: track});
	});
};

// Escribe una nueva canción en el registro de canciones.
// Escribe en tracks.cdpsfy.es el fichero de audio contenido en req.files.track.buffer
// Escribe en la base de data la verdadera url generada al añadir el fichero en el servidor tracks.cdpsfy.es
exports.create = function (req, res) {
	var track = req.files.track;

	if (track !== undefined) {
		console.log('New tracks. Info: ', track);
		var id = track.name.split('.')[0];
		var name = track.originalname.split('.')[0];
		var data = track.buffer;
//		var original = track.originalname; 
		var ext = track.extension;

		if (ext !== 'mp3' || ext !== 'wav' || ext !== 'ogg') {
			console.log('Please upload .mp3, .ogg or .wav tracks');
			res.redirect('/tracks');
		} else {
			console.log(ext);
			var cover = req.files.cover;

			if (cover !== undefined) {
				console.log('New cover. Info ', cover);
//				var nameImg = cover.originalname.split('.')[0];
				var datacover =  cover.buffer;
//				var originalImg = cover.originalname;
				var ext1 = cover.extension;

				if (ext1 !== 'jpeg' || ext1 !== 'jpg' || ext1 !== 'png' || ext1 !== 'bmp' || ext1 !== 'gif') {
					console.log('Please upload .jpeg (.jpg), .png, .bmp or .gif images');
				} else {
					var data = {
						cover: {
							buffer		: datacover,
							filename	: cover.originalname,
							content_type: cover.mimetype
						},
						  
						track: {
							buffer		: data,
							filename	: track.originalname,
							content_type: track.mimetype
						}
					}

					var url = 'http://tracks.cdpsfy.es/cancion/' + track.originalname;
					var urlpic = 'http://tracks.cdpsfy.es/imagen/' + cover.originalname;

					music.find({name: name}, function(err, tracks) {
						if (tracks == '') {
							var new_track = new music({
								name: name,
								url: url,
								namepic: cover.originalname,
								urlpic: urlpic
							});

							new_track.save(function(err, new_track) {
								if (err) {
									console.log('Upload failed: ' + err);
								};
							});

							needle.post('http://tracks.cdpsfy.es', data, {multipart: true}, function optionalCallback(err, httpResponse, body) {
								if (err) 
									return console.error('Upload failed:', err);
								console.log('Upload successful. Server response:', body);
								res.redirect('/tracks');
							});
						} else {
							info = 'There is already a track with that name';
							res.render('tracks/new', {info:info});							
						}
					});
				}
			} else {
				var data = {
					track: {
					    buffer      : data,
				    	filename    : track.originalname,
				    	content_type: track.mimetype
					}
 				}

				var url = 'http://tracks.cdpsfy.es/cancion/' + track.originalname;
				var urlpic = 'http://tracks.cdpsfy.es/imagen/cover.jpg';
				
				music.find({name: name}, function(err, tracks) {
					if (tracks == '') {
						var new_track = new music({
							name: name,
							url: url,
							namepic: '',
							urlpic: urlpic
						});

					 	new_track.save(function(err, new_track) {
							if (err)
								console.log('Error al subir el audio: ' + err);
						});

						needle.post('http://tracks.cdpsfy.es', data, {multipart: true}, function optionalCallback(err, httpResponse, body) {
					 		if (err)
								return console.error('upload failed:', err);
							console.log('Upload successful. Server response:', body);
							res.redirect('/tracks');
						});
					} else {
						info = 'There is already a track with that name';
						res.render('tracks/new', {info:info});	
					}
				});
			}
		}
	} else { 
		console.log('Introduzca una canción');
		res.redirect('/tracks');
	}
};

// Elimina en tracks.cdpsfy.es el fichero de audio correspondiente a trackId
exports.destroy = function (req, res) {
	music.findOne({name: req.params.trackId}, function(err, track) {
		music.find({namepic: track.namepic}, function(err, track1) {
			//Si el nombre de la imagen es '' es que usa la imagen por defecto, y por tanto no la borra del servidor
			if (track.namepic !== '' && track1.length == 0){
				needle.request('delete', 'http://tracks.cdpsfy.es/imagen/' + track.namepic, null, function(err, resp) {
					if (err) 
						return console.error('Delete failed:', err);
					console.log('Delete successful!  Server responded with:', resp.body);
				});
			}
		 });

		// Borra la canción de la base de datos
		track.remove(function(err, track) {
			if (err)
				console.log('Error al borrar el audio: ' + err);
		});
	});

	// Petición HTTP para borrar la canción del servidor nas
	needle.request('delete', 'http://tracks.cdpsfy.es/cancion/' + req.params.trackId + '.mp3', null, function(err, resp) {
		if (err)
			return console.error('Delete failed:', err);
		console.log('Delete successful!  Server responded with:', resp.body);
	});

	res.redirect('/tracks');
};
