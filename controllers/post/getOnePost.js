const Joi = require('joi')
const Post = require('../../models/post');
const CustomErrorHandler = require('../../services/CustomErrorHandler');

const getPost = async (req, res, next) => {
    const schema = Joi.object({
        slug: Joi.string().required()
    })

    const { error } = schema.validate(req.query);
    if (error) {
        return next(CustomErrorHandler.badRequest())
    }

    try {
        const { slug } = req.query
        const userId = req.pathType == 1 ? req.userId : req.user.id
        doc = await Post.findOne({ slug: slug }).populate("postUser","userName profileImageUrl name")
        if (!doc) {
            return next(CustomErrorHandler.notFound("Post doesn't exist"))
        }
        resultDoc = {
            postId: doc._id,
            postFileUrl: doc.postFileUrl,
            postLikesCount: doc.postLikeUsers.length,
            postType: doc.postType,
            createdAt: Date.parse(doc.createdAt) / 1000,
            commentsCount:doc.postCommentsCount,
            status:doc.postLikeUsers.includes(userId),
            userName:doc.postUser.userName,
            profileImage:doc.postUser.profileImageUrl
        }
        return res.status(200).json({ post: resultDoc });
    } catch (e) {
        CustomErrorHandler.consoleError(e)
        return next(CustomErrorHandler.serverError())
    }


}

module.exports = getPost