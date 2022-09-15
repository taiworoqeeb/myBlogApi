const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogPost'
    },
    name: {
        type: String,
    },
    comment: {
        type: String,
    },
    upvote: {
        type: Number,
        default: 0
    },
    downvote:{
        type: Number,
        default: 0
    },
    reply: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Replies'
    }] 
},
{
    timestamps: true
});

module.exports = mongoose.model('Comments', CommentSchema);
