const mongoose = require('mongoose');
const Subject = require('../models/subject');

const getscore = async (req, res) => {
    const {currentUser} = req;
    const customer = await Subject.findOne({
        // user: currentUser.id,
        _id: req.params.id
    });

    if (!customer) {
        return res
            .status(400)
            .json({status: false, error: 'Subject doesn`t exist'});
    }

    return res.send({status: true, customer});
};

const create = async (req, res) => {
    const {currentUser} = req;
    const subject = new Subject({
        ...req.body,
        user: currentUser.id,
        fullName: req.body.firstName + ' ' + req.body.lastName
    });
    subject
        .save()
        .catch((err) => {
            console.log('subject save err', err.message);
        });

    return res.send({status: true});
};

const getEasySearch = async (req, res) => {
    const {currentUser} = req;
    const search_text = req.body.search_text;
    const page = Number.parseInt(req.body.page);
    const limit = Number.parseInt(req.body.limit);
    // build condition
    const condition = {
        // user: currentUser.id,
    };
    if (search_text !== undefined && search_text.length > 0) {
        condition['$or'] = [
            {
                firstName: {
                    $regex: search_text + '.*',
                    $options: 'i'
                }
            }, {
                lastName: {
                    $regex: search_text + '.*',
                    $options: 'i'
                }
            }, {
                fullName: {
                    $regex: search_text + '.*',
                    $options: 'i'
                }
            }, {
                email: {
                    $regex: search_text + '.*',
                    $options: 'i'
                }
            }
        ];
    }
    const subjects = await Subject
        .find(condition)
        .sort({firstName: 1})
        .skip(page * limit)
        .limit(limit);
    return res.send({status: true, subjects});
};

const loadByQuery = async (req, res) => {
    const {currentUser} = req;
    const {searchText, isActive, page, limit} = req.body;
    /**
   * 1. Active
   * 2. Total Shipment
   * 3. Alphabetical A-Z
   */
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
                        fullName: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        email: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        company: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        fullAddr: {
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

    query.push({
        $lookup: {
            from: 'shipments',
            localField: '_id',
            foreignField: 'subject',
            as: 'shipments'
        }
    });
    query.push({
        $addFields: {
            totalShipments: {
                $size: '$shipments'
            }
        }
    });
    query.push({
        $project: {
            shipments: 0
        }
    });

    if (sort === 1) {
        // Alphabetical A-Z
        query.push({
            $sort: {
                firstName: 1,
                lastName: 1
            }
        });
    } else if (sort === 2) {
        // Total Shipment
        query.push({
            $sort: {
                totalShipments: -1,
                firstName: 1,
                lastName: 1
            }
        });
    }

    if (isActive) {
        query.push({$match: {
                isActive
            }});
    }
    // add id field
    query.push({
        $addFields: {
            id: '$_id'
        }
    });

    // get the total count
    query.push({$count: 'totalCount'});
    const response = await Subject
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

    const subjects = await Subject
        .aggregate(query)
        .exec();
    return res.send({status: true, subjects, totalCount});
};

const update = async (req, res) => {
    const {currentUser} = req;

    Subject
        .updateOne({
            _id: req.params.id,
            // user: currentUser.id,
        }, {
            $set: {
                ...req.body,
                fullName: req.body.firstName + ' ' + req.body.lastName
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
                    error: err.message || 'Subject Update Error'
                });
        });
};

const remove = (req, res) => {
    const {currentUser} = req;

    Subject
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
                    error: err.message || 'Subject Delete Error'
                });
        });
};

const score_load = async (req, res) => {
    const {currentUser} = req;
    const {searchText, isActive, page, limit} = req.body;

    // .log('page=>'+page+' limit=>'+limit+' isActive=>'+isActive+'
    // searchText=>'+searchText);

    const sort = Number.parseInt(req.body.sort);

    //console.log(' sort=>'+sort);
    const query = [];

    if (searchText) {
        // Active
        query.push({
            $match: {
                $or: [
                    {
                        studentname: {
                            $regex: searchText + '.*',
                            $options: 'i'
                        }
                    }, {
                        classes: {
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
        // console.log('sort == 1'); Alphabetical A-Z
        query.push({
            $sort: {
                studentname: 1
            }
        });
    } else if (sort === 2) {
        // console.log('sort == 2'); Alphabetical Z-A
        query.push({
            $sort: {
                studentname: -1
            }
        });
    } else if (sort === 3) {
        // console.log('sort == 3'); class
        query.push({
            $sort: {
                classes: 1
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

    const response = await Subject
        .aggregate(query)
        .exec();

    //console.log(response);
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

    const scores = await Subject
        .aggregate(query)
        .exec();
    //console.log(scores);

    return res.send({status: true, scores, totalCount});
};

const inputscore = async (req, res) => {
    const {currentUser} = req;

    const inputData = {
        ...req.body
    };
    let sum_score = 0;
    sum_score = inputData.maths + inputData.english + inputData.physics +
            inputData.chemistry + inputData.history + inputData.biology;
    let average_score = 0;
    average_score = sum_score / 6;
    average_score = average_score.toPrecision(3);

    //console.log('sum==>' + sum_score + ' average==>' + average_score);

    await Subject.findOneAndUpdate({
        studentname: inputData.studentname,
        classes: inputData.classes
    }, {
        sum: sum_score,
        average: average_score,
        ...inputData
    }, {
        upsert: false
    },);
    return res.send({status: true});
};

const getingraphic = async (req, res) => {
    //console.log('function exist!!!');
    const score = await Subject.find();
    //console.log('<<=======>>');
    //console.log(score);
    return res.send({score});
};

module.exports = {
    getscore,
    create,
    update,
    remove,
    loadByQuery,
    getEasySearch,
    score_load,
    inputscore,
    getingraphic
};
