$(function() {
	var		HERO_IMAGE = 'hero.png',
			PLATFORM_IMAGE = 'platform.png';

	var socket = io();
	var roomcode = 'BALLGAME';

  var username = 'Balljump';
  var jsonstring = '{"username":"' + username + '", "roomname":"' + roomcode + '"}';

	function joinQueryRoom(query) {
		if (query) {
			roomcode = query;
		}

		console.log('Query - ' + query);
		console.log('Roomcode - ' + roomcode);

		roomcode = roomcode.toUpperCase();

	  // $('.insertRoomCode').text(roomcode);
	  $(document).prop('title', 'Ball Game - ' + roomcode);

	  username = 'Balljump' + roomcode;
		console.log('username - ' + username);

	  jsonstring = '{"username":"' + username + '", "roomname":"' + roomcode + '"}';

	  console.log('joining room - ' + roomcode);
	  socket.emit('room', roomcode);
	  socket.emit('add user', jsonstring );
	}

	function getQuery() {
		socket.emit('query request');
	}

	function _game()
	{
		window.Game = this;
		var self = this,
			ticks = 0,
			canvas,
			stage,
			world,
			hero,
			w = getWidth(),
			h = getHeight(),
			assets = [],
			keyDown = false;

		// holds all collideable objects
		var collideables = [];
		self.getCollideables = function() { return collideables; };

		// starts to load all the assets
		self.preloadResources = function() {
			self.loadImage(HERO_IMAGE);
			self.loadImage(PLATFORM_IMAGE);
		}



		var requestedAssets = 0,
			loadedAssets = 0;
		// loads the assets and keeps track
		// of how many assets where there to
		// be loaded
		self.loadImage = function(e) {
			var img = new Image();
			img.onload = self.onLoadedAsset;
			img.src = e;

			assets[e] = img;

			++requestedAssets;
		}
		// each time an asset is loaded
		// check if all assets are complete
		// and initialize the game, if so
		self.onLoadedAsset = function(e) {
			++loadedAssets;
			if ( loadedAssets == requestedAssets ) {
				self.initializeGame();
			}
		}

		self.initializeGame = function() {
			// creating the canvas-element
			canvas = document.createElement('canvas');
			canvas.width = w;
			canvas.height = h;
			document.body.appendChild(canvas);



					socket.emit('room', roomcode);
					socket.emit('add user', jsonstring );


			// initializing the stage
			stage = new Stage(canvas);
			world = new Container();
			stage.addChild(world);

			// creating the Hero, and assign an image
			// also position the hero in the middle of the screen
			hero = new Hero(assets[HERO_IMAGE]);

			self.reset();

			// Setting the listeners
			if ('ontouchstart' in document.documentElement) {
				canvas.addEventListener('touchstart', function(e) {
					self.handleKeyDown();
				}, false);

				canvas.addEventListener('touchend', function(e) {
					self.handleKeyUp();
				}, false);
			} else {
				document.onkeydown = self.handleKeyDown;
				document.onkeyup = self.handleKeyUp;
				document.onmousedown = self.handleKeyDown;
				document.onmouseup = self.handleKeyUp;
			}

			Ticker.setFPS(30);
			Ticker.addListener(self.tick, self);
		}

		// Socket listeners
		socket.on('jump key down', function(){
			console.log('jump down');
			self.handleKeyDown();
		});
		// Socket listeners
		socket.on('jump key up', function(){
			console.log('jump up');
			self.handleKeyUp();
		});

		socket.on('query', function(query) {
	    console.log('query received - ' + query);

	    joinQueryRoom(query);
	  });

	  socket.on('use random query', function() {
	    console.log('no query received starting random');
	  });

		self.reset = function()
		{
			collideables = [];
			self.lastPlatform = null;
			world.removeAllChildren();
			world.x = world.y = 0;

			hero.x = 50;
			hero.y = h/2 + 50;
			hero.reset();
			world.addChild(hero);

			// add a platform for the hero to collide with
			self.addPlatform(50 - assets[PLATFORM_IMAGE].width/2, h/1.25);

			var c, l = w / assets[PLATFORM_IMAGE].width * 1.5, atX=0, atY = h/1.25;

			for ( c = 1; c < l; c++ ) {
				var atX = (c-.5) * assets[PLATFORM_IMAGE].width*2 + (Math.random()*assets[PLATFORM_IMAGE].width-assets[PLATFORM_IMAGE].width/2);
				var atY = atY + Math.random() * 300 - 150;
				self.addPlatform(atX,atY);
			}
		}

		self.tick = function(e)
		{
			ticks++;
			hero.tick();

			if ( hero.y > h*3 ) {
				self.reset();
			}
			// if the hero "leaves" it's bounds of
			// screenWidth * 0.3 and screenHeight * 0.3(to both ends)
			// we will reposition the "world-container", so our hero
			// is allways visible
			if ( hero.x > w*.3 ) {
				world.x = -hero.x + w*.3;
			}
			if ( hero.y > h*.7 ) {
				world.y = -hero.y + h*.7;
			} else if ( hero.y < h*.3 ) {
				world.y = -hero.y + h*.3;
			}

			for ( var c = 0; c < collideables.length; c++ ) {
				var p = collideables[c];
				if ( p.localToGlobal(p.image.width,0).x < -10 ) {
					self.movePlatformToEnd(p);
				}
			}

			stage.update();
		}

		// this method adds a platform at the
		// given x- and y-coordinates and adds
		// it to the collideables-array
		self.lastPlatform = null;
		self.addPlatform = function(x,y) {
			x = Math.round(x);
			y = Math.round(y);

			var platform = new Bitmap(assets[PLATFORM_IMAGE]);
			platform.x = x;
			platform.y = y;
			platform.snapToPixel = true;

			world.addChild(platform);
			collideables.push(platform);
			self.lastPlatform = platform;
		}
		self.movePlatformToEnd = function(platform) {
			platform.x = self.lastPlatform.x + platform.image.width*2 + Math.random()*platform.image.width*2 - platform.image.width;
			platform.y = self.lastPlatform.y + Math.random() * 300 - 150;
			self.lastPlatform = platform;
		}

		self.handleKeyDown = function(e)
		{
			if ( !keyDown ) {
				keyDown = true;
				hero.jump();
			}
		}

		self.handleKeyUp = function(e)
		{
			keyDown = false;
		}

		self.preloadResources();
	};

	getQuery();

	new _game();
});
