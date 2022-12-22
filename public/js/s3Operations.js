const region = 'us-east-1';
const bucketName = 'cs546-ws-final-project-images';
const identityPoolId = 'us-east-1:d0545538-d63b-453e-b60a-e52ddc828f6c';

// Initialize the Amazon Cognito credentials provider
AWS.config.region = region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: identityPoolId,
});

/**
 * Uploads an image.
 *
 * @param {String} imageName
 * @param {String} imageStream
 * @returns The URL to the image.
 * @throws Will throw if parameters are invalid or 
 *         there was an issue uploading the file.
 */
export function uploadImage(imageName, imageStream, callback) {

    let params = {
        apiVersion: '2006-03-01',
        params: { Bucket: bucketName },
        Key: imageName,
        ContentType: 'image/jpeg',
        ACL:'public-read',
        Body: imageStream
    };

    let s3Client = new AWS.S3({
        apiVersion: '2006-03-01',
        params: { Bucket: bucketName }
    });

    s3Client.upload(params, function(err, data) {

        if (err) {
            throw err;
        }

        callback(data.Location);
    });
}

export function getUniqueName(filename) {

    var now = Date.now();

    return now + filename;
}
