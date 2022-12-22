const sharedValidation = require('./sharedValidations');

function isAlphaNumeric(string) {
    // ASCII codes
    const ZERO = 48;
    const NINE = 57;
    const A_UPPER = 65;
    const Z_UPPER = 90;
    const A_LOWER = 97;
    const Z_LOWER = 122;

    let asciiCode;

    for (let i = 0; i < string.length; i++) {
        asciiCode = string.charCodeAt(i);

        if (!(asciiCode >= ZERO && asciiCode <= NINE) &&
            !(asciiCode >= A_UPPER && asciiCode <= Z_UPPER) &&
            !(asciiCode >= A_LOWER && asciiCode <= Z_LOWER)) {
            return false;
        }
    }

    return true;
}

function containsNoSpaces(string) {
    // ASCII codes
    const SPACE = 32;

    let asciiCode;

    for (let i = 0; i < string.length; i++) {
        asciiCode = string.charCodeAt(i);

        if (asciiCode == SPACE) {
            return false;
        }
    }

    return true;
}

function isValidUsername(username) {
    const MIN_USERNAME_LENGTH = 4;

    if (username.length < MIN_USERNAME_LENGTH) {
        throw 'Username is less than 4 characters';
    }

    if (!isAlphaNumeric(username)) {
        throw 'Username can only be alphanumeric characters';
    }
}

function isValidPassword(password, variableName) {
    const MIN_PASSWORD_LENGTH = 6;

    if (password.length < MIN_PASSWORD_LENGTH) {
        throw `${variableName || 'password'} is less than 4 characters`;
    }

    if (!containsNoSpaces(password)) {
        throw `${variableName || 'password'} cannot contain any spaces`;
    }
}

function passwordsMatch(password, passwordConfirmation) {
    if (password != passwordConfirmation) {
        throw 'Password and password_confirmation must match';
    }
}

function isValidEmail(email) {
    // Check for valid email pattern and only accept .edu addresses
    // Two letter country codes accepted before .edu (e.g. string@string.uk.edu)
    let emailRegex = new RegExp('[a-z0-9!#$%&\'*+\\/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+\\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:[A-Z]{2}|edu)\\b');

    if (!emailRegex.test(email)) {
        throw 'Email is not a valid university email address!';
    }
}

function getEmailDomain(email) {
    return email.split('@')[1];
}

function validateDomainsMatch(domain1, domain2) {
    if (domain1 != domain2) {
        throw 'Email domain does not match selected university domain!';
    }
}

function isValidUserParameters(universityId, username, password, passwordConfirmation, name, email, imageURL, bio) {
    sharedValidation.checkParamPresent(universityId, 'universityId');
    sharedValidation.checkParamPresent(username, 'username');
    sharedValidation.checkParamPresent(password, 'password');
    sharedValidation.checkParamPresent(passwordConfirmation, 'password confirmation');
    sharedValidation.checkParamPresent(name, 'name');
    sharedValidation.checkParamPresent(email, 'email');
    sharedValidation.checkParamPresent(imageURL, 'image url');
    sharedValidation.checkParamPresent(bio, 'bio');

    sharedValidation.checkIsString(universityId, 'universityId');
    sharedValidation.checkIsString(username, 'username');
    sharedValidation.checkIsString(password, 'password');
    sharedValidation.checkIsString(passwordConfirmation, 'password confirmation');
    sharedValidation.checkIsString(name, 'name');
    sharedValidation.checkIsString(email, 'email');
    sharedValidation.checkIsString(imageURL, 'image url');
    sharedValidation.checkIsString(bio, 'bio');

    universityId = sharedValidation.cleanUpString(universityId);
    username = sharedValidation.cleanUpString(username);
    password = sharedValidation.cleanUpString(password);
    passwordConfirmation = sharedValidation.cleanUpString(passwordConfirmation);
    name = sharedValidation.cleanUpString(name);
    email = sharedValidation.cleanUpString(email);
    imageURL = sharedValidation.cleanUpString(imageURL);
    bio = sharedValidation.cleanUpString(bio);

    sharedValidation.checkStringLength(universityId, 'university id');
    sharedValidation.checkStringLength(username, 'username');
    sharedValidation.checkStringLength(password, 'password');
    sharedValidation.checkStringLength(passwordConfirmation, 'password confirmation');
    sharedValidation.checkStringLength(name, 'name');
    sharedValidation.checkStringLength(email, 'email');
    sharedValidation.checkStringLength(imageURL, 'image url');
    sharedValidation.checkStringLength(bio, 'bio');

    username = username.toLowerCase();
    email = email.toLowerCase();

    sharedValidation.isValidUniversityId(universityId);

    isValidUsername(username);
    isValidPassword(password, 'password');
    isValidPassword(passwordConfirmation, 'password confirmation');
    passwordsMatch(password, passwordConfirmation);
    isValidEmail(email);

    return {
        universityId: universityId,
        username: username,
        password: password,
        passwordConfirmation: passwordConfirmation,
        name: name,
        email: email,
        imageURL: imageURL,
        bio: bio
    }
}

function validateUsername(username) {
    sharedValidation.checkParamPresent(username, 'username');
    sharedValidation.checkIsString(username, 'username');
    username = sharedValidation.cleanUpString(username);
    sharedValidation.checkStringLength(username, 'username');
    username = username.toLowerCase();
    isValidUsername(username);

    return username;
}

function isValidCheckUserParameters(universityId, username, password) {
    sharedValidation.checkParamPresent(universityId, 'university id');
    sharedValidation.checkParamPresent(username, 'username');
    sharedValidation.checkParamPresent(password, 'password');

    sharedValidation.checkIsString(universityId, 'university id');
    sharedValidation.checkIsString(username, 'username');
    sharedValidation.checkIsString(password, 'password');

    universityId = sharedValidation.cleanUpString(universityId);
    username = sharedValidation.cleanUpString(username);
    password = sharedValidation.cleanUpString(password);

    sharedValidation.checkStringLength(username, 'university id');
    sharedValidation.checkStringLength(username, 'username');
    sharedValidation.checkStringLength(password, 'password');

    username = username.toLowerCase();

    sharedValidation.isValidUniversityId(universityId);
    isValidUsername(username);
    isValidPassword(password, 'password');

    return {
        universityId: universityId,
        username: username,
        password: password
    }
}

function validateUpdatePassword(username, currentPassword, newPassword, newPasswordConfirmation) {
    sharedValidation.checkParamPresent(username, 'username');
    sharedValidation.checkParamPresent(currentPassword, 'current password');
    sharedValidation.checkParamPresent(newPassword, 'new password');
    sharedValidation.checkParamPresent(newPasswordConfirmation, 'new password confirmation');

    sharedValidation.checkIsString(username, 'username');
    sharedValidation.checkIsString(currentPassword, 'current password');
    sharedValidation.checkIsString(newPassword, 'new password');
    sharedValidation.checkIsString(newPasswordConfirmation, 'new password confirmation');

    username = sharedValidation.cleanUpString(username);
    currentPassword = sharedValidation.cleanUpString(currentPassword);
    newPassword = sharedValidation.cleanUpString(newPassword);
    newPasswordConfirmation = sharedValidation.cleanUpString(newPasswordConfirmation);

    sharedValidation.checkStringLength(username, 'username');
    sharedValidation.checkStringLength(currentPassword, 'current password');
    sharedValidation.checkStringLength(newPassword, 'new password');
    sharedValidation.checkStringLength(newPasswordConfirmation, 'new password confirmation');

    username = username.toLowerCase();

    isValidUsername(username);
    isValidPassword(currentPassword, 'current password');
    isValidPassword(newPassword, 'new password');
    isValidPassword(newPasswordConfirmation, 'new password confirmation');

    passwordsMatch(newPassword, newPasswordConfirmation);

    return {
        username: username,
        currentPassword: currentPassword,
        newPassword: newPassword
    }
}

function isValidUserUpdateParameters(currentUsername, username, name, email, bio) {
    sharedValidation.checkParamPresent(currentUsername, 'current username');
    sharedValidation.checkParamPresent(username, 'username');
    sharedValidation.checkParamPresent(name, 'name');
    sharedValidation.checkParamPresent(email, 'email');
    sharedValidation.checkParamPresent(bio, 'bio');

    sharedValidation.checkIsString(currentUsername, 'current username');
    sharedValidation.checkIsString(username, 'username');
    sharedValidation.checkIsString(name, 'name');
    sharedValidation.checkIsString(email, 'email');
    sharedValidation.checkIsString(bio, 'bio');

    currentUsername = sharedValidation.cleanUpString(currentUsername);
    username = sharedValidation.cleanUpString(username);
    name = sharedValidation.cleanUpString(name);
    email = sharedValidation.cleanUpString(email);
    bio = sharedValidation.cleanUpString(bio);

    sharedValidation.checkStringLength(currentUsername, 'current username');
    sharedValidation.checkStringLength(username, 'username');
    sharedValidation.checkStringLength(name, 'name');
    sharedValidation.checkStringLength(email, 'email');
    sharedValidation.checkStringLength(bio, 'bio');

    currentUsername = currentUsername.toLowerCase();
    username = username.toLowerCase();
    email = email.toLowerCase();

    isValidUsername(currentUsername);
    isValidUsername(username);
    isValidEmail(email);

    return {
        currentUsername: currentUsername,
        username: username,
        name: name,
        email: email,
        bio: bio
    }
}

function isValidImageURL(imageURL) {
    sharedValidation.checkParamPresent(imageURL, 'image url');
    sharedValidation.checkIsString(imageURL, 'image url');
    imageURL = sharedValidation.cleanUpString(imageURL);

    return imageURL;
}

module.exports = {
    isValidUserParameters,
    validateUsername,
    getEmailDomain,
    validateDomainsMatch,
    isValidCheckUserParameters,
    validateUpdatePassword,
    isValidUserUpdateParameters,
    isValidImageURL
};
