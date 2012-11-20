
function check_chip8(to_be_checked) {

	
	equal(PC, (to_be_checked && to_be_checked.PC) || 0x200, "Program Counter OK");
	equal(SP, (to_be_checked && to_be_checked.SP) || 0xF, "Stack Pointer OK");

	equal(register.I, (to_be_checked && to_be_checked.I) || 0, "Register I OK");
		
	equal(register.V[0x0], (to_be_checked && to_be_checked.V0) || 0, "Register V0 OK");
	equal(register.V[0x1], (to_be_checked && to_be_checked.V1) || 0, "Register V1 OK");
	equal(register.V[0x2], (to_be_checked && to_be_checked.V2) || 0, "Register V2 OK");
	equal(register.V[0x3], (to_be_checked && to_be_checked.V3) || 0, "Register V3 OK");
	equal(register.V[0x4], (to_be_checked && to_be_checked.V4) || 0, "Register V4 OK");
	equal(register.V[0x5], (to_be_checked && to_be_checked.V5) || 0, "Register V5 OK");
	equal(register.V[0x6], (to_be_checked && to_be_checked.V6) || 0, "Register V6 OK");
	equal(register.V[0x7], (to_be_checked && to_be_checked.V7) || 0, "Register V7 OK");
	equal(register.V[0x8], (to_be_checked && to_be_checked.V8) || 0, "Register V8 OK");
	equal(register.V[0x9], (to_be_checked && to_be_checked.V8) || 0, "Register V9 OK");
	equal(register.V[0xA], (to_be_checked && to_be_checked.VA) || 0, "Register VA OK");
	equal(register.V[0xB], (to_be_checked && to_be_checked.VB) || 0, "Register VB OK");
	equal(register.V[0xC], (to_be_checked && to_be_checked.VC) || 0, "Register VC OK");
	equal(register.V[0xD], (to_be_checked && to_be_checked.VD) || 0, "Register VD OK");
	equal(register.V[0xE], (to_be_checked && to_be_checked.VE) || 0, "Register VE OK");
	equal(register.V[0xF], (to_be_checked && to_be_checked.VF) || 0, "Register VF OK");

	equal(DT, (to_be_checked && to_be_checked.DT) || 0, "Delay Timer OK");
	equal(ST, (to_be_checked && to_be_checked.ST) || 0, "Sound Timer OK");
}

test("Chip8 initialization", function() {

	expect(2);

	init_chip8();

	equal(PC, 0x200, "Program Counter OK");
	equal(SP, 0xF, "Stack Pointer OK");

});


test("OpCode 00E0 - CLS", function() {

	//Fill screen with pixels
	for (var i = 0; i < 64*32; i++)
		display[i] = 1;

	//OpCode 00E0 - CLS
	Op00E0_cls();

	//Check if the screen as been cleared
	var clean = true;
	for (var i = 0; i < 64*32; i++)
		if (display[i] != 0) 
			clean = false;

	ok(clean, "Screen cleared successfully");

});

test("OpCode 00EE - RET", function() {

	init_chip8();
	
	PC += 0x2;	
	Op2nnn_call(0x202);//Call 0x202
	
	PC += 0x2;
	Op6xkk_ld(0,1);//Set V0 = 1

	PC += 0x2;	
	Op00EE_ret();
	
	equal(PC, 0x202, "Program Counter OK");
	equal(SP, 0xF, "Stack Pointer OK");
});

test("OpCode 1nnn - JP addr", function() {

	init_chip8();

	PC += 0x2;
	Op1nnn_jp(0x345);

	equal(PC, 0x345, "Program Counter OK");
	equal(SP, 0xF, "Stack Pointer OK");
});

test("OpCode 2nnn - CALL addr", function() {

	init_chip8();

	PC += 0x2;
	Op2nnn_call(0x324);

	equal(PC, 0x324, "Program Counter OK");
	equal(SP, 0xE, "Stack Pointer OK");
	equal(STACK[0xF], 0x202, "Stack OK");
});

test("OpCode 3xkk - SE Vx, byte", function() {

	init_chip8();

	register.V[0xA] = 0x6A;
	
	PC += 0x2;
	Op3xkk_se(0xA, 0x6A);

	equal(PC, 0x204, "Program Counter OK");

});

test("OpCode 4xkk - SNE Vx, byte", function() {

	init_chip8();

	register.V[0xB] = 0xF5;

	PC += 0x2;
	Op4xkk_sne(0xB, 0x24);

	equal(PC, 0x204, "Program Counter OK");

});

test("OpCode 5xy0 - SE Vx, Vy", function() {

	init_chip8();

	register.V[0xC] = 0x64;
	register.V[0x3] = 0x64;

	PC += 0x2;
	Op5xy0_se(0xC, 0x3);

	equal(PC, 0x204, "Program Counter OK");

});

test("OpCode 6xkk - LD Vx, byte", function() {

	init_chip8();

	PC += 0x2;
	Op6xkk_ld(0x6, 0x02);

	equal(register.V[0x6], 0x2);

});

test("OpCode 7xkk - ADD Vx, byte", function() {

});

test("OpCode 8xy0 - LD Vx, Vy", function() {

});

test("OpCode 8xy1 - OR Vx, Vy", function() {

});

test("OpCode 8xy2 - AND Vx, Vy", function() {

});

test("OpCode 8xy3 - XOR Vx, Vy", function() {

});

test("OpCode 8xy4 - ADD Vx, Vy", function() {

});

test("OpCode 8xy5 - SUB Vx, Vy", function() {

});

test("OpCode 8xy6 - SHR Vx {, Vy}", function() {

});

test("OpCode 8xy7 - SUBN Vx, Vy", function() {

});

test("OpCode 8xyE - SHL Vx {, Vy}", function() {

});

test("OpCode 9xy0 - SNE Vx, Vy", function() {

});

test("OpCode Annn - LD I, addr", function() {

});

test("OpCode Bnnn - JP V0, addr", function() {

});

test("OpCode Cxkk - RND Vx, byte", function() {

});

test("OpCode Dxyn - DRW Vx, Vy, nibble", function() {

});

test("OpCode Ex9E - SKP Vx", function() {

});

test("OpCode ExA1 - SKNP Vx", function() {

});

test("OpCode Fx07 - LD Vx, DT", function() {

});

test("OpCode Fx0A - LD Vx, K", function() {

});

test("OpCode Fx15 - LD DT, Vx", function() {

});

test("OpCode Fx18 - LD ST, Vx", function() {

});

test("OpCode Fx1E - ADD I, Vx", function() {

});

test("OpCode Fx29 - LD F, Vx", function() {

});

test("OpCode Fx33 - LD B, Vx", function() {

});

test("OpCode Fx55 - LD [I], Vx", function() {

});

test("OpCode Fx65 - Vx, [I]", function() {

});
