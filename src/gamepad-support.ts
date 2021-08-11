// Gamepad support
const MAX_PLAYERS = 2;
const haveEvents  = 'ongamepadconnected' in window;
const controllers: {
  [property: number]: Gamepad
} = {};
// D-PAD AND BUTTONS
// (U, D, L, R, B, A, START)
const buttons     = {
  U : 12,
  D : 13,
  L : 14,
  R : 15,
  B : 2,
  A : 0,
  S : 9
};
const buttonValues = Object.values( buttons );
const buttonKeys = Object.keys( buttons );
// KeyboardEvent keyCode mappings by gamepad
// i.e. - keyCodes[0] maps to the first gamepad,
// pressing (S)TART triggers a keypress for 83 (SPACE)
const keyCodes: {
  [property: string]: number
}[] = [
{
  U : 87,//(W)  //38,
  D : 83,//(S)  //40,
  L : 65,//(A)  //37,
  R : 68,//(D)  //39,
  B : 67,
  A : 32,
  S : 13 //(ENTER)  //83
},
{
  U : 87,
  D : 83,
  L : 65,
  R : 68
}];
const pendingKeyupEvents  = Array( MAX_PLAYERS ).fill({
  U : null,
  D : null,
  L : null,
  R : null,
  B : null,
  A : null,
  S : null
});

function connecthandler(e: GamepadEvent) {
  console.log( '.. adding gamepad:' );
  console.log( e.gamepad );
  addgamepad( e.gamepad );
}

function addgamepad(gamepad: Gamepad) {
  controllers[gamepad.index] = gamepad;

  requestAnimationFrame(updateStatus);
}

function disconnecthandler(e: GamepadEvent) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad: Gamepad) {
  delete controllers[gamepad.index];
}

function updateStatus() {
  if (!haveEvents) {
    scangamepads();
  }

  for (
    let controllerIdx = 0; 
    controllerIdx < Object.keys(controllers).length; 
    controllerIdx++
  ) {

    var controller  = controllers[+Object.keys(controllers)[controllerIdx]];

    // HOME / PS button - enter fullscreen
    if ( controller.buttons[16].pressed ) {
      if ( !document.fullscreen ) {
        document
          .getElementsByTagName( 'canvas' )[0]
          .requestFullscreen();
      }      
    }

    for (let i = 0; i < buttonValues.length; i++) {

        let buttonKey = buttonKeys[i];
        var val = controller.buttons[buttonValues[i]];
        var pressed = val.pressed;
        let pendingKeyupEvent = pendingKeyupEvents[controllerIdx][buttonKey];

        if ( pressed ) {

          let keyCode = keyCodes[controllerIdx][buttonKey];

          // if button is still pressed (pendingKeyupEvent),
          // don't create / dispatch duplicate events
          if ( pendingKeyupEvent && pendingKeyupEvent.keyCode === keyCode )  continue;

          var event: any = document.createEvent('event');
          let keyupEvent: any = document.createEvent('event');
          event.initEvent('keydown', true, true);
          keyupEvent.initEvent('keyup', true, true);
          event.keyCode = keyCode;
          keyupEvent.keyCode = keyCode;
          document.getElementsByTagName( 'canvas' )[0].dispatchEvent( event );

          pendingKeyupEvents[controllerIdx][buttonKey]  = keyupEvent;

        } else if ( pendingKeyupEvent ) {
          document.getElementsByTagName( 'canvas' )[0].dispatchEvent( pendingKeyupEvent );
          
          pendingKeyupEvents[controllerIdx][buttonKey] = null;
        }
    }
  }

  requestAnimationFrame(updateStatus);
}

function scangamepads() {
  var gamepads: Gamepad[] = navigator.getGamepads();
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].index in controllers) {
        controllers[gamepads[i].index] = gamepads[i];
      } else {
        addgamepad(gamepads[i]);
      }
    }
  }
}


window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

if (!haveEvents) scangamepads();