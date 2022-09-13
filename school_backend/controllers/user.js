const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const {validationResult} = require('express-validator');
const cors = require('cors');
const multer = require("multer");
const { AVATAR_PATH } = require('../config/path');

const api = require('../config/api');
const User = require('../models/user');
const Subject = require('../models/subject');
// const {create} = require('../models/user');

var storage = multer.diskStorage({

    destination: "./public/images",
    filename: function (req, file, cb) {
        let filename = cb(null, Date.now() + '-' + file.originalname);
        return filename;
    }
})

var upload = multer({ storage: storage }).array('file');

const login = async (req, res) => {
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(401)
            .json({status: false, error: errors.array()});
    }

    const {email, password} = req.body;   
    const _user = await User.findOne({
        email: new RegExp(email, 'i'),
        // del: false, isActive: true,
    });

    if (!_user) {
     
        return res
            .status(401)
            .json({status: false, error: 'no_user'});
    }

    if (_user.salt) {
       
        const hash = crypto
            .pbkdf2Sync(
                password,
                _user.salt.split(' ')[0],
                10000,
                512,
                'sha512'
            )
            .toString('hex');

        if (hash !== _user.hash) {
            return res
                .status(401)
                .json({status: false, error: 'invalid_password!'});
        }
    }

    const token = jwt.sign({
        id: _user.id
    }, api.JWT_SECRET, {
        expiresIn: '30d', // expires in 365 days
    });
    const myJSON = JSON.stringify(_user);
    const user = JSON.parse(myJSON);

    delete user.hash;
    delete user.salt;

    return res.send({
        status: true, accessToken: token,
        //accessToken: "111111111111111111111111111111",
        user,
        //user: "admin"
    });
};

const checkAuth = async (req, res, next) => {
    const bearerToken = req.get('Authorization');
    let token;
    if (bearerToken) {
        token = bearerToken.split(' ')[1];
    }

    let decoded;
    try {
        decoded = jwt.verify(token, api.JWT_SECRET);
        // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    } catch (err) {
      
        return res
            .status(401)
            .send(err.message || 'check user error');
    }

    req.currentUser = await User
        .findOne({_id: decoded.id})
        .catch((err) => {
         
        });

    if (req.currentUser) {
       
        next();
    } else {
       
        res
            .status(401)
            .send('invalid_user');
    }
};

const getMe = async (req, res) => {
    const {currentUser} = req;

    const myJSON = JSON.stringify(currentUser);
    const user = JSON.parse(myJSON);
    delete user.hash;
    delete user.salt;
    return res.json({status: true, user});
};

const editMe = async (req, res) => {
    const {currentUser} = req;
    // console.log('==>editMe in');
    const editData = {
        ...req.body
    };

    // TODO: should limit the editing fields here
    //delete editData.password;
    //delete editData.avatar;

    //  console.log('------');
    //  console.log('editData.avatar-->'); console.log(editData.avatar);
    //  console.log('editData.file.location-->');  console.log(editData.file.location);
    if (editData.clearAvatar) {
        editData.avatar = '';
        delete editData.clearAvatar;
    } else if (req.file) {
        
        editData.avatar = req.file.location;

    }
  
    await User.updateOne({
        _id: currentUser.id
    }, {
        $set: {
            ...editData
        }
    });

    const student = await User.findOne({_id: currentUser.id});
        
    const name = student.firstName + ' ' + student.lastName;

    await Subject.updateOne({
        studentname: name,
        classes: student.classes,
    }, {
        $set: {
            avatar: '',
        }
    });

    const _user = await User.findOne({
        _id: currentUser.id,
        // del: false,
    });
   
    if (!_user) {
        return res
            .status(401)
            .json({status: false, error: 'no_user'});
    }
    return res.send({user: _user});
};

const set_avatar = async (req, res) => {

    let filepath = '';
    console.log(AVATAR_PATH);
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        //return res.status(200).send(req.file);
        console.log('filepath--> ' + req.files[0].path);
        filepath = req.files[0].path;
        const {currentUser} = req;
        saving(currentUser.id, filepath);
    });
    async function saving(userid, avatarpath){

        const student = await User.findOne({_id: userid});
        
        const name = student.firstName + ' ' + student.lastName;
    
        await Subject.updateOne({
            studentname: name,
            classes: student.classes,
        }, {
            $set: {
                avatar: avatarpath,
            }
        });
        
        await User.updateOne({
            _id: userid
        }, {
            $set: {
                avatar: avatarpath,
            }
        });
        const _user = await User.findOne({
            _id: userid,
        });
        console.log(_user);
        if (!_user) {
            return res
                .status(401)
                .json({status: false, error: 'no_user'});
        }
        return res.send({user: _user});
    };
    
};

const resetPasswordByOld = async (req, res) => {
    // const { old_password, new_password } = req.body;
    const {new_password} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error_array = errors.array();
        return res.json({status: false, error: error_array[0].msg});
    }

    const _user = req.currentUser;

    // if (!_user.salt) {   return res.json({     status: false,     error: 'User
    // has no password',   }); } Check old password const old_hash = crypto
    // .pbkdf2Sync(old_password, _user.salt.split(' ')[0], 10000, 512, 'sha512')
    // .toString('hex'); if (old_hash !== _user.hash) {   return res.json({ status:
    // false,     error: 'Invalid old password!',   }); }

    const salt = crypto
        .randomBytes(16)
        .toString('hex');
    const hash = crypto
        .pbkdf2Sync(new_password, salt, 10000, 512, 'sha512')
        .toString('hex');

    _user.salt = salt;
    _user.hash = hash;
    _user.save();

    return res.json({status: true});
};

const signUp = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({status: false, error: errors.array()});
    }

    const _user = await User
        .findOne({
            email: new RegExp(req.body.email, 'i'),
            del: false
        })
        .catch((err) => {
        
        });

    if (!_user) {
        return res
            .status(400)
            .send({status: false, error: 'user_does_not_exist'});
    }

    const password = req.body.password;
  
    const salt = crypto
        .randomBytes(16)
        .toString('hex');
    const hash = crypto
        .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
        .toString('hex');

    _user.salt = salt;
    _user.hash = hash;
    _user.verifiedEmail = true;
    _user.firstName = req.body.firstName;
    _user.lastName = req.body.lastName;
    _user
        .save()
        .then((_res) => {
            const token = jwt.sign({
                id: _res.id
            }, api.JWT_SECRET, {
                expiresIn: '30d', // expires in 365 days
            });

            const myJSON = JSON.stringify(_res);
            const user = JSON.parse(myJSON);
            delete user.hash;
            delete user.salt;

            return res.send({
                status: true,
                data: {
                    token,
                    user
                }
            });
        })
        .catch((err) => {
            return res
                .status(500)
                .send({status: false, error: err.message});
        });
};

const resetPasswordByCode = async (req, res) => {
    const {code, email, password} = req.body;

    const user = await User.findOne({
        email: new RegExp(email, 'i'),
        del: false
    });

    if (!user) {
        return res.json({status: false, error: 'no_user'});
    }

    if (!user.salt) {
        return res.json({status: false, error: 'no_password'});
    }

    const aryPassword = user
        .salt
        .split(' ');
    if (!aryPassword[1] || aryPassword[1] !== code) {
        // Code mismatch
        return res.json({status: false, error: 'invalid_code'});
    }
    // Expire check
    const delay = new Date().getTime() - user['updated_at'].getTime();

    if (delay > 1000 * 60 * 15) {
        // More than 15 minutes passed
        return res.json({status: false, error: 'expired_code'});
    }

    const salt = crypto
        .randomBytes(16)
        .toString('hex');
    const hash = crypto
        .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
        .toString('hex');

    user['salt'] = salt;
    user['hash'] = hash;

    user
        .save()
        .catch((err) => {
          
        });

    return res.send({status: true});
};

const forgotPassword = async (req, res) => {
    const {email} = req.body;

    if (!email) {
        return res.json({status: false, error: 'no_email'});
    }

    const _user = await User.findOne({
        email: new RegExp(email, 'i'),
        del: false
    });

    if (!_user) {
        return res.json({status: false, error: 'no_user'});
    }
    if (_user['salt']) {
        const code = randomstring.generate(
            {length: 5, charset: '1234567890ABCDEFHJKMNPQSTUVWXYZ'}
        );

        const oldSalt = _user['salt'].split(' ')[0];
        _user['salt'] = oldSalt + ' ' + code;
        _user['updated_at'] = new Date();
        _user.save();
    } else {
        return res.json({status: false, error: 'No password'});
    }
};

const teacher_create = async (req, res) => {
    const {currentUser} = req;
    const createData = {
        ...req.body
    };
   

    const user = new User({
        role: 'teacher',
        avatar: '',
        ...req.body,
        // user: currentUser.id,
    });
    user
        .save()
        .catch((err) => {
            
        });

    return res.send({status: true});
};

const student_create = async (req, res) => {
    const {currentUser} = req;
    const createData = {
        ...req.body
    };

    const user = new User({
        ...req.body,
        role: 'student',
        avatar: '',
        user: currentUser.id,

        // user: currentUser.id,
    });
    user
        .save()
        .catch((err) => {
         
        });

    const subject = new Subject({
        classes: createData.classes,
        studentname: createData.firstName + ' ' + createData.lastName,
        avatar: '',
    });
    subject
        .save()
        .catch((err) => {
          
        });

    return res.send({status: true});
};

const loadByQuery = async (req, res) => {
    const {currentUser} = req;
    const {searchText, isActive, page, limit} = req.body;

    const sort = Number.parseInt(req.body.sort);

    const query = [];

    if (searchText) {
        // Active
        query.push({
            $match: {
                $or: [
                    {
                        firstName: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        lastName: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        email: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        phone: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        country: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }
                ],
                // user: mongoose.Types.ObjectId(currentUser.id),
            }
        });
    } else {
        // query.push({   $match: {     user: mongoose.Types.ObjectId(currentUser.id),
        // }, });
    }

    query.push({$match: {role: 'teacher'}});

    if (sort === 1) {
     
        query.push({
            $sort: {
                firstName: 1,
                lastName: 1
            }
        });
    } else if (sort === 2) {
      
        query.push({
            $sort: {
                firstName: -1,
                lastName: -1
            }
        });
    }

    // add id field
    query.push({
        $addFields: {
            id: '$_id'
        }
    });

    // get the total count
    query.push({$count: 'totalCount'});

    const response = await User
        .aggregate(query)
        .exec();

    let totalCount = 0;
    if (response.length > 0) {
        totalCount = response[0].totalCount;
    }
    query.pop();

    const skip = page * limit;
    if (skip > 0) {
        query.push({$skip: skip});
    }

    query.push({$limit: limit});

    const customers = await User
        .aggregate(query)
        .exec();
    
    //let customers = [];
    //customers = customers1.filter(customer => customer.role == 'teacher');

    //totalCount = customers.length;

    return res.send({status: true, customers, totalCount});
};

const loadByQuery_student = async (req, res) => {
    const {currentUser} = req;
    const {searchText, isActive, page, limit} = req.body;

    const sort = Number.parseInt(req.body.sort);

    const query = [];

    if (searchText) {
        // Active
        query.push({
            $match: {
                $or: [
                    {
                        firstName: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        lastName: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        email: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        phone: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        country: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }
                ],
                // user: mongoose.Types.ObjectId(currentUser.id),
            }
        });
    } else {
        // query.push({   $match: {     user: mongoose.Types.ObjectId(currentUser.id),
        // }, });
    }

    query.push({$match: {role: 'student'}});

    if (sort === 1) {
      
        query.push({
            $sort: {
                firstName: 1,
                lastName: 1
            }
        });
    } else if (sort === 2) {
      
        query.push({
            $sort: {
                firstName: -1,
                lastName: -1
            }
        });
    } else if (sort === 3) {
      
        query.push({
            $sort: {
                classes: 1
            }
        });
    }

    query.push({
        $addFields: {
            id: '$_id'
        }
    });

    // get the total count
    query.push({$count: 'totalCount'});

    // query.push({   $cond: {     if: { $gte: ["role", 'teacher'] },  } });

    const response = await User
        .aggregate(query)
        .exec();

    let totalCount = 0;
    if (response.length > 0) {
        totalCount = response[0].totalCount;
    }
    query.pop();

    const skip = page * limit;
    if (skip > 0) {
        query.push({$skip: skip});
    }

    query.push({$limit: limit});

    const students = await User
        .aggregate(query)
        .exec();
    // console.log(students);
    //const students = students1.filter(student => student.role == 'student');

    //totalCount = students.length;

    return res.send({status: true, students, totalCount});
};

const editdata_get = async (req, res) => {
   
    const {currentUser} = req;
 
    const customer = await User.findOne({
        // user: currentUser.id,
        _id: req.params.id
    });

    if (!customer) {
        return res
            .status(400)
            .json({status: false, error: 'student doesn`t exist'});
    }

    return res.send({status: true, customer});
};

const editdata_update = async (req, res) => {
    const {currentUser} = req;

    const student = await User.findOne({_id: req.params.id});
  
    const name = student.firstName + ' ' + student.lastName;
  
    var myquery = { studentname: name, classes : student.classes };
    const setname = req.body.firstName + ' ' + req.body.lastName;
    var newvalues = { $set: {studentname: setname, classes : req.body.classes} };
    Subject.updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
      });

    User
        .updateOne({
            _id: req.params.id,
            // user: currentUser.id,
        }, {
            $set: {
                ...req.body,
                // fullName: req.body.firstName + ' ' + req.body.lastName,
            }
        })
        .then(() => {
            res.send({status: true});
        })
        .catch((err) => {
            res
                .status(500)
                .json({
                    status: false,
                    error: err.message || 'Teacher Update Error'
                });
        });
};

const remove_teacher = async(req, res) => {
    const {currentUser} = req;

    const student = await User.findOne({_id: req.params.id});
    
    const name = student.firstName + ' ' + student.lastName;
    
    var myquery = {studentname : name, classes : student.classes };
    Subject.deleteOne(myquery, function(err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
      });

    User
        .deleteOne({
            _id: req.params.id,
            // user: currentUser.id,
        })
        .then(() => {
            return res.send({status: true});
        })
        .catch((err) => {
            res
                .status(500)
                .send({
                    status: false,
                    error: err.message || 'Teacher Delete Error'
                });
        });
};

const score_load = async (req, res) => {
    const {currentUser} = req;
    const {searchText, isActive, page, limit} = req.body;


    const sort = Number.parseInt(req.body.sort);

    const query = [];

    if (searchText) {
        // Active
        query.push({
            $match: {
                $or: [
                    {
                        firstName: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        lastName: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        email: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        phone: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        country: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }
                ],
                // user: mongoose.Types.ObjectId(currentUser.id),
            }
        });
    } else {
        // query.push({   $match: {     user: mongoose.Types.ObjectId(currentUser.id),
        // }, });
    }

    if (sort === 1) {
       
        query.push({
            $sort: {
                firstName: 1,
                lastName: 1
            }
        });
    } else if (sort === 2) {
       
        query.push({
            $sort: {
                firstName: -1,
                lastName: -1
            }
        });
    }

    // if (isActive) {   query.push({     $match: {       isActive,     },   }); }
    // add id field
    query.push({
        $addFields: {
            id: '$_id'
        }
    });

    // get the total count
    query.push({$count: 'totalCount'});

    const response = await User
        .aggregate(query)
        .exec();

    let totalCount = 0;
    if (response.length > 0) {
        totalCount = response[0].totalCount;
    }
    query.pop();

    const skip = page * limit;
    if (skip > 0) {
        query.push({$skip: skip});
    }

    query.push({$limit: limit});

    const scores1 = await User
        .aggregate(query)
        .exec();
    
    const scores = scores1.filter(score => score.role == 'student');

    totalCount = scores.length;

    return res.send({status: true, scores, totalCount});
};

module.exports = {
    login,
    signUp,
    checkAuth,
    getMe,
    editMe,
    forgotPassword,
    resetPasswordByOld,
    resetPasswordByCode,
    teacher_create,
    loadByQuery,
    editdata_get,
    editdata_update,
    remove_teacher,
    loadByQuery_student,
    student_create,
    score_load,
    set_avatar,
};
