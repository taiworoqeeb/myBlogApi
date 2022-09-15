const mongoose = require("mongoose");
const ReplySchema = new mongoose.Schema({
    comment:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comments'
    },
    name: {
        type: String
    },
    reply:{
        type: String
    },
    upvote: {
        type: Number,
        default: 0
    },
    downvote:{
        type: Number,
        default: 0
    },
},
{
    timestamps: true
});

module.exports = mongoose.model('Replies', ReplySchema);
