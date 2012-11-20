function process_n_opcodes(n) {

	for (var i = 0; i < n; i++)
		process_opcode();

}

function load_custom_ROM(opcodes) {
	
	var nb_opcodes = opcodes.length;
	for (var i = 0; i < nb_opcodes; i++) {
		MEM[0x200 + i*0x2]     = (opcodes[i] & 0xFF00) >> 8;
		MEM[0x200 + i*0x2 + 1] = (opcodes[i] & 0x00FF);
	}

}

function check_stack(to_be_checked) {

	equal(STACK[0x0], (to_be_checked && to_be_checked.S0) || 0, "Stack [0x0]");
	equal(STACK[0x1], (to_be_checked && to_be_checked.S1) || 0, "Stack [0x1]");
	equal(STACK[0x2], (to_be_checked && to_be_checked.S2) || 0, "Stack [0x2]");
	equal(STACK[0x3], (to_be_checked && to_be_checked.S3) || 0, "Stack [0x3]");
	equal(STACK[0x4], (to_be_checked && to_be_checked.S4) || 0, "Stack [0x4]");
	equal(STACK[0x5], (to_be_checked && to_be_checked.S5) || 0, "Stack [0x5]");
	equal(STACK[0x6], (to_be_checked && to_be_checked.S6) || 0, "Stack [0x6]");
	equal(STACK[0x7], (to_be_checked && to_be_checked.S7) || 0, "Stack [0x7]");
	equal(STACK[0x8], (to_be_checked && to_be_checked.S8) || 0, "Stack [0x8]");
	equal(STACK[0x9], (to_be_checked && to_be_checked.S9) || 0, "Stack [0x9]");
	equal(STACK[0xA], (to_be_checked && to_be_checked.SA) || 0, "Stack [0xA]");
	equal(STACK[0xB], (to_be_checked && to_be_checked.SB) || 0, "Stack [0xB]");
	equal(STACK[0xC], (to_be_checked && to_be_checked.SC) || 0, "Stack [0xC]");
	equal(STACK[0xD], (to_be_checked && to_be_checked.SD) || 0, "Stack [0xD]");
	equal(STACK[0xE], (to_be_checked && to_be_checked.SE) || 0, "Stack [0xE]");
	equal(STACK[0xF], (to_be_checked && to_be_checked.SF) || 0, "Stack [0xF]");

}

function check_chip8(to_be_checked) {

	equal(PC, (to_be_checked && to_be_checked.PC) || 0x200, "Program Counter");
	equal(SP, (to_be_checked && to_be_checked.SP) || 0xF, "Stack Pointer");

	equal(register.I, (to_be_checked && to_be_checked.I) || 0, "Register I");
		
	equal(register.V[0x0], (to_be_checked && to_be_checked.V0) || 0, "Register V0");
	equal(register.V[0x1], (to_be_checked && to_be_checked.V1) || 0, "Register V1");
	equal(register.V[0x2], (to_be_checked && to_be_checked.V2) || 0, "Register V2");
	equal(register.V[0x3], (to_be_checked && to_be_checked.V3) || 0, "Register V3");
	equal(register.V[0x4], (to_be_checked && to_be_checked.V4) || 0, "Register V4");
	equal(register.V[0x5], (to_be_checked && to_be_checked.V5) || 0, "Register V5");
	equal(register.V[0x6], (to_be_checked && to_be_checked.V6) || 0, "Register V6");
	equal(register.V[0x7], (to_be_checked && to_be_checked.V7) || 0, "Register V7");
	equal(register.V[0x8], (to_be_checked && to_be_checked.V8) || 0, "Register V8");
	equal(register.V[0x9], (to_be_checked && to_be_checked.V8) || 0, "Register V9");
	equal(register.V[0xA], (to_be_checked && to_be_checked.VA) || 0, "Register VA");
	equal(register.V[0xB], (to_be_checked && to_be_checked.VB) || 0, "Register VB");
	equal(register.V[0xC], (to_be_checked && to_be_checked.VC) || 0, "Register VC");
	equal(register.V[0xD], (to_be_checked && to_be_checked.VD) || 0, "Register VD");
	equal(register.V[0xE], (to_be_checked && to_be_checked.VE) || 0, "Register VE");
	equal(register.V[0xF], (to_be_checked && to_be_checked.VF) || 0, "Register VF");

	equal(register.DT, (to_be_checked && to_be_checked.DT) || 0, "Delay Timer");
	equal(register.ST, (to_be_checked && to_be_checked.ST) || 0, "Sound Timer");
}

test("Chip8 initialization", function() {

	init_chip8();

	check_stack();

	check_chip8();

});


test("OpCode 00E0 - CLS", function() {

	init_chip8();
	
	//Fill screen with pixels
	for (var i = 0; i < 64*32; i++)
		display[i] = 1;

	load_custom_ROM([0x00E0]);
	process_opcode();

	//Check if the screen as been cleared
	var clean = true;
	for (var i = 0; i < 64*32; i++)
		if (display[i] != 0) 
			clean = false;

	ok(clean, "Screen cleared");
	
	check_stack();

	check_chip8({PC: 0x202});

});

test("OpCode 00EE - RET", function() {

	init_chip8();

	load_custom_ROM([0x2206, 0x6A34, 0x6345, 0x6321, 0x00EE]);
	
	process_n_opcodes(5);
	
	check_stack({SF: 0x202});	

	check_chip8({PC: 0x206, SP: 0xF, VA: 0x34, V3: 0x45});
});

test("OpCode 1nnn - JP addr", function() {

	init_chip8();

	load_custom_ROM([0x1204, 0x6A34, 0x6345, 0x6A21, 0x00E0]);

	process_n_opcodes(3);

	check_stack();
		
	check_chip8({V3: 0x45, VA: 0x21, PC: 0x208});

});

test("OpCode 2nnn - CALL addr", function() {

	init_chip8();
	
	load_custom_ROM([0x2204, 0x6A34, 0x6345, 0x6321, 0x00EE]);
	
	process_n_opcodes(3);
	
	check_stack({SF: 0x202});	

	check_chip8({PC: 0x208, SP: 0xE, V3: 0x21});
});

test("OpCode 3xkk - SE Vx, byte", function() {

	//Cas Vx != kk

	init_chip8();

	load_custom_ROM([0x6AAF, 0x3AAA, 0x6054, 0x6345]);

	process_n_opcodes(3);

	check_stack();
	
	check_chip8({PC: 0x206, VA: 0xAF, V0: 0x54});
	
	//Cas Vx = kk

	init_chip8();

	load_custom_ROM([0x6AAF, 0x3AAF, 0x6054, 0x6345]);

	process_n_opcodes(3);

	check_stack();
	
	check_chip8({PC: 0x208, VA: 0xAF, V3: 0x45});
	

});

test("OpCode 4xkk - SNE Vx, byte", function() {

	//Cas Vx != kk

	init_chip8();

	load_custom_ROM([0x6AAF, 0x4AAA, 0x6054, 0x6345]);

	process_n_opcodes(3);

	check_stack();
	
	check_chip8({PC: 0x208, VA: 0xAF, V3: 0x45});
	
	//Cas Vx = kk

	init_chip8();

	load_custom_ROM([0x6AAF, 0x4AAF, 0x6054, 0x6345]);

	process_n_opcodes(3);

	check_stack();
	
	check_chip8({PC: 0x206, VA: 0xAF, V0: 0x54});
});

test("OpCode 5xy0 - SE Vx, Vy", function() {

	//Cas Vx = Vy

	init_chip8();

	load_custom_ROM([0x6AAF, 0x6BAF, 0x5AB0, 0x6054, 0x6345]);

	process_n_opcodes(4);

	check_stack();
	
	check_chip8({PC: 0x20A, VA: 0xAF, VB: 0xAF, V3: 0x45});

	//Cas Vx != Vy

	init_chip8();

	load_custom_ROM([0x6AAF, 0x6B0F, 0x5AB0, 0x6054, 0x6345]);

	process_n_opcodes(4);

	check_stack();
	
	check_chip8({PC: 0x208, VA: 0xAF, VB: 0x0F, V0: 0x54});
});

test("OpCode 6xkk - LD Vx, byte", function() {

	init_chip8();

	PC += 0x2;
	Op6xkk_ld(0x6, 0x02);

	equal(register.V[0x6], 0x2);

	ok(false);
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
