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
                //組時間字串
                const timeStemp = new Date(item.createdAt * 1000)
                const orderTime = `${timeStemp.getFullYear()}/${timeStemp.getMonth() + 1}/${timeStemp.getDate()}`
                //組訂單字串
                let productStr = ""
                item.products.forEach(function (productItem) {
                    if (productItem)
                        productStr += `<p>${productItem.title}x${productItem.quantity}</p>`
                })
                //判斷訂單處理狀態
                let orderStatus = "";
                if (item.paid == true) {
                    orderStatus = "已處裡"
                } else {
                    orderStatus = "未處裡"
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
            <td>${orderTime}</td>
            <td  js-orderStaus">
              <a href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}" >${orderStatus}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
            </td>
            </tr>`
            })

            orderList.innerHTML = str
            renderC3();
        })
}

function renderC3() {
    //物件資料收集
    let total = {};
    let chartData = [];
    orderData.forEach(function (item) {
        item.products.forEach(function (productItem) {
            if (total[productItem.title] == undefined) {
                total[productItem.title] = productItem.price * productItem.quantity;
            } else {
                total[productItem.title] += productItem.price * productItem.quantity;
            }
        })
    })
    let ary = Object.keys(total)
    ary.forEach(function (item) {
        let newAry = [];
        newAry.push(item)
        newAry.push(total[item])
        chartData.push(newAry)
    })
    chartData.sort(function(a,b){
        return b[1]-a[1]
    })

    if(chartData.length>3){
        let otherTotal = 0;
        chartData.forEach(function(item,index){
            if(index>2){
                otherTotal += chartData[index][1];
            }
        })
        chartData.splice(3)
        chartData.push(['其他',otherTotal])
    }

    // C3.js
    let chart = c3.generate({
        bindto: '#chart',
        data: {
            type: "pie",
            columns: chartData,
        }, color: {
            pattern: ['#F2E26D', '#FCB172', '#E67497', '#A372FC']
        },
    });
}


orderList.addEventListener('click', function (e) {
    e.preventDefault();
    const tagetClass = e.target.getAttribute("class");
    let id = e.target.getAttribute("data-id");
    if (tagetClass == "delSingleOrder-Btn js-orderDelete") {
        deletOrderItem(id)
        return
    }
    if (tagetClass == "orderStatus") {
        let status = e.target.getAttribute("data-status");
        changeOrderStatus(status, id)
        return;
    }
})

function changeOrderStatus(status, id) {
    let newStatus;
    if (status === "true") {
        newStatus = false;
    } else {
        newStatus = true
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        "data": {
            "id": id,
            "paid": newStatus
        }
    }, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function (response) {
            getOrdList();
        })
}
function deletOrderItem(id) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function (response) {
            getOrdList();
        })
}