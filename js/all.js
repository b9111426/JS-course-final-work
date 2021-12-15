const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect')
const cartList = document.querySelector('.shoppingCart-tableList');
const discardAllbBtn = document.querySelector(".discardAllBtn");
const orderInfoBtn = document.querySelector(".orderInfo-btn");
let productData = [];
let cartData = [];
function init() {
    getProductList();
    getCartList();
}
init();
//渲染產品列表
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
    <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThousands(item.price)}</p>
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
            document.querySelector(".js-total").textContent = response.data.finalTotal;
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
            <td>NT$${toThousands(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${toThousands(item.product.price * item.quantity)}</td>
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
discardAllbBtn.addEventListener("click", function (e) {
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then(function (reponse) {
            getCartList();
        })
        .catch(function (response) {
            alert("購物車已清空")
        })
})
//送出訂單

orderInfoBtn.addEventListener("click", function (e) {
    e.preventDefault();
    if (cartData.length == 0) {
        alert("購物車為空的");
        return;
    }
    const customerName = document.querySelector("#customerName").value;
    const customerPhone = document.querySelector("#customerPhone").value;
    const customerEmail = document.querySelector("#customerEmail").value;
    const customerAddress = document.querySelector("#customerAddress").value;
    const tradeWay = document.querySelector("#tradeWay").value;
    if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || tradeWay == "") {
        alert("請輸入訂單資訊");
        return;
    }

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, {
        "data": {
            "user": {
                "name": customerName,
                "tel": customerPhone,
                "email": customerEmail,
                "address": customerAddress,
                "payment": tradeWay
            }
        }
    })
        .then(function (response) {
            alert("訂單建立成功");
            document.querySelector(".orderInfo-form").reset();
            getCartList();
        })

})





