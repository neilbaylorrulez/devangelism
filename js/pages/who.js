(function who () {
	'use strict';
	var $grid = $('.photo-grid');

	function init () {
		$grid.on('click', function (e) {
			var $tile = $(e.target).closest('.tile'),
				$overlay;
			if($tile.length && $tile.attr('data-overlay-id')) {
				$overlay = $('.overlay[data-id="' + $tile.attr('data-overlay-id') +'"]');
				if($overlay.length) {
					window.clickedOverlayTriggeredPage = true;
					window.location.hash = 'who/' + $tile.attr('data-overlay-id');
				}
			}
		});
	}

	$(init);
}());