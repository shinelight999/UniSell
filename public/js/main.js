import { uploadImage, getUniqueName } from './s3Operations.js';

(function ($) {
    var commentForm = $("#new-comment-form"),
        commentInput = $("#comment"),
        commentArea = $("#comments-list"),
        noCommentNotice = $("#no_comment_notice"),
        noBidNotice = $("#no_bids_notice"),
        commentAlert = $("#error-alert-comment"),
        bidAlert = $("#error-alert-bid"),
        bidsArea = $("#bids-list"),
        bidForm = $("#new-bid-form"),
        bidInput = $("#bid"),
        highestBid = $("#highest_bid"),
        profileInfoForm = $("#profile-form"),
        usernameInput = $("#username"),
        nameInput = $("#name"),
        emailInput = $("#email"),
        bioInput = $("#bio"),
        profileImageInput = $("#image"),
        passwordEditForm = $("#password-form"),
        currentPasswordInput = $("#current_password"),
        newPasswordInput = $("#new_password"),
        newPasswordConfirmationInput = $("#new_password_confirmation"),
        signUpForm = $("#signup-form"),
        passwordInput = $("#password"),
        passwordConfirmationInput = $("#password_confirmation"),
        universityInput = $("#universityId"),
        loginForm = $("#login-form"),
        emailDomainInput = $("#emailDomain"),
        editUniversityForm = $("#edit-university-form"),
        updateItemForm = $("#update-item-form"),
        titleInput = $("#title"),
        descriptionInput = $("#description"),
        keywordsInput = $("#keywords"),
        priceInput = $("#price"),
        pickUpMethodInput = $("#pick_up_method"),
        soldInput = $("#sold"),
        newUniversityForm = $("#new-university-form"),
        newItemForm = $("#new-item-form"),
        newRatingForm = $("#new-rating-form"),
        ratingInput = $("#rating"),
        errorStatus = $("#error-status"),
        errorMessage = $("#error-message"),
        imageInput = $('#image'),
        imageURLInput = $('#imageURL');

    var shouldSubmitSignUpForm = false,
        shouldSubmitProfileInfoForm = false;

    commentForm.submit(function (event) {
        event.preventDefault();
        hideCommentError();

        var comment = commentInput.val();

        if (comment && comment.trim().length) {
            var requestConfig = {
                method: "POST",
                url: commentForm.attr("action"),
                contentType: "application/json",
                data: JSON.stringify({
                    comment: comment,
                }),
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                if (responseMessage.error && responseMessage.error.length > 0) {
                    showCommentError(responseMessage.error);
                    return;
                }

                noCommentNotice.hide();

                var newElement = $(responseMessage);
                commentArea.append(newElement);
                commentForm.trigger("reset");
            });
        } else {
            showCommentError('Comments cannot only contain spaces');
        }
    });

    bidForm.submit(function (event) {
        event.preventDefault();
        hideBidError();

        var bid = bidInput.val();

        if (bid && bid >= 0) {
            var requestConfig = {
                method: "POST",
                url: bidForm.attr("action"),
                contentType: "application/json",
                data: JSON.stringify({
                    bid: bid,
                }),
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                if (responseMessage.error && responseMessage.error.length > 0) {
                    showBidError(responseMessage.error);
                    return;
                }

                noBidNotice.hide();

                var newElement = $(responseMessage);
                bidsArea.append(newElement);
                bidForm.trigger("reset");
            });

            if (parseInt(bid) > parseInt(highestBid.text())) {
                highestBid.text(bid);
            }
        } else {
            showBidError('Bids must be a whole number');
        }
    });

    profileInfoForm.submit((event) => {
        if (shouldSubmitProfileInfoForm) {
            return;
        }

        var username = usernameInput.val(),
            name = nameInput.val(),
            email = emailInput.val(),
            bio = bioInput.val();
            image = profileImageInput.val();

        if (!username || !name || !email || !bio) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Missing required fields");
            return;
        }
        const alphanumeric = new RegExp(/^[a-z0-9]+$/i);
        const emailFormat = new RegExp(
            /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
        );

        if (!alphanumeric.test(username)) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError(
                "400",
                "Username can only contain alphanumeric characters."
            );
            return;
        }

        if (!emailFormat.test(email)) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Invalid Email.");
            return;
        }

        if (username.trim().length < 4) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Username must be at least 4 characters.");
            return;
        }

        // if there is no image, then just submit form
        if (!image) {
            return;
        }

        event.preventDefault();

        // upload image to s3
        addImage(updateProfileInfoFormInput);
    });

    passwordEditForm.submit((event) => {
        var currentPassword = currentPasswordInput.val(),
            newPassword = newPasswordInput.val(),
            newPasswordConfirmation = newPasswordConfirmationInput.val();

        if (!currentPassword || !newPassword || !newPasswordConfirmation) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Missing required fields");
            return;
        }

        if (newPassword.length < 6 || newPassword.includes(" ")) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError(
                "400",
                "Password must be at least 6 characters, with no spaces."
            );
            return;
        }

        if (newPassword !== newPasswordConfirmation) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Passwords do not match");
            return;
        }

        //check that old password is correct
    });

    signUpForm.submit((event) => {
        if (shouldSubmitSignUpForm) {
            return;
        }

        var username = usernameInput.val(),
            name = nameInput.val(),
            email = emailInput.val(),
            password = passwordInput.val(),
            passwordConfirmation = passwordConfirmationInput.val(),
            bio = bioInput.val(),
            universityId = universityInput.val(),
            image = profileImageInput.val();

        if (
            !username ||
            !name ||
            !email ||
            !bio ||
            !password ||
            !passwordConfirmation ||
            !universityId ||
            !image
        ) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Missing required fields");
            return;
        }
        const alphanumeric = new RegExp(/^[a-z0-9]+$/i);
        const emailFormat = new RegExp(
            /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
        );

        if (!alphanumeric.test(username)) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError(
                "400",
                "Username can only contain alphanumeric characters."
            );
            return;
        }

        if (!emailFormat.test(email)) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Invalid email address.");
            return;
        }

        if (username.trim().length < 4) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Username must be at least 4 characters.");
            return;
        }

        if (password.length < 6 || password.includes(" ")) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError(
                "400",
                "Password must be at least 6 characters, with no spaces."
            );
            return;
        }

        if (password !== passwordConfirmation) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Passwords do not match");
            return;
        }

        event.preventDefault();

        // upload image to s3
        addImage(updateSignUpFormInput);
    });

    loginForm.submit((event) => {
        var username = usernameInput.val(),
            password = passwordInput.val(),
            universityId = universityInput.val();

        if (!username || !password || !universityId) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Missing required fields");
            return;
        }
        const alphanumeric = new RegExp(/^[a-z0-9]+$/i);

        if (!alphanumeric.test(username)) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError(
                "400",
                "Username can only contain alphanumeric characters"
            );
            return;
        }

        if (username.trim().length < 4) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Username must be at least 4 characters.");
            return;
        }

        if (password.length < 6 || password.includes(" ")) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError(
                "400",
                "Password must be at least 6 characters, with no spaces."
            );
            return;
        }
    });

    editUniversityForm.submit((event) => {
        var name = nameInput.val(),
            emailDomain = emailDomainInput.val();

        if (!name || !emailDomain) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Missing required fields");
            return;
        }

        let emailRegex = new RegExp(
            "(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:[A-Z]{2}|edu)\\b"
        );

        if (!emailRegex.test(emailDomain)) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Invalid email domain");
            return;
        }
    });

    updateItemForm.submit((event) => {
        var title = titleInput.val(),
            description = descriptionInput.val(),
            keywords = keywordsInput.val(),
            price = priceInput.val(),
            pickUpMethod = pickUpMethodInput.val(),
            sold = soldInput.val();

        if (
            !title ||
            !description ||
            !keywords ||
            !price ||
            !pickUpMethod ||
            !sold
        ) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Missing required fields");
            return;
        }

        if (parseInt(price) === NaN || price < 0) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Price must be a valid whole number");
            return;
        }
    });

    newUniversityForm.submit((event) => {
        var name = nameInput.val(),
            emailDomain = emailDomainInput.val();

        if (!name || !emailDomain) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Missing required fields");
            return;
        }

        let emailRegex = new RegExp(
            "(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:[A-Z]{2}|edu)\\b"
        );

        if (!emailRegex.test(emailDomain)) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Invalid email domain");
            return;
        }
    });

    newItemForm.submit((event) => {
        var title = titleInput.val(),
            description = descriptionInput.val(),
            keywords = keywordsInput.val(),
            price = priceInput.val(),
            pickUpMethod = pickUpMethodInput.val();

        if (
            !title ||
            !description ||
            !keywords ||
            !price ||
            !pickUpMethod
        ) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Missing required fields");
            return;
        }

        if (parseInt(price) === NaN || price < 0) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Price must be a valid whole number");
            return;
        }
    });

    newRatingForm.submit((event) => {
        var rating = ratingInput.val();
        if (!rating) {
            event.preventDefault();
            //throw error on screen for user to see
            handleError("400", "Missing required fields");
            return;
        }
    });

    function showCommentError(message) {
        commentInput.val("");
        commentAlert.empty();
        commentAlert.append(message);
        commentAlert.removeAttr("hidden");
    }

    function hideCommentError() {
        commentAlert.attr("hidden", true);
    }

    function showBidError(message) {
        bidInput.val("");
        bidAlert.empty();
        bidAlert.append(message);
        bidAlert.removeAttr("hidden");
    }

    function hideBidError() {
        bidAlert.attr("hidden", true);
    }

    function handleError(status, message) {
        errorStatus.empty();
        errorMessage.empty();
        errorStatus.append(status);
        errorMessage.append(message);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function addImage(callback) {

        var files = document.getElementById('image').files;

        if (!files.length) {
            handleError("400", "Missing required fields");
            return;
        }

        var file = files[0];
        var fileName = getUniqueName(file.name);

        uploadImage(fileName, file, callback);
    }

    function updateSignUpFormInput(fileURL) {

        imageURLInput.val(fileURL);
        imageInput.val('');

        shouldSubmitSignUpForm = true;
        signUpForm.submit();
    }

    function updateProfileInfoFormInput(fileURL) {

        imageURLInput.val(fileURL);
        imageInput.val('');

        shouldSubmitProfileInfoForm = true;
        profileInfoForm.submit();
    }
})(window.jQuery);
