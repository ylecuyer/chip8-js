//An audio source can only be played once 
//http://www.youtube.com/watch?v=hFsCG7v9Y4c&feature=youtu.be&t=18m22s

var context = new webkitAudioContext();

var oscillator = null;
var buzzer_active = false;

function start_buzzer() {

	oscillator = context.createOscillator();

	oscillator.type = oscillator.SINE;
	oscillator.frequency.value = 440;

	oscillator.connect(context.destination);

	oscillator.noteOn(0);
		
	buzzer_active = true;
}


function stop_buzzer() {

	oscillator.noteOff(0);

	buzzer_active = false;

}
