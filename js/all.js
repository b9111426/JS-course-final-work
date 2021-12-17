const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect')
const cartList = document.querySelector('.shoppingCart-tableList');
const discardAllbBtn = document.querySelector('.discardAllBtn');
const orderInfoBtn = document.querySelector('.orderInfo-btn');
const form = document.querySelector('.orderInfo-form')
const inputs = document.querySelectorAll('input[type=text],input[type=email],input[type=tel]')
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");

let productData = [];
let cartData = [];

//預設渲染
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

    //判斷購物車是否為空
    if (cartData.length == 0) {
        alert("購物車為空的");
        return;
    }

    // validate表單驗證
    //驗證條件
    const constraints = {
        姓名: {
            presence: {
                message: "是必填欄位"
            },
        },
        電話: {
            presence: {
                message: "是必填欄位"
            }, length: {
                minimum: 10,
                maximum: 11,
                message: "長度不正確"
            }, format: {
                pattern: "[0-9-]+",
                message: "只能輸入數字"
            },
        },
        Email: {
            presence: {
                message: "是必填欄位"
            }, email: {
                message: "不是有效信箱"
            }
        },
        寄送地址: {
            presence: {
                message: "是必填欄位"
            },
        }, 交易方式: {
            presence: {
                message: "是必填欄位"
            },
        }
    };

    let errors = validate(form, constraints)

   //表單errors效果
    orderInputStatus(errors)


    if (errors) {
        Object.keys(errors).forEach(function (item) {
            //判斷是否有兩個錯誤以上
            if (errors[item].length > 1) {
                document.querySelector(`.${item}`).innerHTML = `<p class="messages ${item}">${errors[item].join("<br>")}</p>`
            } else {
                document.querySelector(`.${item}`).innerHTML = `<p class="messages ${item}">${errors[item]}</p>`
            }
        })
        return
    }

    // post資料
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, {
        "data": {
            "user": {
                "name": customerName.value,
                "tel": customerPhone.value,
                "email": customerEmail.value,
                "address": customerAddress.value,
                "payment": tradeWay.value
            }
        }
    })
        .then(function (response) {
            alert("訂單建立成功");
            document.querySelector(".orderInfo-form").reset();
            getCartList();
        })
})

//表單errors效果
function orderInputStatus(errors){
    inputs.forEach(function (item) {
        item.addEventListener("input", function () {
            item.nextElementSibling.textContent = "";
            item.classList.remove("formWarning")
        })
    })
    tradeWay.addEventListener("change", function () {
        tradeWay.nextElementSibling.textContent = "";
        tradeWay.classList.remove("formWarning")
    })
     //欄位紅框效果
        if(errors){
            errors['交易方式']&&tradeWay.classList.add("formWarning")
            errors['姓名']&&customerName.classList.add("formWarning")
            errors['電話']&&customerPhone.classList.add("formWarning")
            errors['Email']&&customerEmail.classList.add("formWarning")
            errors['寄送地址']&&customerAddress.classList.add("formWarning")
        }
}