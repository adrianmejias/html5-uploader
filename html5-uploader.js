;
(function($) {
    $.fn.html5Uploader = function(options) {
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
             * Functionality for uploading a file.
             *
             * @param  object e
             * @param  object file
             * @return void
             */
            fileSelect = function(e, file) {
                //debugger;
                console.log('fileselect', file);
                if (!settings.url) {
                    console.log('no url set');
                }
                // check if we support formdata
                var formData = supported.formdata === true ? new FormData() : null;
                if (supported.formdata === true) {
                    console.log('formdata supported');
                    if (settings.progress && settings.currentProgress != 0) {
                        console.log('progress', 0);
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
                        if (settings.progress && settings.currentProgress != 100) {
                            console.log('progress', 100);
                            settings.currentProgress = 100;
                            settings.progress(100);
                        }
                        if (e.target.responseText) {
                            var response = JSON.parse(e.target.responseText);
                            if (settings.complete) {
                                settings.complete(file, response);
                            }
                        }
                    };
                    // progress
                    if (settings.progress && supported.progress === true) {
                        console.log('progress supported');
                        xhr.upload.onprogress = function(e) {
                            if (e.lengthComputable) {
                                var complete = (e.loaded / e.total * 100 | 0);
                                settings.currentProgress = complete;
                                console.log('progress', complete);
                                settings.progress(complete);
                            }
                        }
                    }
                    //xhr.onerror(function(e) {});
                    //xhr.onabort(function(e) {});
                    xhr.open('POST', settings.url);
                    xhr.send(formData);
                } else {
                    if (settings.complete) {
                        settings.complete(file);
                    }
                }
                if (settings.preview && supported.filereader === true && $.inArray(file.type, previewMimeTypes.image) != -1) {
                    console.log('filereader supported');
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        settings.preview(e.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            };
        // render functionality for each file input
        return this.each(function() {
            var $input = $(this);
            if ($input.is('input')) {
                if ($input.data('url').length) {
                    settings.url = $input.data('url');
                }
                if (supported.dnd && settings.holder) {
                    console.log('dnd supported');
                    $(settings.holder).on('dragover', function(e) {
                        $(this).addClass('hover');
                        $input.addClass('disabled');
                        // reset progress bar
                        if (settings.progress && settings.currentProgress != 0) {
                            console.log('progress', 0);
                            settings.currentProgress = 0;
                            settings.progress(0);
                        }
                        return false;
                    }).on('dragend', function(e) {
                        $(this).removeClass('hover');
                        $input.removeClass('disabled');
                        // reset progress bar
                        if (settings.progress && settings.currentProgress != 0) {
                            console.log('progress', 0);
                            settings.currentProgress = 0;
                            settings.progress(0);
                        }
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
                            console.log('file chosen', file, acceptable);
                            if (acceptable != -1) {
                                console.log('acceptable mime type', file.type, settings.accept);
                                // trigger our upload functionality
                                fileSelect(e, file);
                            }
                        }
                    });
                }
                $input.change(function(e) {
                    var file = $(this).get(0).files[0];
                    // reset progress bar
                    if (settings.progress && settings.currentProgress != 0) {
                        console.log('progress', 0);
                        settings.currentProgress = 0;
                        settings.progress(0);
                    }
                    // only accept mime types we provide
                    if (file) {
                        var acceptable = $.inArray(file.type, settings.accept);
                        console.log('file chosen', file, acceptable);
                        if (acceptable != -1) {
                            console.log('acceptable mime type', file.type, settings.accept);
                            // trigger our upload functionality
                            $(this).trigger('fileselect', file);
                        }
                    }
                }).on('fileselect', fileSelect);
            }
        });
    }
})(jQuery);