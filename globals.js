var DEBUG = false;

var ROM_buffer = null;
var ROM = null;

var MEM_buffer = new ArrayBuffer(4096);
var MEM = new Uint8Array(MEM_buffer);

var keyboard = new Array(16);

var wait_for_keypress =  false;
var register_for_keypress = null;

var register = {

	DT: 0, //delay timer
	ST: 0, //sound timer

	I:  0,

	V: new Array(16)
}

var PC = 0;
var SP = 0;

var STACK_buffer = new ArrayBuffer(32);
var STACK = new Uint16Array(STACK_buffer);

var display = new Array(2048);

var fps60 = Math.floor(1000/60);

var OpCode = 0x0000;

var stop = false;
var screen = null;

var cpu_process = null;
var draw_process = null;
