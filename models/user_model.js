var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
mongoose.connect('mongodb://localhost/nodeauth');
var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
	username: {type: String, index: true},
	password: {type: String, required : true, bcrypt: true},
	email: {type: String},
	name: {type: String},
	profileimage: {type: String}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch){
		if(err) throw err;
		callback(null, isMatch);
	});
}

module.exports.getAllUser = function(callback){
	User.find(callback);
};

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.createUser = function(newUser, callback) {
	bcrypt.hash(newUser.password, 10, function(err, hash){
		if(err) throw err;
		// set hashed pw
		newUser.password = hash;
		// Create user
		newUser.save(callback);
	});
}

module.exports.updateUser = function(id, newUser, callback) {
	if(newUser.password != ''){
		bcrypt.hash(newUser.password, 10, function(err, hash){
			if(err) throw err;
			// set hashed pw
			newUser.password = hash;
			// Update user
			var upsertData = newUser.toObject();
			// Delete User
			delete upsertData._id;
			// Update User
			User.update({ _id: id }, upsertData, { multi: false }, callback);
		});
	}else{
		var upsertData = newUser.toObject();
		// Delete User
		delete upsertData._id;
		// Update User
		User.update({ _id: id }, upsertData, { multi: false }, callback);
	}
}