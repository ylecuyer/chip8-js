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


