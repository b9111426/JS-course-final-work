let orderData = [];
const orderList = document.querySelector(".js-orderList")
function init() {
    getOrdList();
};
init()
function getOrdList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function (response) {
            orderData = response.data.orders;
            let str = ""
            orderData.forEach(function (item) {
            //組訂單字串
            let productStr = ""
            item.products.forEach(function(productItem){
                productStr +=`<p>${productItem.title}x${productItem.quantity}</p>`
            })
            //判斷訂單處理狀態
            let orderStatus ="";
            if(item.paid=="ture"){
                orderStatus="已處裡"
            }else{
                orderStatus="未處裡"
            }
            //組產品字串
                str += `<tr>
            <td class="orderNum">${item.id}</td>
            <td>
              <p>${item.user.name}</p>
              <p>0${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                ${productStr}
            </td>
            <td>${item.createdAt}</td>
            <td  js-orderStaus">
              <a href="#" class="orderStatus" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
            </td>
            </tr>`
            })
            orderList.innerHTML = str
        })

}

orderList.addEventListener('click',function(e){
    e.preventDefault();
    const tagetClass = e.target.getAttribute("class");
    console.log(tagetClass)
})