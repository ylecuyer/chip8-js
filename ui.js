$(function() {

	$("#load_file").click(function() {

		$("#rom").trigger("click");
			
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
