var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();
var User = require('../models/user_model')

/* GET users listing. */
router.get('/', function(req, res, next) {
  	res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  	res.render('register', {
  		'title': 'Register'
  	});
});


router.get('/login', function(req, res, next) {
  	res.render('login', {
  		'title': 'Login'
  	});
});

router.get('/edit/:id', function(req, res, next) {
  	var user_id = req.params.id;
  	User.getUserById(user_id, function(err, users){
		if(err) throw err;
		console.log('user'+users);
		res.render('edit_user', {
	      	title: 'Update User',
	      	users: users
	    });
	});
});


router.post('/register', function(req, res, next) {
  	// Get form values
  	var name = req.body.name;
  	var email = req.body.email;
  	var username = req.body.username;
  	var password = req.body.password;
  	var password2 = req.body.password2;


	// Check for image field
	if(req.files.profileimage){
		console.log('Uploading File........');

		var profileimageOriginalName = req.files.profileimage.originalname;
		var profileimageName 		 = req.files.profileimage.name;
		var profileimageMime 		 = req.files.profileimage.mimetyoe;
		var profileimagePath 		 = req.files.profileimage.path;
		var profileimageExt 		 = req.files.profileimage.extention;
		var profileimageSize 		 = req.files.profileimage.size;
	}else{
		// Set a default image
		var profileimageName = 'noimage.png';
	}

	// Form Validation
	req.checkBody('name', 'Name Field is required').notEmpty();
	req.checkBody('email', 'Email Field is required').notEmpty();
	req.checkBody('email', 'Invalid Email').isEmail();
	req.checkBody('username', 'Username Field is required').notEmpty();
	req.checkBody('password', 'Password Field is required').notEmpty();req.checkBody('name', 'Name Field is required').notEmpty();
	req.checkBody('password2', 'Password not matched').equals(req.body.password);

	// Check for error
	var errors = req.validationErrors();
	if(errors){
		res.render('register', {
			errors : errors,
			name: name,
			email: email,
			username: username,
			password: password,
			password2: password2
		});
	}else{
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password,
			profileimage: profileimageName
		});

		// Create User
		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
			// Success Message
			req.flash('success', 'You are now registered and may log in');
			res.redirect('/');
		});
	}
});

router.post('/update_user/:id', function(req, res, next) {
	userid = req.params.id;
  	// Get form values
  	var name = req.body.name;
  	var email = req.body.email;
  	var username = req.body.username;
  	var password = req.body.password;
  	var password2 = req.body.password2;


	// Check for image field
	if(req.files.profileimage){
		console.log('Uploading File........');

		var profileimageOriginalName = req.files.profileimage.originalname;
		var profileimageName 		 = req.files.profileimage.name;
		var profileimageMime 		 = req.files.profileimage.mimetyoe;
		var profileimagePath 		 = req.files.profileimage.path;
		var profileimageExt 		 = req.files.profileimage.extention;
		var profileimageSize 		 = req.files.profileimage.size;
	}else{
		// Set a default image
		var profileimageName = 'noimage.png';
	}

	// Form Validation
	req.checkBody('name', 'Name Field is required').notEmpty();
	req.checkBody('email', 'Email Field is required').notEmpty();
	req.checkBody('email', 'Invalid Email').isEmail();
	req.checkBody('username', 'Username Field is required').notEmpty();
	req.checkBody('password2', 'Password not matched').equals(req.body.password);

	// Check for error
	var errors = req.validationErrors();
	if(errors){
		res.render('register', {
			errors : errors,
			name: name,
			email: email,
			username: username,
			password: password,
			password2: password2
		});
	}else{
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password,
			profileimage: profileimageName
		});

		// Update User
		User.updateUser(userid, newUser, function(err, user){
			if(err) throw err;
			console.log(user);
			// Success Message
			req.flash('success', 'Your Profile has been Updated');
			res.redirect('/');
		});
	}
});

passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	User.getUserById(id, function(err, user){
		done(err, user);
	});
});

passport.use(new LocalStrategy(
	function(username, password, done){
		User.getUserByUsername(username, function(err, user){
			if(err) throw err;
			if(!user){
				console.log('Unknown User');
				return done(null, false, {message: 'Unknown User'});
			}
			User.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null, user);
				}else{
					console.log('Invalid Password');
					return done(null, false, {message: 'Invalid Password'});
				}
			});
		});
	}
));

router.post('/login', passport.authenticate('local', {failureRedirect: '/users/login', failureFlash : 'Invalid Username or Password'}), function(req, res){
	console.log('Authentication Successful');
	req.flash('success', 'You are Successfully Logged in');
	res.redirect('/');
});

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You have logged out');
	res.redirect('/users/login');
});

module.exports = router;
