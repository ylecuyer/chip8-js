var DEBUG = false;

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

function decrease_DT() {
	if (register.DT > 0)
		register.DT--;
	
	setTimeout(decrease_DT, fps60);
}

function decrease_ST() {
	
	if (register.ST > 0)
		register.ST--;

	setTimeout(decrease_ST, fps60);
}

var OpCode = 0x0000;

function Op0nnn_sys(addr) {
	if (DEBUG)
		console.log("Op0nnn_sys(" + addr.toString(16) + ")");
	//STACK[SP] = PC;
	//SP--;
	//PC = addr;
}

function Op00E0_cls() {
	if (DEBUG)
		console.log("Op00E0_cls()");
	for (var i = 0; i < 64*32; i++) 
		display[i] = 0; //TODO check if it its really 0		
}

function Op00EE_ret() {
	if (DEBUG)
		console.log("Op00EE_ret()");
	SP++;
	PC = STACK[SP];	
}

function Op1nnn_jp(addr) {
	if (DEBUG)
		console.log("Op1nnn_jp(" + addr.toString(16) + ")");
	PC = addr;
}

function Op2nnn_call(addr) {
	if (DEBUG)
		console.log("Op2nnn_call(" + addr.toString(16) + ")");
	STACK[SP] = PC;
	SP--;
	PC = addr;
}

function Op3xkk_se(Vx, kk) {
	if (DEBUG)
		console.log("Op3xkk_se(V" + Vx.toString(16) + ", " + kk.toString(16) + ")");
	if (register.V[Vx] == kk)
		PC += 0x2;
}

function Op4xkk_sne(Vx, kk) {
	if (DEBUG)
		console.log("Op4xkk_sne(V" + Vx.toString(16) + ", " + kk.toString(16) + ")");
	if (register.V[Vx] != kk)
		PC += 0x2;
}

function Op5xy0_se(Vx, Vy) {
	if (DEBUG)
		console.log("Op5xy0_se(V" + Vx.toString(16) + ", V" + Vy.toString(16) + ")");
	if (register.V[Vx] == register.V[Vy])
		PC += 0x2;
}

function Op6xkk_ld(Vx, kk) {
	if (DEBUG)
		console.log("Op6xkk_ld(V" + Vx.toString(16) + ", " + kk.toString(16) + ")");
	register.V[Vx] = kk;
}

function Op7xkk_add(Vx, kk) {
	if (DEBUG)
		console.log("Op7xkk_add(V" + Vx.toString(16) + ", " + kk.toString(16) + ")");
	register.V[Vx] = (register.V[Vx] + kk) & 0xFF;//No carry generated
}

function Op8xy0_ld(Vx, Vy) {
	if (DEBUG)
		console.log("Op8xy0_ld(V" + Vx.toString(16) + ", V" + Vy.toString(16) + ")");
	register.V[Vx] = register.V[Vy];
}

function Op8xy1_or(Vx, Vy) {
	if (DEBUG)
		console.log("Op8xy1_or(V" + Vx.toString(16) + ", V" + Vy.toString(16) + ")");
	register.V[Vx] |= register.V[Vy];
}

function Op8xy2_and(Vx, Vy) {
	if (DEBUG)
		console.log("Op8xy2_and(V" + Vx.toString(16) + ", V" + Vy.toString(16) + ")");
	register.V[Vx] &= register.V[Vy];
}

function Op8xy3_xor(Vx, Vy) {
	if (DEBUG)
		console.log("Op8xy3_xor(V" + Vx.toString(16) + ", V" + Vy.toString(16) + ")");
	register.V[Vx] ^= register.V[Vy];
}

function Op8xy4_add(Vx, Vy) {
	if (DEBUG)
		console.log("Op8xy4_add(V" + Vx.toString(16) + ", V" + Vy.toString(16) + ")");
	var temp =  register.V[Vx] + register.V[Vy];
	register.V[0xF] = (temp > 255)?1:0;
	register.V[Vx] = (temp & 0xFF);
}

function Op8xy5_sub(Vx, Vy) {
	if (DEBUG)
		console.log("Op8xy5_sub(V" + Vx.toString(16) + ", V" + Vy.toString(16) + ")");
	register.V[0xF] = (register.V[Vx] > register.V[Vy])?1:0;
	register.V[Vx] = (register.V[Vx] - register.V[Vy])&0xFF;//TODO verify if & 0xFF is needed
}

function Op8xy6_shr(Vx, Vy) {
	if (DEBUG)
		console.log("Op8xy6_shr(V" + Vx.toString(16) + "{, V" + Vy.toString(16) + "})");
	register.V[0xF] = register.V[Vx] & 0x1;
	register.V[Vx] >>= 1;//TODO check why Vy is not used
}

function Op8xy7_subn(Vx, Vy) {
	if (DEBUG)
		console.log("Op8xy7_subn(V" + Vx.toString(16) + ", V" + Vy.toString(16) + ")");
	register.V[0xF] = (register.V[Vy] > register.V[Vx])?1:0;
	register.V[Vx] = (register.V[Vy] - register.V[Vx])&0xFF;//TODO verify if & 0xFF is needed
}

function Op8xyE_shl(Vx, Vy) {
	if (DEBUG)
		console.log("Op8xy6_shr(V" + Vx.toString(16) + "{, V" + Vy.toString(16) + "})");
	register.V[0xF] = (register.V[Vx] & 0x80) >> 7;
	register.V[Vx] = (register.V[Vx] << 1)&0xFF;//TODO check why Vy is not used
}

function Op9xy0_sne(Vx, Vy) {
	if (DEBUG)
		console.log("Op9xy0_sne(V" + Vx.toString(16) + ", V" + Vy.toString(16) + ")");
	if (register.V[Vx] != register.V[Vy])
		PC += 0x2;
}

function OpAnnn_ld(addr) {
	if (DEBUG)
		console.log("OpAnnn_ld(" + addr.toString(16) + ")");
	register.I = addr;
}

function OpBnnn_jp(addr) {
	if (DEBUG)
		console.log("OpBnnn_jp(" + addr.toString(16) + ")");
	PC = (addr + register.V[0]);
}

function OpCxkk_rnd(Vx, kk) {
	if (DEBUG)
		console.log("OpCxkk_rnd(V" + Vx.toString(16) + ", " + kk.toString(16) + ")");
	register.V[Vx] = (Math.floor(Math.random()*256)) & kk;
}

function OpDxyn_drw(Vx, Vy, n) {
	if (DEBUG)
		console.log("OpDxyn_drw(V" + Vx.toString(16) + ", V" + Vy.toString(16) + ", " + n + ")");

	register.V[0xF] = 0;
	var x = register.V[Vx];
	var y = register.V[Vy];

	for (var i = 0; i < n; i++) {
		
		var sprite = MEM[register.I + i];

		for (var j = 0; j < 8; j++) {
	
			if (display[(x + j) + (y + i)*64] == 1)
				register.V[0xF] = 1;

			display[(x + j) + (y + i)*64] ^= ((sprite & (1 << (7 - j))) >> (7 - j));
			//TODO check overflows x & y
		}

	}
}

function OpEx9E_skp(Vx) {
	if (DEBUG)
		console.log("OpEx9E_skp(V" + Vx.toString(16) + ")");
	if (keyboard[register.V[Vx]] == 1)
		PC += 0x2;
}

function OpExA1_sknp(Vx) {
	if (DEBUG)
		console.log("OpExA1_sknp(V" + Vx.toString(16) + ")");
	if (keyboard[register.V[Vx]] == 0)
		PC += 0x2;
}

function OpFx07_ld(Vx) {
	if (DEBUG)
		console.log("OpFx07_ld(V" + Vx.toString(16) + ")");
	register.V[Vx] = register.DT;
}

function OpFx0A_ld(Vx) {
	if (DEBUG)
		console.log("OpFx0A_ld(V" + Vx.toString(16) + ")");
	wait_for_keypress = true;
	register_for_keypress = Vx;
}	

function OpFx15_ld(Vx) {
	if (DEBUG)
		console.log("OpFx15_ld(V" + Vx.toString(16) + ")");
	register.DT = register.V[Vx];
}	

function OpFx18_ld(Vx) {
	if (DEBUG)
		console.log("OpFx18_ld(V" + Vx.toString(16) + ")");
	register.ST = register.V[Vx];
}	

function OpFx1E_add(Vx) {
	if (DEBUG)
		console.log("OpFx1E_add(V" + Vx.toString(16) + ")");
	register.I += register.V[Vx];//TODO check carry //TODO check if 0xFFF is needed (I seems to be a 12bit register)
}

function OpFx29_ld(Vx) {
	if (DEBUG)
		console.log("OpFx29_ld(V" + Vx.toString(16) + ")");
	register.I = register.V[Vx] * 0x5;
}

function OpFx33_ld(Vx) {
	if (DEBUG)
		console.log("OpFx33_ld(V" + Vx.toString(16) + ")");
	temp = register.V[Vx];
	for (var i = 0; i < 3; i++) {
		MEM[register.I + 2 - i] = (temp % 10);
		temp = Math.floor(temp/10);
	}
}

function OpFx55_ld(Vx) {
	if (DEBUG)
		console.log("OpFx55_ld(V" + Vx.toString(16) + ")");
	for (var i = 0; i <= Vx; i++)
		MEM[register.I + i] = register.V[i]; //TODO check if I needs to be incremented
}

function OpFx65_ld(Vx) {
	if (DEBUG)
		console.log("OpFx65_ld(V" + Vx.toString(16) + ")");
	for (var i = 0; i <= Vx; i++)
		register.V[i] = MEM[register.I + i];
}

var stop = false;
var screen = null;

function init_chip8() {

	if (DEBUG)
		console.log("Init chip8");

	PC = 0x200; //Chip8 programs begin at 0x200
	
	SP = 0xF; //Stack pointer at the top of the stack
	
	//Clear Screen
	for (var i = 0; i < 64; i++) {
		for (var j = 0; j < 32; j++) {
			display[i + j*64] = 0;
		}
	}

	//Clear Memory
	//for (var i = 0; i <= 0xFFF; i++)
	//	MEM[i] = 0;


	//Clear registers
	for (i = 0; i <= 0xF; i++)
		register.V[i] = 0;
	register.I  = 0;
	register.DT = 0;
	register.ST = 0;


	//Clear STACK
	for (i = 0; i <= 0xF; i++)
		STACK[i] = 0;

	//Clear keyboard
	for (i = 0; i <= 0xF; i++)
		keyboard[i] = 0;
}

function init() {

	screen = $("#screen");

	screen
		.clearCanvas()
		.drawRect({
			fillStyle: "black",
			x: 0,
			y: 0,
			width: 256,
			height: 128,
			fromCenter: false
		});
	

	
	init_chip8();

	//Copy ROM inside the memory
	//for (var i = 0; i < ROM_buffer.byteLength; i += 0x1) {
	//	MEM[i + 0x200] = ROM[i];
	//}
	

	/*
	//CUSTOM ROM

	//0x6302 - Set 2 into V3
	MEM[0x200] = 0x63;
	MEM[0x201] = 0x02;

	//0xF329 - Points I to sprite 2
	MEM[0x202] = 0xF3;
	MEM[0x203] = 0x29;

	//0x6000 - Set V0 (x) to 0
	MEM[0x204] = 0x60;
	MEM[0x205] = 0x00;

	//0x6100 - Set V1 (y) to 0
	MEM[0x206] = 0x61;
	MEM[0x207] = 0x00;

	//OxD015 - Draw 5 lines from I
	MEM[0x208] = 0xD0;
	MEM[0x209] = 0x15;

	//0x120A - Infinite loop
	MEM[0x20A] = 0x12;
	MEM[0x20B] = 0x0A;
	*/

	run();
}

var cpu_process = null;
var draw_process = null;

function run() {
		
	dt_process = setTimeout(decrease_DT, fps60);
	st_process = setTimeout(decrease_ST, fps60);

	//console.log("PC = 0x" + PC.toString(16));
	process_opcode_ex();
	draw();


}

function draw() {

	for (var i = 0; i < 64; i++) {
		for (var j = 0; j < 32; j++) {

			screen	
				.drawRect({
					fillStyle: (display[i + j*64])?"white":"black",
					x: i*4,
					y: j*4,
					width: 4,
					height: 4,
					fromCenter: false
				});

		}
	}

	draw_process = setTimeout(draw, fps60);

}

function process_opcode() {

	var OpCode = (MEM[PC] << 8) + (MEM[PC+0x1]);

	var Op1 = (OpCode & 0xF000) >> 12;
	var Op2 = (OpCode & 0x0F00) >> 8;
	var Op3 = (OpCode & 0x00F0) >> 4;
	var Op4 = (OpCode & 0x000F) >> 0;

	if (DEBUG)
		console.log("Process Opcode : " + OpCode.toString(16));

	PC += 0x2;

	switch (Op1) {

		case 0x0:
			switch (Op2) {

				case 0x0:
					switch (Op3) {

						case 0xE:
							switch (Op4) {

								case 0x0: //00E0 - CLS
									Op00E0_cls();
									break;

								case 0xE: //00EE - RET
									Op00EE_ret();
									break;

								default:
									Op0nnn_sys((Op2 << 8) + (Op3 << 4) + (Op4));
									break;
							}
							break;

						default:
							Op0nnn_sys((Op2 << 8) + (Op3 << 4) + (Op4));
							break;
					}
					break;

				default:
					Op0nnn_sys((Op2 << 8) + (Op3 << 4) + (Op4));
					break;
			}
			break;

		case 0x1: //1nnn_jp
			Op1nnn_jp((Op2 << 8) + (Op3 << 4) + Op4);
			break;

		case 0x2: //2nnn_call
			Op2nnn_call((Op2 << 8) + (Op3 << 4) + Op4);
			break;

		case 0x3: //3xkk_se
			Op3xkk_se(Op2, (Op3 << 4) + Op4);
			break;

		case 0x4: //4xkk_sne
			Op4xkk_sne(Op2, (Op3 << 4) + Op4);
			break;

		case 0x5:
			switch (Op4) {
				case 0x0: // 5xy0_se
					Op5xy0_se(Op2, Op3);
					break;
			}	
			break;

		case 0x6: //6xkk_ld
			Op6xkk_ld(Op2, (Op3 << 4) + Op4);
			break;

		case 0x7: //7xkk_add
			Op7xkk_add(Op2, (Op3 << 4) + Op4);
			break;

		case 0x8:
			switch (Op4) {

				case 0x0: //8xy0_ld
					Op8xy0_ld(Op2, Op3);
					break;

				case 0x1: //8xy1_or
					Op8xy1_or(Op2, Op3);
					break;

				case 0x2: //8xy2_and
					Op8xy2_and(Op2, Op3);
					break;

				case 0x3: //8xy3_xor
					Op8xy3_xor(Op2, Op3);
					break;

				case 0x4: //8xy4_add
					Op8xy4_add(Op2, Op3);
					break;

				case 0x5: //8xy5_sub
					Op8xy5_sub(Op2, Op3);
					break;

				case 0x6: //8xy6_shr
					Op8xy6_shr(Op2, Op3);
					break;

				case 0x7: //8xy7_subn
					Op8xy7_subn(Op2, Op3);
					break;

				case 0xE: //8xyE_shl
					Op8xyE_shl(Op2, Op3);
					break;
			}	
			break;

		case 0x9:
			switch (Op4) {

				case 0x0: //9xy0_sne
					Op9xy0_sne(Op2, Op3);
					break;
			}
			break;

		case 0xA: //Annn_ld
			OpAnnn_ld((Op2 << 8) + (Op3 << 4) + Op4);
			break;

		case 0xB: //Bnnn_jp
			OpBnnn_jp((Op2 << 8) + (Op3 << 4) + Op4);
			break;

		case 0xC: //Cxkk_rnd
			OpCxkk_rnd(Op2, (Op3 << 4) + Op4);
			break;

		case 0xD: //Dxyn_drw
			OpDxyn_drw(Op2, Op3, Op4);
			break;

		case 0xE:
			switch (Op3) {

				case 0x9:
					switch (Op4) {

						case 0xE: //Ex9E_skp
							OpEx9E_skp(Op2);
							break;
					}
					break;

				case 0xA:
					switch (Op4) {

						case 0x1: //ExA1_sknp
							OpExA1_sknp(Op2);
							break;

					}
					break;
			}
			break;

		case 0xF:
			switch (Op3) {

				case 0x0:
					switch (Op4) {

						case 0x7: //Fx07_ld
							OpFx07_ld(Op2);
							break;

						case 0xA: //Fx0A_ld
							OpFx0A_ld(Op2);
							break;

					}
					break;

				case 0x1:
					switch (Op4) {

						case 0x5: //Fx15_ld
							OpFx15_ld(Op2);
							break;

						case 0x8: //Fx18_ld
							OpFx18_ld(Op2);
							break;

						case 0xE: //Fx1E_add
							OpFx1E_add(Op2);
							break;
					}
					break;

				case 0x2:
					switch (Op4) {

						case 0x9: //Fx29_ld
							OpFx29_ld(Op2);
							break;

					}
					break;

				case 0x3:
					switch (Op4) {

						case 0x3: //Fx33_ld
							OpFx33_ld(Op2);
							break;

					}
					break;

				case 0x5:
					switch (Op4) {

						case 0x5: //Fx55_ld
							OpFx55_ld(Op2);
							break;
					}
					break;

				case 0x6:
					switch (Op4) {

						case 0x5: //Fx65_ld
							OpFx65_ld(Op2);
							break;

					}
					break;
			}
			break;
	}	

}

function process_opcode_ex() {

	process_opcode();

	if (DEBUG) {
		console.log(PC.toString(16));
		console.log(SP.toString(16));
		console.log(STACK);
		console.log(register);
	}

	if (wait_for_keypress != true)
		cpu_process = setTimeout(process_opcode_ex, 1);

}

