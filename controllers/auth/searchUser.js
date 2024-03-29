const Joi = require("joi");
const User = require("../../models/user");


const searchUser = async (req, res, next) => {
    const searchInput = req.params.input;
    // const regex = new RegExp(searchInput, 'i');
    const query = {
        $or: [
          { userName: { $regex: searchInput, $options: 'i' }  },
          { name: { $regex: searchInput, $options: 'i' } },
        ],
      };
      doc = await User.find(query).limit(15)
      return res.status(200).json({data:doc})
};


module.exports = searchUser;