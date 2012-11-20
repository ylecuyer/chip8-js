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


