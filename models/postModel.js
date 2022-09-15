const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    content:{
        type: String
    },
    tags:[{
        type: String
    }],
    image_url:{
        type: String
    },
    image_id:{
        type: String
    },
    draft:{
        type: Boolean,
        default: false
    },
    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comments'
    }]
    
}, 
{timestamps: true}

);

module.exports = new mongoose.model('BlogPost', postSchema);