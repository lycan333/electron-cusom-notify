export const isValidUrl = (str) => {
    try {
        const url = new URL(str);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (err) {
        return false;
    }
}

export const isBase64Image = (str) => {
    // Check if it starts with data:image and base64
    return /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(str);
}

export const isImageInput = (str) => {
    return isBase64Image(str) || (isValidUrl(str) && /\.(jpg|jpeg|png|gif|webp|svg)$/.test(str));
}


