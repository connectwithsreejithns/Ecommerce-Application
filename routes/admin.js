var express = require('express');
const app = require('../app');
var router = express.Router();




/////b
var multer  = require('multer');
const productHelpers = require('../helpers/product-helpers');//get access so to add in post D)
 
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads/')
    },
    filename: function (req, file, cb) {
      
      cb(null,file.originalname)
    }
  })
 
  const fileFilter=(req, file, cb)=>{
   if(file.mimetype ==='image/jpeg' || file.mimetype ==='image/jpg' || file.mimetype ==='image/png'){
       cb(null,true);
   }else{
       cb(null, false);
   }
 
  }
 
var upload = multer({ 
    storage:storage,
    limits:{
        fileSize: 1024 * 1024 * 5
    },
    fileFilter:fileFilter
 });
//  ////b



/* GET users listing. */

router.get('/', function(req, res, next) {

  
     productHelpers.getAllProducts().then((products)=>{
      res.render("admin/view-products",{admin:true,products})
     })


  
 
});
router.get('/add-products',(req,res)=>{
  res.render("admin/add-products",{admin:true})
})
///b part form app.js check post meth
router.post("/add-products",upload.single('image'),function(req,res,next){
 //extra upload ))b  
 
  // console.log(req.body)
  // console.log(req.file)
  
  
  productHelpers.addProduct(req.body,(id)=>{////id is result
    
  
  })
    res.render("admin/add-products",{admin:true})
  })///part of D


  // const filename=req.file.filename;
  //  res.json({
  //             message:"Image Uploaded Successfully",
  //             filename:filename
  //         });
      

 

 
///
router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  productHelpers.deleteproduct(proId).then((response)=>{
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id',async(req,res)=>{
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product)
  res.render('admin/edit-product',{admin:true,product})
})

router.post('/edit-product/:id',(req,res)=>{
  let id=req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.image){
      let image=req.files.image
      image.mv('./public/product-images/'+id+'jpg',(err)=>{
        // if(!err){
        //   res.render("admin/add-product")
        // }else{
        //   console.log(err)
        // }
      })
    }
  })
})







module.exports = router;
