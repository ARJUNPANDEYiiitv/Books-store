import cloudinary from "cloudinary"
cloudinary.v2.config({
  cloud_name: 'books-store',
  api_key:'582219232393758' ,
  api_secret: 'dKEWkMcADBd0Z9CVtwKVjqDU4Ys',
});

export default cloudinary;