var db=require("../config/connection")
var collection=require('../config/collections')
const objectId=require('mongodb').ObjectId/////to delete objid(prod id needed) to convert to obj id
module.exports={
    addProduct:(product,callback)=>{
        

        db.get().collection('product').insertOne(product).then((client)=>{
            
            callback(product._id)
            
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteproduct:(proId)=>{
       return new Promise((resolve,reject)=>{
        objid=objectId(proId)
        console.log(proId, objid)
        db.get().collection(collection.PRODUCT_COLLECTION).remove({_id:objid}).then((client)=>{
            resolve(client)
        })
       })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            objid=objectId(proId)
            console.log("////////")
            
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objid}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        console.log("//////////////////reach update pdt")
        return new Promise((resolve,reject)=>{
            objid=objectId(proId)
            console.log('////////')
            console.log(proDetails)
            
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objid},{
                $set:{
                    name:proDetails.name,
                    category:proDetails.category,
                    rate:proDetails.rate,
                    description:proDetails.description
                   
                }
                    
                    
            }).then((response)=>{
                resolve()
            })
        })
    }
}