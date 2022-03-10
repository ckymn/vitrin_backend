const Data = require("../model");
const Store = require("../../auth/model")
const ApiError = require("../../../../errors/ApiError")

const route = async (req, res, next) => {
    try {
        let { body , userData} = req;
        
        let _data = await Store.findOne({ _id: userData.id }).lean();
        if(!_data)
            return next(new ApiError("Store not found",404,_data))
        let data = await Data.create({
            ...body,
            location: {
                coordinates: [ parseFloat(_data.location.coordinates[0]),parseFloat(_data.location.coordinates[1]) ]
            },
            categories:body.categories,
            variants: body.variants,
            futures: body.futures,
            country: _data.storecountry,
            city: _data.storecity, 
            district: _data.storedistrict,
            language: _data.storelanguage,
            author: userData.id,
            phone: _data.phone
        });
        return res.status(200).send({ status: true, message: "Add Product worked",data})
    } catch (error) {
        console.log(error)
        if (error.name === "MongoError" && error.code === 11000) {
          return next(new ApiError(error?.message, 422));
        }
        if (error.code === 27) {
          return next(new ApiError("We Don't Have Any Data", 400, null));
        }
        return next(new ApiError(error?.message));
    }
}

module.exports = route