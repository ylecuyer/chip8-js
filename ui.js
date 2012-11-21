$(function() {

	$("#load_file").click(function() {

		$("#rom").trigger("click");
			
	});


	$('#screen')
		.clearCanvas()
		.drawRect({
			fillStyle: "black",
			x: 0,
			y: 0,
			width: 256,
			height: 128,
			fromCenter: false
		});

	$("#rom").change(function(eventObject) {

		var file = eventObject.target.files[0];

		var reader = new FileReader();

		reader.onload = function() {

			ROM_buffer = this.result;
			ROM = new Uint8Array(ROM_buffer);
			
			chip8_load_rom_into_mem(ROM);
			
			init();
		};

		reader.readAsArrayBuffer(file);
	});	

	$("#stop").click(function() {

		clearTimeout(cpu_process);
		clearTimeout(draw_process);
		clearTimeout(dt_process);
		clearTimeout(st_process);
	});
	
	$(document).keydown(function(event) {

		var mapped_key = null;

		switch (event.keyCode) {

			case 222:
				mapped_key = 0x1;
				break;

			case 57:
				mapped_key = 0x2;
				break;

			case 189:
				mapped_key = 0x3;
				break;

			case 55:
				mapped_key = 0xC;
				break;

			case 82:
				mapped_key = 0x4;
				break;

			case 84:
				mapped_key = 0x5;
				break;

			case 89:
				mapped_key = 0x6;
				break;

			case 85:
				mapped_key = 0xD;
				break;

			case 70:
				mapped_key = 0x7;
				break;

			case 71:
				mapped_key = 0x8;
				break;

			case 72:
				mapped_key = 0x9;
				break;

			case 74:
				mapped_key = 0xE;
				break;

			case 86:
				mapped_key = 0xA;
				break;

			case 66:
				mapped_key = 0x0;
				break;

			case 78:
				mapped_key = 0xB;
				break;

			case 188:
				mapped_key = 0xF;
				break;
		}
	
		if (mapped_key !== null) {

			keyboard[mapped_key] = 1;
			
			if (wait_for_keypress) {
				wait_for_keypress = false;
				register.V[register_for_keypress] = mapped_key;
				cpu_process = setTimeout(process_opcode_ex, 1);
			}

		}		

	});

	$(document).keyup(function(event) {

		switch (event.keyCode) {

			case 222:
				keyboard[0x1] = 0;
				break;

			case 57:
				keyboard[0x2] = 0;
				break;

			case 189:
				keyboard[0x3] = 0;
				break;

			case 55:
				keyboard[0xC] = 0;
				break;

			case 82:
				keyboard[0x4] = 0;
				break;

			case 84:
				keyboard[0x5] = 0;
				break;

			case 89:
				keyboard[0x6] = 0;
				break;

			case 85:
				keyboard[0xD] = 0;
				break;

			case 70:
				keyboard[0x7] = 0;
				break;

			case 71:
				keyboard[0x8] = 0;
				break;

			case 72:
				keyboard[0x9] = 0;
				break;

			case 74:
				keyboard[0xE] = 0;
				break;

			case 86:
				keyboard[0xA] = 0;
				break;

			case 66:
				keyboard[0x0] = 0;
				break;

			case 78:
				keyboard[0xB] = 0;
				break;

			case 188:
				keyboard[0xF] = 0;
				break;
		}

	});

});

function set_controls(file, run, pause, reset, eject) {

	$("#load_file").attr("disabled", !file);
	$("#run").attr("disabled", !run);	
	$("#pause").attr("disabled", !pause);
	$("#reset").attr("disabled", !reset);
	$("#stop").attr("disabled", !eject);	

}

function on_rom_loaded() {
	
	set_controls(false, true, false, true, true);
}

function on_engine_launched() {
	
	set_controls(false, false, true, true, true);

}

function on_engine_paused() {

	set_controls(false, true, false, true, true);

}

function on_engine_stoped() {

	set_controls(false, true, false, false, true);

}

function on_rom_removed() {
	
	set_controls(true, false, false, false, false);

}
