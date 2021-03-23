const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function UploadImg(img, preset) {
  return new Promise((resolve, reject) => {
    if (!img || !img.startsWith("data:image/")) resolve("");
    cloudinary.uploader
      .upload(img, { upload_preset: preset || "ml_default" })
      .then((data) => resolve(data.url))
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}
export function DeleteImg(img_id_raw) {
  return new Promise((resolve, reject) => {
    if (!img_id_raw) resolve("");
    const img_id = img_id_raw.match(
      /([a-z]+([0-9]+[a-z]+)+)(?!.*[a-z]+([0-9]+[a-z]+)+)/gi
    )[0];
    if (!img_id) resolve("");
    cloudinary.uploader
      .destroy(img_id)
      .then((data) => resolve(data))
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}
export function ReplaceImg(oldImg, newImg) {
  return Promise.all([UploadImg(newImg), DeleteImg(oldImg)]).then(
    ([newStr, old]) => newStr
  );
}

export default cloudinary;
