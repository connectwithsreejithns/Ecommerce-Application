var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");

const userHelpers = require("../helpers/user-helpers");
const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {//.usr 30
    next();
  } else {
    res.redirect("/login");
  }
};
/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }

  productHelpers.getAllProducts().then((products) => {
    res.render("users/view-products", {
      admin: false,
      products,
      user,
      cartCount,
    });
  });
});

//login

router.get("/login", function (req, res, next) {
  if (req.session.user) {//if (req.session.user.loggedIn)
    
    res.redirect("/");
  } else {
    
    res.render("users/login", { admin: false, loginErr: req.session.userloginErr });
    req.session.userloginErr = false;
  }
});
router.post("/login", function (req, res, next) {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      /////////////session
      req.session.user = response.user; 
      req.session.user.loggedIn = true;///(.user)added at final 30)
     

      res.redirect("/");
    } else {
      req.session.userloginErr = "Invalid Username or Password";
      res.redirect("/login");
    }
  });
});
///
router.get("/logout", function (req, res, next) {
 req.session.user=null// req.session.destroy();
 req.session.userLoggedIn=false

  res.redirect("/");
});

//signup
router.get("/signup", function (req, res, next) {
  res.render("users/signup", { admin: false });
});

router.post("/signup", function (req, res, next) {
  userHelpers.doSignup(req.body).then((response) => {
    req.session.user = response;
    req.session.user.loggedIn = true;//. user at 30
   
    res.redirect("/");
  });
});

//cart
router.get("/cart", async function (req, res) {
  console.log("////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////reached")
  let products = await userHelpers.getCartProducts(req.session.user._id);
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)

  res.render("users/cart", { admin: false, products, 'user': req.session.user._id,totalValue});
});

router.get("/add-to-cart/:id", (req, res) => {
  //verifylogin didnt work bcoz of ajax call
console.log('3333333333333333333333333333333333333')
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});
router.post("/change-product-quantity", (req, res, next) => {

  userHelpers.changeProductQuantity(req.body).then(async(response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user)

    res.json(response)
  })
})

router.get("/place-order", async function (req, res) {
  let total = await userHelpers.getTotalAmount(req.session.user._id)


  res.render("users/place-order",{total,user:req.session.user});
});
router.post('/place-order',async (req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
    res.json({status:true})
  })
  console.log(req.body )
})



module.exports = router;
