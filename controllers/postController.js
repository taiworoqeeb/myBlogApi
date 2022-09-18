const Post = require("../models/postModel");
const Cloudinary = require("../util/cloudinary");
const Comment = require("../models/comment");
const Reply = require("../models/reply")

exports.CreatePost = async (req, res, next) => {
    var {title, desc, content, tags, draft} = req.body;
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
                    title: title,
                    desc: desc,
                    content: content,
                    tags: tags,
                    draft: draft,
                    image_url: result.secure_url,
                    image_id: result.public_id
                })
                var savedPost = await new_post.save()
            }else{
                new_post = new Post({
                    title: title,
                    desc: desc,
                    content: content,
                    tags: tags,
                    draft: draft,
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
  console.log(req.body)
    var {title, content, desc, tags, draft} = req.body
  try {
    await Post.findById(req.params.id)
    .then(async(post)=>{
        if(post){
            await Post.findByIdAndUpdate(post._id, {
                title: title,
                content: content,
                tags: tags,
                desc: desc,
                draft: draft
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
      res.status(404).json({
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
    const post = await Post.findById(req.params.id).populate({path: 'comments', populate:{path: 'reply', model: 'Replies'}});
    if(post){
        res.status(200).json({
        status: true,
        data: post,
        });
    }else{
        res.status(404).json({
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
          res.status(404).json({
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
                    image_url: null,
                    image_id: null
                })
                res.json({
                    status: true,
                    message: "Image Removed"
                })
            }else{
                res.status(404).json({
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
                        message: "Image Updated",
                        data: result.secure_url,
                    })
                }else{
                    res.json({
                        status: false,
                        message: "No Image Selected"
                    })
                }
                
            }else{
                res.status(404).json({
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

exports.addComment = async(req, res, next)=>{

  var id = req.params.postId
    const {name, comment} = req.body;
    try {
        if(!name){
            res.status(401).json({
                status: false,
                message: "Please enter your name"
            })
        }

        if(!comment){
            res.status(401).json({
                status: false,
                message: "Comment cannot be empty"
            })
        }

        if(!id){
            res.status(404).json({
                status: false,
                message: "Post Id not found"
            })
        }
        var checkId = Post.findById(id)
        if(checkId){
            const new_comment = new Comment({
                postId: id,
                name: name,
                comment: comment
            })

            var Out = await new_comment.save()

            await Post.findByIdAndUpdate(id, {
              $push: {comments: Out._id}
          },{new: true}).catch(err => console.log(err))

            res.status(201).json({
                status: true,
                message: 'Comment added successfully'
            })

        }else{
            res.status(404).json({
                status: false,
                message: "Article not found"
            })
        }
    } catch (error) {
        console.error(error);
        res.json(error)
        next(error)
    }
}

exports.addReply = async(req, res, next)=>{
  const id = req.params.commentId
  const {name, reply} = req.body;
  try {
      if(!name){
          res.status(401).json({
              status: false,
              message: "Please enter your name"
          })
      }

      if(!reply){
          res.status(401).json({
              status: false,
              message: "Response cannot be empty"
          })
      }

      if(!id){
          res.status(404).json({
              status: false,
              message: "Comment Id not found"
          })
      }

      await Comment.findById(id)
      .then(async(comment) =>{
          if(!comment){
              res.status(404).json({
                  status: false,
                  message: "Comment not found"
              })
          }

          const new_reply = new Reply({
              comment: comment._id,
              name: name,
              reply: reply
          })

          var Out = await new_reply.save()

          await Comment.findByIdAndUpdate(comment._id, {
              $push: {reply: Out._id}
          },{new: true})

          //var commentOut = await Comment.findById(comment._id)

          res.status(201).json({
              status: true,
              message: "Response sent",
          })
      })
  } catch (error) {
      console.error(error);
      res.json(error)
      next(error)
  }
}

exports.voteComment = async(req, res, next)=>{
  var status = req.query.status
  var id = req.params.commentId
  try {
      if(!id){
          res.status(404).json({
              status: false,
              message: "Comment id not found"
          })
      }
      await Comment.findById(id)
      .then(async(comment)=>{
          if(!comment){
              res.status(404).json({
                  status: false,
                  message: "Comment not found"
              })
          }
          if(status === 'upvote'){
              await Comment.findByIdAndUpdate(comment._id, {
                  $inc:{upvote: 1}
              })
              res.status(200).json({
                  status: true,
                  message: `Comment ${status}d`
              })
          }else if(status === 'downvote'){
              await Comment.findByIdAndUpdate(comment._id, {
                  $inc:{downvote: 1}
              })
              res.status(200).json({
                  status: true,
                  message: `Comment ${status}d`
              })
          }else if(!status || status === undefined || status === null ){
              res.status(401).json({
                  status: false,
                  message: "Status query can't be empty"
              })
          }
      })
  } catch (error) {
      console.error(error);
      res.json(error)
      next(error)
  }
}

exports.voteReply = async(req, res, next)=>{
  var status = req.query.status
  var id = req.params.replyId
  try {
      if(!id){
          res.status(404).json({
              status: false,
              message: "Reply id not found"
          })
      }
      await Reply.findById(id)
      .then(async(reply)=>{
          if(!reply){
              res.status(404).json({
                  status: false,
                  message: "reply not found"
              })
          }
          if(status === 'upvote'){
              await Reply.findByIdAndUpdate(reply._id, {
                  $inc:{upvote: 1}
              })
              res.status(200).json({
                  status: true,
                  message: `reply ${status}d`
              })
          }else if(status === 'downvote'){
              await Reply.findByIdAndUpdate(reply._id, {
                  $inc:{downvote: 1}
              })
              res.status(200).json({
                  status: true,
                  message: `reply ${status}d`
              })
          }else if(!status || status === undefined || status === null ){
              res.status(401).json({
                  status: false,
                  message: "Status query can't be empty"
              })
          }
      })
  } catch (error) {
      console.error(error);
      res.json(error)
      next(error)
  }
}


exports.deleteComment = async(req, res, next)=>{
  const id = req.params.commentId
  try {
      if(!id){
          res.status(404).json({
              status: false,
              message: "Comment Id not found"
          })
      }
      await Comment.findById(id)
      .populate(['reply'])
      .then(async(comment)=>{
          if(!comment){
              res.status(404).json({
                  status: false,
                  message: "Comment not found"
              })
          }

          if(comment.reply?.length){
              for(var i=0; i<= comment.reply.length; i++){
                  await Reply.findByIdAndDelete(comment.reply[i]._id)
              }
          }
          
          await Comment.findByIdAndDelete(comment._id)

          res.status(200).json({
              status: true,
              message: "Comment deleted"
          })

      })
  } catch (error) {
      console.error(error);
      res.json(error)
      next(error)
  }
}

exports.deleteReply = async(req, res, next)=>{
  const id = req.params.replyId
  try {
      if(!id){
          res.status(404).json({
              status: false,
              message: "Reply id not found"
          })
      }
      await Reply.findById(id)
      .then(async(reply)=>{
          if(!reply){
              res.status(404).json({
                  status: false,
                  message: "Reply not found"
              })
          }

          await Reply.findByIdAndDelete(reply._id)
          res.status(200).json({
              status: true,
              message: "Reply deleted"
          })
      })
  } catch (error) {
      console.error(error);
      res.json(error)
      next(error)
  }
}

exports.updateComment = async(req, res, next)=>{
  const id = req.params.commentId
  const {commentUpdate} = req.body;
  try {
      if(!id){
          res.status(404).json({
              status: false,
              message: "Comment id not found"
          })
      }
      await Comment.findById(id)
      .then(async(comment)=>{
          if(!comment){
              res.status(404).json({
                  status: false,
                  message: "Comment not found"
              })
          }

          await Comment.findByIdAndUpdate(comment._id, {
              comment: commentUpdate
          })

          res.status(200).json({
              status: true,
              message: "Comment updated"
          })
      })
  } catch (error) {
      console.error(error);
      res.json(error)
      next(error)
  }
}

exports.updateReply = async(req, res, next)=>{
  const id = req.params.replyId
  const {replyUpdate} = req.body;
  try {
      if(!id){
          res.status(404).json({
              status: false,
              message: "Reply id not found"
          })
      }
      await Reply.findById(id)
      .then(async(reply)=>{
          if(!reply){
              res.status(404).json({
                  status: false,
                  message: "reply not found"
              })
          }

          await Reply.findByIdAndUpdate(reply._id, {
              reply: replyUpdate
          })

          res.status(200).json({
              status: true,
              message: "Reply updated"
          })
      })
  } catch (error) {
      console.error(error);
      res.json(error)
      next(error)
  }
}