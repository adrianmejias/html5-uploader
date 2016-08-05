'use strict';
(function($) {
    // support for images only
    var previewMimeTypes = {
            image: [
                'image/png',
                'image/jpeg',
                'image/gif'
            ]
        },
        // check for html5 support
        supported = {
            filereader: typeof FileReader != 'undefined',
            dnd: 'draggable' in document.createElement('span'),
            formdata: !!window.FormData,
            progress: 'upload' in new XMLHttpRequest
        },
        // default options
        defaults = {
            name: 'file',
            accept: [
                'image/png',
                'image/jpeg',
                'image/gif'
            ],
            language: {
                invalidMimeType: 'Invalid mime type.'
            },
            url: null,
            fields: {},
            holder: null,
            progress: null,
            preview: null,
            complete: null,
            error: null,
            debug: false,
            history: [],
            currentProgress: 0
        };
    // plugin
    $.fn.html5uploader = function(options) {
        var settings = $.extend(defaults, typeof options !== 'undefined' ? options : {}),
            /**
             * Show messages in chrome log.
             * 
             * @url http://www.paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
             */
            consoleLog = function() {
                if (settings.debug === true) {
                    settings.history.push(arguments);
                    if (this.console) {
                        console.log(Array.prototype.slice.call(arguments));
                    }
                }
            },
            /**
             * Functionality for uploading a file.
             *
             * @param  {object} e
             * @param  {object} file
             */
            fileSelect = function(e, file) {
                consoleLog('fileselect', file);
                if (!settings.url) {
                    consoleLog('no url set');
                    return;
                }
                // check if we support formdata
                var formData = supported.formdata === true ? new FormData() : null;
                if (supported.formdata === true) {
                    consoleLog('formdata supported');
                    if (settings.progress && settings.currentProgress != 0) {
                        consoleLog('progress', 0);
                        settings.currentProgress = 0;
                        settings.progress(0);
                    }
                    // append our file data as a form variable
                    formData.append(settings.name, file);
                    // append our extra fields
                    if (settings.fields) {
                        $.each(settings.fields, function(key, value) {
                            formData.append(key, value);
                        });
                    }
                    var xhr = new XMLHttpRequest();
                    // most likely done
                    xhr.onload = function(e) {
                        // set progress bar to 100%
                        setProgress(100);
                        if (e.target.responseText) {
                            var response = JSON.parse(e.target.responseText);
                            // check for a response
                            if (response) {
                                setComplete(file, response);
                            }
                        }
                    };
                    // progress
                    if (settings.progress && supported.progress === true) {
                        consoleLog('progress supported');
                        xhr.upload.onprogress = function(e) {
                            if (e.lengthComputable) {
                                var complete = (e.loaded / e.total * 100 | 0);
                                setProgress(complete);
                            }
                        }
                    }
                    //xhr.onerror(function(e) {});
                    //xhr.onabort(function(e) {});
                    xhr.open('POST', settings.url);
                    xhr.send(formData);
                } else {
                    setComplete(settings, file, {});
                }
                // preview image
                if (settings.preview && supported.filereader === true && $.inArray(file.type, previewMimeTypes.image) != -1) {
                    consoleLog('filereader supported');
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        if (typeof settings.preview == 'string') {
                            var preview = window[settings.preview];
                            if (typeof preview == 'function') {
                                preview(e.target.result);
                            }
                        } else {
                            settings.preview(e.target.result);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            },
            /**
             * Functionality to set error.
             * 
             * @param {object} file
             * @param {string} error
             */
            setError = function(file, error) {
                if (settings.error) {
                    if (typeof settings.error == 'string') {
                        var error = window[settings.error];
                        if (typeof error == 'function') {
                            error.call(this, file, error, '');
                        }
                    } else {
                        // TODO: error codes
                        settings.error.call(this, file, error, '');
                    }
                }
            },
            /**
             * Functionality to set complete.
             *
             * @param {object} file
             * @param {object} response
             */
            setComplete = function(file, response) {
                // complete
                if (settings.complete) {
                    if (typeof settings.complete == 'string') {
                        var complete = window[settings.complete];
                        if (typeof complete == 'function') {
                            complete.call(this, file, response);
                        }
                    } else if (typeof settings.complete == 'function') {
                        settings.complete.call(this, file, response);
                    }
                }
                // error
                if (response.error) {
                    setError(file, response.error);
                }
            },
            /**
             * Functionality to set progress.
             *
             * @param {integer} complete
             * @return void
             */
            setProgress = function(complete) {
                if (settings.progress && settings.currentProgress != complete) {
                    consoleLog('progress', complete);
                    settings.currentProgress = complete;
                    if (typeof settings.progress == 'string') {
                        var progress = window[settings.progress];
                        if (typeof progress == 'function') {
                            progress(complete);
                        }
                    } else if (typeof settings.progress == 'function') {
                        settings.progress(complete);
                    }
                }
            };
        // render functionality for each file input
        return this.each(function() {
            var self = $(this);
            if (self.is('input[type=file]')) {
                // input name
                if (typeof self.attr('name') !== 'undefined') {
                    settings.name = self.attr('name');
                    consoleLog('set name', settings.name);
                }
                // data-name
                if (typeof self.data('name') !== 'undefined') {
                    settings.name = self.data('name');
                    consoleLog('set name', settings.name);
                }
                // data-url
                if (typeof self.data('url') !== 'undefined') {
                    settings.url = self.data('url');
                    consoleLog('set url', settings.url);
                }
                // accept
                if (typeof self.attr('accept') !== 'undefined') {
                    var accept = self.attr('accept');
                    settings.accept = accept.split('|');
                    consoleLog('set accept', settings.accept);
                } else if (typeof settings.accept != 'undefined') {
                    self.attr('accept', settings.accept.join('|'));
                    consoleLog('set accept', settings.accept);
                }
                // data-fields
                if (typeof self.data('fields') !== 'undefined') {
                    var fields = self.data('fields');
                    if (typeof fields == 'string') {
                        // Check for already created object
                        var _fields = window[fields];
                        if (typeof _fields == 'function') {
                            settings.fields = _fields;
                        } else {
                            // Check for 'key=value|key=value|key=value'
                            var dataFields = fields.split('|');
                            if (dataFields.length) {
                                settings.fields = {};
                                $.each(dataFields, function(key, dataField) {
                                    var value = dataField.split('=');
                                    if (value.length) {
                                        eval('settings.fields.' + value[0] + ' = "' + value[1] + '";');
                                    }
                                });
                            }
                        }
                    }
                    consoleLog('set fields', settings.fields);
                }
                // data-holder
                if (typeof self.data('holder') !== 'undefined') {
                    settings.holder = self.data('holder');
                    consoleLog('set holder', settings.holder);
                }
                // data-progress
                if (typeof self.data('progress') !== 'undefined') {
                    settings.progress = self.data('progress');
                    consoleLog('set progress', settings.progress);
                }
                // data-complete
                if (typeof self.data('complete') !== 'undefined') {
                    settings.complete = self.data('complete');
                    consoleLog('set complete', settings.complete);
                }
                // data-preview
                if (typeof self.data('preview') !== 'undefined') {
                    settings.preview = self.data('preview');
                    consoleLog('set preview', settings.preview);
                }
                // drag n drop support
                if (supported.dnd && settings.holder) {
                    consoleLog('dnd supported');
                    $(settings.holder).on('dragover', function(e) {
                        $(this).addClass('hover');
                        self.addClass('disabled');
                        // reset progress bar
                        setProgress(0);
                        return false;
                    }).on('dragend', function(e) {
                        $(this).removeClass('hover');
                        self.removeClass('disabled');
                        // reset progress bar
                        setProgress(0);
                        return false;
                    }).on('drop', function(e) {
                        e.preventDefault();
                        // jquery and datatransfer not married
                        // @url http://stackoverflow.com/questions/7640234/jquery-ui-draggable-droppable-datatransfer-is-undefined
                        e.dataTransfer = e.originalEvent.dataTransfer;
                        $(this).removeClass('hover');
                        self.removeClass('disable');
                        var file = e.dataTransfer != 'undefined' && e.dataTransfer.files.length ? e.dataTransfer.files[0] : null;
                        // only accept mime types we provide
                        if (file) {
                            var acceptable = $.inArray(file.type, settings.accept);
                            consoleLog('file chosen', file, acceptable);
                            if (acceptable != -1) {
                                consoleLog('acceptable mime type', file.type, settings.accept);
                                // trigger our upload functionality
                                fileSelect(e, file);
                            }
                        }
                    });
                }
                self.change(function(e) {
                    var file = $(this).get(0).files[0];
                    // reset progress bar
                    setProgress(0);
                    // only accept mime types we provide
                    if (file) {
                        var acceptable = $.inArray(file.type, settings.accept);
                        consoleLog('file chosen', file, acceptable);
                        if (acceptable != -1) {
                            consoleLog('acceptable mime type', file.type, settings.accept);
                            // trigger our upload functionality
                            $(this).trigger('fileselect', file);
                        } else {
                            // error
                            setError(file, settings.language.invalidMimeType);
                        }
                    }
                }).on('fileselect', fileSelect);
            }
        });
    };
})(jQuery);