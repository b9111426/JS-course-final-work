const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect')
let productData = [];
let cartData = [];
function init(){
    getProductList();
    getCartList();
}
init();

function getProductList(){
        axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
        )
        .then(function (response) {
            productData = response.data.products;
            renderProduct()
        })
        .catch(function (error) {
            console.log(error);
        })
    };
function combineProductHTMLItem(item){
    return `<li class="productCard">
    <h4 class="productType">${item.category}</h4>
    <img src=${item.images} alt="">
    <a href="#" class="addCardBtn" data-id="${item.id} ">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${item.origin_price}</del>
    <p class="nowPrice">NT$${item.price}</p>
    </li>`
}
function renderProduct(){
    let str = "";
    productData.forEach((item)=>{
        str+= combineProductHTMLItem(item)
    })
    productList.innerHTML = str;
};

productSelect.addEventListener('change',function(e){
    const category = e.target.value
    if(category == "全部"){
        getProductList();
        return;
    }
    let str = "";
    productData.forEach(function(item){
        if(item.category == category){
            str+= combineProductHTMLItem(item);
        }
        productList.innerHTML = str;
    })
})

productList.addEventListener("click",function(e){
    e.preventDefault();
    console.log(e.target.getAttribute("data-id"));
    let  addCartClass = e.target.getAttribute("class");
    if(addCartClass!=="addCardBtn"){
        return;
    }
    let productId = e.target.getAttribute("data-id");
    console.log(productId)
})
function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
        cartData = response.data.carts;
        let str = "";
        cartData.forEach(function(item){
            str+=`<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>NT${item.product.price*item.quantity}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons">
                    clear
                </a>
            </td>
        </tr>`
        });
        const cartList = document.querySelector('.shoppingCart-tableList');
        cartList.innerHTML = str;
    })
}

// if(response.data.carts==0){
//     str=`<tr>
//     <td colspan="5">
//     <span class="material-icons empty-icon">production_quantity_limits</span>
//     </td>
// </tr>`
// }
