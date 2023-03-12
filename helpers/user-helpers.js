var db = require("../config/connection")
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { ObjectID, ObjectId } = require("bson")
const { response } = require("../app")
const objectId = require('mongodb').ObjectId///// obj) to convert to obj id

module.exports = {
    doSignup: (userdata) => {

        return new Promise(async function (resolve, reject) {
            var hash = await bcrypt.hash(userdata.password, 10)
            userdata.password = hash
            db.get().collection(collection.USER_COLLECTION).insertOne(userdata).then((client) => {




                resolve(userdata)
            })
        })


    },
    doLogin: (userdata) => {

        return new Promise(async function (resolve, reject) {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userdata.email })
            if (user) {
                bcrypt.compare(userdata.password, user.password).then((status) => {
                    if (status) {
                        console.log("success")
                        response.user = user
                        response.status = true
                        resolve(response)
                    }
                    else {
                        console.log("failed")
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("failed")
                resolve({ status: false })
            }
        })


    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            objid = objectId(userId)


            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objid })


            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }//since it is asrray take each quantity use$
                            }

                        ).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objid },
                            {

                                // $push:{products:objectId(proId)}
                                $push: { products: proObj }

                            }
                        ).then((response) => {
                            resolve()
                        })

                }

            }
            else {
                let cartObj = {
                    user: objectId(userId),
                    //products:[objectId(proId)] no quantity here
                    products: [proObj]

                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }

                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {

                        item: '$products.item',
                        quantity: '$products.quantity'
                    }//unwind and project is used to make seperate object and use lookup now
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    ///convert project array to object to use in cartr quan + -
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] } //0 r 1 to wanted

                    }
                }

                // {
                //     $lookup: {
                //         from: collection.PRODUCT_COLLECTION,
                //         let: { prodList: '$products' },
                //         pipeline: [
                //             {
                //                 $match: {
                //                     $expr: {
                //                         $in: ['$_id', "$$prodList"]
                //                     }
                //                 }
                //             }
                //         ],
                //         as: 'cartItems'
                //     }
                // }
            ]).toArray()


            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {


        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count === -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }//since it is asrray take each quantity use$
                        }

                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }//since it is asrray take each quantity use$
                        }

                    ).then((response) => {
                        resolve({status:true})
                    })
            }

        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }

                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {

                        item: '$products.item',
                        quantity: '$products.quantity'
                    }//unwind and project is used to make seperate object and use lookup now
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    ///convert project array to object to use in cartr quan + -
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] } //0 r 1 to wanted

                    }
                }
                ,
                {
                    $group: {
                        _id:null,
                        total: { $sum: { $multiply: ['$quantity',{$toInt: '$product.rate'} ] } }
                    }
                }


            ]).toArray()
           // console.log('//////////////', total[0].total)

            resolve(total[0].total)
        })
    },
    placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            console.log(order,products,total)
            let status=order['payment-method']==='COD'?'placed':'pending'
            let orderObj={
                deliveryDetails:{
                    mobile:order.mobile,
                    address:order.address,
                    pincode:order.pincode
                    
                },
                userId:objectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                totalAmount:total,
                status:status,
                date:new Date()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
                resolve()
            })
        }) 

    },
     getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            resolve(cart.products)
        })
    }

}  