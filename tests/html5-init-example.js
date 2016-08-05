// Custom attributes
var customProgress = function(complete) {
	// Lovely visual...
	if ($('.progress .progress-bar').attr('aria-valuenow') != complete) {
		$('.progress .progress-bar').css('width', complete + '%').attr('aria-valuenow', complete);
		$('.form-control-progress .sr-only').text(complete);
	}
};
// Load when ready...
$(function() {
	$('input[name=file1]').html5uploader({});
	$('input[name=file2]').html5uploader({
		//url: 'upload.php',
		//holder: '.form-control-holder',
		//name: 'file',
		fields: {
			type: 'image'
		},
		/*progress: function(complete)
		{
			if ($('.progress .progress-bar').attr('aria-valuenow') != complete) {
				$('.progress .progress-bar').css('width', complete+'%').attr('aria-valuenow', complete);
				$('.form-control-progress .sr-only').text(complete);
			}
		},*/
		preview: function(file) {
			// Append file to our ready and willing img placeholder
			$('.form-control-preview').attr('src', file);
		},
		complete: function(file, response) {
			// Success!
			console.log('completed', file, response);
		}
	});
});