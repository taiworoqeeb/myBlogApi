const express = require("express");
const postController = require("../controllers/postController");
const multer = require('../util/multer')

const router = express.Router();

router
.route('/createPost')
.post(multer.single('image'), postController.CreatePost)

router
.route('/getAllPosts')
.get(postController.getAllPosts);

router
.route('/updatePost/:id')
.put(postController.UpdatePost)

router
.route('/deletePost/:id')
.delete(postController.DeletePost)

router
.route('/getPost/:id')
.get(postController.getPost);

router
.route('/removeImage/:id')
.get(postController.removeImage);

router
.route('/updateImage/:id')
.get(multer.single('image'), postController.updateImage);

router
.route('/getPostByTitle')
.get(postController.getPostByTitle);

router
.route('/uploadImage')
.post(multer.single('image'), postController.uploadFile)



module.exports = router;
