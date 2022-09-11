const Post = require("../models/postModel");
const Cloudinary = require("../util/cloudinary")

exports.CreatePost = async (req, res, next) => {
    const {title, desc, content, tags, draft} = req.body;
  try {
    await Post.findOne({
        title: title
    }).then(async(post)=>{
        if(post){
            res.status(401).json({
                status: false,
                message: `Post with ${title} already exist`
            })
        }else{
            if(req.file.path){
                var result = await Cloudinary.uploader.upload(req.file.path, {folder: "myBlogImage"})
                var new_post = new Post({
                    title,
                    desc,
                    content,
                    tags,
                    draft,
                    image_url: result.secure_url,
                    image_id: result.public_id
                })
                var savedPost = await new_post.save()
            }else{
                new_post = new Post({
                    title,
                    desc,
                    tags,
                    content,
                    draft
                })
                savedPost = await new_post.save()
            }
            
            if(savedPost.draft == false){
               return res.status(200).json({
                status: true,
                message: "Post published successfully!"
              });
            }else if(savedPost.draft == true){
              return res.status(200).json({
                status: true,
                message: "Post drafted successfully!"
              });
            }
           
        }
    })
    
  } catch (err) {
    console.error(err);
    res.json({
      status: false,
      message: "An error occured",
      err
    });
    next(err)
  }
};

exports.UpdatePost = async (req, res, next) => {
    const {title, content, desc, tags, draft} = req.body
  try {
    await Post.findById(req.params.id)
    .then(async(post)=>{
        if(post){
            await Post.findByIdAndUpdate(post._id, {
                title,
                content,
                tags,
                desc,
                draft
            });
                res.status(200).json({
                    status: true,
                    message: "updated successfully",
                });
          } else {
            res.status(403).json({
                status: false,
                message: "You can only update your post",
            });
          }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: err,
    });
    next(err)
  }
};

exports.DeletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if(post) {
      await post.deleteOne();
        res.status(200).json({
            status: true,
            message: "deleted successfully",
        });
    } else {
      res.status(403).json({
        status: false,
        message: "Post not found",
      });
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({
      status: false,
      message: 'An error occured',
      err
    });
    next(err)
  }
};

exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({
      draft: false
    }).sort({ createdAt: -1 });
    if(posts){
        res.json({
            status: true,
            data: posts,
        });
    }else{
        res.json({
            status: false,
            message: "Post not found",
          });
    }
    
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: err,
    });
    next(err)
  }
};

exports.getDraftPosts = async(req, res, next) =>{
  try{
  const posts = await Post.find({
    draft: true
  }).sort({ createdAt: -1 });
  if(posts){
      res.json({
          status: true,
          data: posts,
      });
  }else{
      res.json({
          status: false,
          message: "Post not found",
        });
  }
  
} catch (err) {
  console.error(err)
  res.status(500).json({
    message: err,
  });
  next(err)
}
}

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if(post){
        res.status(200).json({
        status: true,
        data: post,
        });
    }else{
        res.status(403).json({
            status: false,
            message: "Post not found",
        });
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err,
    });
    next(err)
  }
};

exports.getPostByTitle = async (req, res, next) => {
    var title = req.query.title;
    try {
      const post = await Post.find({
        title: { $regex: title, $options: "i"}
      }).sort({ createdAt: -1 });
      if(post){
          res.status(200).json({
          status: true,
          data: post,
          });
      }else{
          res.status(403).json({
              status: false,
              message: "Post not found",
          });
      }
      
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: err,
      });
      next(err)
    }
  };


exports.removeImage = async(req, res, next)=>{
    try {
        await Post.findById(req.params.id)
        .then(async(post)=>{
            if(post){
                await Cloudinary.uploader.destroy(post.image_id)
                await Post.findByIdAndUpdate(post._id, {
                    image_url: "#",
                    image_id: "#"
                })
                res.json({
                    status: true,
                    message: "Image Removed"
                })
            }else{
                res.status(403).json({
                    status: false,
                    message: "Post not found",
                  });
            }
        })
    } catch (error) {
        console.log(error);
        res.json(error);
        next(error)
    }
}

exports.updateImage = async(req, res, next)=>{
    try {
        await Post.findById(req.params.id)
        .then(async(post)=>{
            if(post){
                if(req.file.path){
                    var result = await Cloudinary.uploader.upload(req.file.path, {folder: "myBlogImage"});
                    await Post.findByIdAndUpdate(post._id, {
                        image_url: result.secure_url,
                        image_id: result.public_id
                    })
                    res.json({
                        status: true,
                        message: "Image Updated"
                    })
                }else{
                    res.json({
                        status: true,
                        message: "No Image Selected"
                    })
                }
                
            }else{
                res.status(403).json({
                    status: false,
                    message: "Post not found",
                  });
            }
        })
    } catch (error) {
        console.log(error);
        res.json(error);
        next(error)
    }
}

exports.uploadFile = async(req, res, next)=>{
  try{
      if(req.file.path){
        var result = await Cloudinary.uploader.upload(req.file.path, {folder: "myBlogInnerImage"})

        return res.json({
          status: true,
          url: result.secure_url
        })
      }else{
        return res.json({
          status: false,
          message: "Image not sent"
        })
      }
  }catch(err){
      console.log(err)
      next(err)
  }
  
}