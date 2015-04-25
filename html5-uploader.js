;
(function($) {
    $.fn.html5uploader = function(options) {
        var defaults = {
                accept: [
                    'image/png',
                    'image/jpeg',
                    'image/gif'
                ],
                url: null,
                fields: null,
                holder: null,
                progress: null,
                preview: null,
                complete: null,
                debug: false,
                history: [],
                currentProgress: 0
            },
            settings = $.extend(defaults, options),
            previewMimeTypes = {
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
            /**
             * @url http://www.paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
             * @return void
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
             * @param  object e
             * @param  object file
             * @return void
             */
            fileSelect = function(e, file) {
                //debugger;
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
                    formData.append('file', file);
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
                            if (settings.complete) {
                                if (typeof settings.complete === 'string') {
                                    var complete = window[settings.complete];
                                    if (typeof complete === 'function') {
                                        complete(file, response);
                                    }
                                } else {
                                    settings.complete(file, response);
                                }
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
                    if (settings.complete) {
                        if (typeof settings.complete === 'string') {
                            var complete = window[settings.complete];
                            if (typeof complete === 'function') {
                                complete(file, response);
                            }
                        } else {
                            settings.complete(file, response);
                        }
                    }
                }
                if (settings.preview && supported.filereader === true && $.inArray(file.type, previewMimeTypes.image) != -1) {
                    consoleLog('filereader supported');
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        if (typeof settings.preview === 'string') {
                            var preview = window[settings.preview];
                            if (typeof preview === 'function') {
                                preview(e.target.result);
                            }
                        } else {
                            settings.preview(e.target.result);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            },
            setProgress = function(complete) {
                if (settings.progress && settings.currentProgress != complete) {
                    consoleLog('progress', complete);
                    settings.currentProgress = complete;
                    if (typeof settings.progress === 'string') {
                        var progress = window[settings.progress];
                        if (typeof progress === 'function') {
                            progress(complete);
                        }
                    } else {
                        settings.progress(complete);
                    }
                }
            };
        // render functionality for each file input
        return this.each(function() {
            var $input = $(this);
            if ($input.is('input')) {
                // override settings
                if ($input.data('url') !== 'undefined') {
                    settings.url = $input.data('url');
                }
                if ($input.attr('accept')) {
                    settings.accept = $input.attr('accept').split('|');
                } else if (settings.accept) {
                    $input.attr('accept', settings.accept.join('|'));
                }
                if ($input.data('fields') !== 'undefined') {
                    var fields = $input.data('fields');
                    if (typeof fields === 'string') {
                        // Check for already created object
                        var _fields = window[fields];
                        if (typeof _fields === 'function') {
                            settings.fields = _fields;
                        } else {
                            // Check for 'key=value|key=value|key=value'
                            var dataFields = fields.split('|');
                            if (dataFields.length) {
                                settings.fields = {};
                                $.each(dataFields, function(key, dataField){
                                    var value = dataField.split('=');
                                    if (value.length) {
                                        eval('settings.fields.'+value[0]+' = "'+value[1]+'";');
                                    }
                                });
                            }
                        }
                    }
                }
                if ($input.data('holder') !== 'undefined') {
                    settings.holder = $input.data('holder');
                }
                if ($input.data('progress') !== 'undefined') {
                    settings.progress = $input.data('progress');
                }
                if ($input.data('complete') !== 'undefined') {
                    settings.complete = $input.data('complete');
                }
                if ($input.data('preview') !== 'undefined') {
                    settings.preview = $input.data('preview');
                }
                // drag n drop support
                if (supported.dnd && settings.holder) {
                    consoleLog('dnd supported');
                    $(settings.holder).on('dragover', function(e) {
                        $(this).addClass('hover');
                        $input.addClass('disabled');
                        // reset progress bar
                        setProgress(0);
                        return false;
                    }).on('dragend', function(e) {
                        $(this).removeClass('hover');
                        $input.removeClass('disabled');
                        // reset progress bar
                        setProgress(0);
                        return false;
                    }).on('drop', function(e) {
                        e.preventDefault();
                        // jquery and datatransfer not married
                        // @url http://stackoverflow.com/questions/7640234/jquery-ui-draggable-droppable-datatransfer-is-undefined
                        e.dataTransfer = e.originalEvent.dataTransfer;
                        $(this).removeClass('hover');
                        $input.removeClass('disable');
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
                $input.change(function(e) {
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
                        }
                    }
                }).on('fileselect', fileSelect);
            }
        });
    }
})(jQuery);