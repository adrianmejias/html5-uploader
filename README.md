html5-uploader
==========

Upload files using html5.

Example file upload and usage
------------

**Demo:** https://adrianmejias.com/html5-uploader

```html
<!-- Include jQuery Beforehand -->
<script src="html5-uploader.js"></script>
<form>
    <input type="file" name="file">
</form>
```

```javascript
$('input[type=file]').html5Uploader();
```

To ``override the action url``, you will need to add ``data-url`` tag to the file (input) field that you wish to direct your data to.

Available options
------------

* ``accept``: **array** Mime-types that you wish to accept.
* ``fields``: **array** Extra fields you wish to post.
* ``holder``: **string** Element name where you drag and drop files to.
* ``preview``: **object** Create your own preview function.
* ``progress``: **object** Create your own progress function.
* ``url``: **array** The url where the form data will post to.
* ``complete``: **object** Create your own completion function.

```javascript
$('input[type=file]').html5Uploader({
  accept: [
    'image/png',
    'image/gif'
  ],
  url: 'upload.asp',
  fields: [
    token: 'ju3Fn55d24sADfa'
  ],
  holder: '.drag-n-drop-here',
  progress: function(complete) {
    console.log('File is uploading. Currently at '+complete+'%');
  },
  preview: function(file){
    console.log('Would you look at this file.', file);
  },
  complete: function(file, response) {
    console.log('File uploaded.');
  }
});
```