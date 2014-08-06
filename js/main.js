(function main () {

	function init() {
		window.FastClick.attach(document.body);
	}

	$(window).on('app-ready', init);
}());