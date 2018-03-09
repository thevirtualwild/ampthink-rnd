var locals = {
  'move': {
    "left": 37,
    "up": 38,
    "right": 39,
    "down": 40
  }
}

//keys
var keys = locals['us'],
	activeKeys = [],
	activeBindings = {},
	keyBindingGroups = [];

function getIndexOf(somekey) {
  console.log('get index called on - ' + somekey);
  return activeKeys.indexOf(somekey);
}

function pushKey(somekey) {
  console.log('pushing key to active keys - ' + somekey);
  activeKeys.push(somekey);
}

function spliceKey(somekey) {
  console.log('splicing key - ' + somekey);
  activeKeys.splice(somekey);
}

function keydown(somekey) {
  //lookup the key pressed and save it to the active keys array
  for (var key in keys) {
    if(keys.hasOwnProperty(key) && somekey.keyCode === keys[key]) {
      if(activeKeys.indexOf(key) < 0) {
        activeKeys.push(key);
      }
    }
  }

  //execute the first callback the longest key binding that matches the active keys
  return executeActiveKeyBindings(event);
}

function keyup(somekey) {
  //lookup the key released and prune it from the active keys array
  for(var key in keys) {
    if(keys.hasOwnProperty(key) && somekey.keyCode === keys[key]) {

      var iAK = activeKeys.indexOf(key);

      if(iAK > -1) {
        activeKeys.splice(iAK, 1);
      }
    }
  }

  //execute the end callback on the active key binding
  return pruneActiveKeyBindings(event);
}

//execute the first callback the longest key binding that matches the active keys
return executeActiveKeyBindings(event);
