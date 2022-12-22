import { uploadImage, getUniqueName } from './s3Operations.js';

(function ($) {

    var addPhotoForm = $('#add-photo-form'),
        alertMessage = $('#success-alert'),
        errorMessage = $('#error-alert'),
        descriptionInput = $('#description'),
        previewImages = $('#photos-preview'),
        itemId = $('#itemId').val();

    window.onload = function () {
        alertMessage.hide();
        errorMessage.hide();
        getPhotos();
    };

    addPhotoForm.submit(function (event)
    {
        event.preventDefault();

        var description = descriptionInput.val().trim();

        if (!description.trim().length) {
            showError('You need to provide a description!');
        } else {
            showSuccess('Successfully added photo!');
            var success = addImage();
        }
    });

    function addImage() {

        var files = document.getElementById('image').files;

        if (!files.length) {
            showError('You need to provide an image!');
            return false;
        }

        var file = files[0];
        var fileName = getUniqueName(file.name);

        uploadImage(fileName, file, updateInput);

        return true;
    }

    function updateInput(fileURL) {

        var description = descriptionInput.val();

        var requestConfig = {
            method: 'POST',
            url: addPhotoForm.attr('action'),
            contentType: 'application/json',
            data: JSON.stringify({
                description: description,
                imageURL: fileURL
            })
        };

        $.ajax(requestConfig).then(function(responseMessage) {
            if (!responseMessage.photoAdded ||
                responseMessage.photoAdded !== true)
            {
                showError('Error adding photo!');
            } else {
                showSuccess('Successfully updated photo');
                getPhotos();
            }
        });

    }

    function getPhotos() {
        if (itemId) {
            var photosUrl = location.origin + '/items/' + itemId + '/photos';

            var requestConfig = {
                method: 'GET',
                url: photosUrl
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                addPhotos(responseMessage);
            });
        }
    }

    function addPhotos(photos) {
        // clear out existing photos
        previewImages.empty();

        var html = '';

        if (!photos || photos.length === 0) {
            html = '<p>There are no photos yet. Add your first photo below.</p>';
            previewImages.append(html);
            return;
        }

        html += '<div class="item-list">';

        for (let i = 0; i < photos.length; i++) {
            if (photos[i].hasOwnProperty('_id') &&
                photos[i].hasOwnProperty('description') &&
                photos[i].hasOwnProperty('imageURL')) {

                var id = photos[i]._id;
                var description = photos[i].description;
                var imageURL = photos[i].imageURL;

                html += '<div class="card" style="width: 18rem;">';
                html += '<img id="image-url-' + id + '" src="' + imageURL + '" class="card-img-top" alt="' + description + '">';
                html += '<div class="card-body">';
                html += '<textarea id="description-' + id + '" class="card-text" rows="2" cols="23">' + description + '</textarea>'
                //html += '<p class="card-text">' + description + '</p>';
                //html += '<p class="card-text">Edit photo' +
                //        '<input id="image-' + id + '" type="file" name="image" accept="image/*"/>' +
                //        '</p>'
                html += '<a href="/items/' + itemId + '/photo" id="' + id + '" class="btn btn-primary">Update</a>'
                html += '</div>';
                html += '</div>';
            }
        }

        html += '</div>';
        previewImages.append(html);
        previewImages.show();

        previewImages.children().each(function (index, element) {
            bindEventsToPhotos($(element));
        });
    }

    function bindEventsToPhotos(photo) {
        photo.find('a').on('click', function (event) {
            event.preventDefault();

            // "a" is first object
            var url = $(this)[0].href;
            var id = $(this)[0].id;

            // get image file
            //var imageInput = 'image-' + id;
            //var files = document.getElementById(imageInput).files;

            // get existing image url
            var imageURLElement = '#image-url-' + id;
            var imageURL = $(imageURLElement).attr('src');

            // get description
            var descriptionInput = '#description-' + id;
            var description = $(descriptionInput).val();

            if (!description.trim().length) {
                showError('You must provide a description!');
                return;
            }

            var requestConfig = {
                method: 'PUT',
                url: url,
                contentType: 'application/json',
                data: JSON.stringify({
                    imageId: id,
                    description: description,
                    imageURL: imageURL
                })
            };

            $.ajax(requestConfig).then(function(responseMessage) {
                if (!responseMessage.photoUpdated ||
                    responseMessage.photoUpdated !== true)
                {
                    showError('Error updating photo!');
                } else {
                    showSuccess('Successfully updated photo!');
                    getPhotos();
                }
            });
        });
    }

    function showSuccess(message) {
        alertMessage.empty();
        alertMessage.append(message);
        alertMessage.show();
        errorMessage.hide();
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    function showError(message) {
        errorMessage.empty();
        errorMessage.append(message);
        errorMessage.show();
        alertMessage.hide();
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

})(window.jQuery);
