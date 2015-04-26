html5-uploader
==========

Upload files using html5.

## Table of contents

- [Quick start](#quick-start)
- [What's included](#whats-included)
- [Example](#example)
- [Available options](#available-options)

## Quick start

Several quick start options are available:

- [Download the latest release](https://github.com/adrianmejias/html5-uploader/archive/0.0.8.zip).
- Clone the repo: `git clone https://github.com/adrianmejias/html5-uploader.git`.
- Install with [Bower](http://bower.io): `bower install html5-uploader`.

### What's included

Within the download you'll find the following directories and files, logically grouping common assets and providing both compiled and minified variations. You'll see something like this:

```
html5-uploader/
├── html5-uploader.js
├── html5-uploader.min.js
```

### Example
Example file upload and usage:

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

To ``override`` loaded javascript configuration settings, you will need to add ``data-*`` tags to the file (input) field. The setting ``accept`` may be set without ``data-`` attribute prefix.

### Available options

* ``accept``: **array|string** Mime-types that you wish to accept.
    - Alternatively you may provide ``accept`` tag in the file (input) field that will be translated internally. (Nothing fancy though...)
* ``fields``: **array|string** Extra fields you wish to post.
  - Alternatively you may provide a string assigned as ``key=value|key=value|..`` in a ``data-fields`` attribute.
* ``holder``: **string** Element name where you drag and drop files to.
* ``preview``: **object|string** Create your own preview function.
* ``progress``: **object|string** Create your own progress function.
* ``url``: **string** The url where the form data will post to.
* ``complete``: **object|string** Create your own completion function.
* ``debug``: **boolean** Show console.log report in browser.

```html
<input type="file" accept="image/png|image/jpeg|image/gif" data-url="upload.asp" data-fields="customFields" data-holder=".drag-n-dro-here" data-progress="customProgress" data-preview="customPreview" data-complete="customComplete">
```
or
```html
<!-- alternate data-fields -->
..data-fields="token=ju3Fn55d24sADfa|type=image"..
```

```javascript
$('input[type=file]').html5Uploader({
  accept: [
    'image/png',
    'image/jpeg',
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
  },
  debug: false
});
```
