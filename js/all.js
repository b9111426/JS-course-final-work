const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect')
const cartList = document.querySelector('.shoppingCart-tableList');
let productData = [];
let cartData = [];
function init() {
    getProductList();
    getCartList();
}
init();

function getProductList() {
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
function combineProductHTMLItem(item) {
    return `<li class="productCard">
    <h4 class="productType">${item.category}</h4>
    <img src=${item.images} alt="">
    <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${item.origin_price}</del>
    <p class="nowPrice">NT$${item.price}</p>
    </li>`
}
function renderProduct() {
    let str = "";
    productData.forEach((item) => {
        str += combineProductHTMLItem(item)
    })
    productList.innerHTML = str;
};
//產品下拉選單
productSelect.addEventListener('change', function (e) {
    const category = e.target.value
    if (category == "全部") {
        getProductList();
        return;
    }
    let str = "";
    productData.forEach(function (item) {
        if (item.category == category) {
            str += combineProductHTMLItem(item);
        }
        productList.innerHTML = str;
    })
})
//點擊產品
productList.addEventListener("click", function (e) {
    e.preventDefault();
    let addCartClass = e.target.getAttribute("class");
    if (addCartClass !== "addCardBtn") {
        return;
    }
    let productId = e.target.getAttribute("data-id");
    let numCheck = 1;

    cartData.forEach(function (item) {
        if (item.product.id === productId) {
            numCheck = item.quantity += 1;
        };
    });

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
        "data": {
            "productId": productId,
            "quantity": numCheck
        }
    }).then(function (response) {
        getCartList();
    })
});
//渲染購物車
function getCartList() {


    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
        .then(function (response) {
            cartData = response.data.carts;
            let str = "";
            if (response.data.carts == 0) {
                str = `<tr>
                    <td colspan="5">
                                <span class="material-icons empty-icon">production_quantity_limits</span>
                            </td>
                    </tr>`
            };
            cartData.forEach(function (item) {
                str += `<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>NT${item.product.price * item.quantity}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${item.id}">
                    clear
                </a>
            </td>
        </tr>`
            });
            cartList.innerHTML = str;
        })
}
//刪除購物車
cartList.addEventListener('click', function (e) {
    e.preventDefault();
    const cartId = e.target.getAttribute("data-id");
    if (cartId == null) {
        return;
    }

    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
        .then(function (reponse) {
            getCartList();
        })
})
//刪除全部購物車
const discardAllbBtn = document.querySelector(".discardAllBtn");

discardAllbBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (reponse) {
        getCartList();
    })
})












