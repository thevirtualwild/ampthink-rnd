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
