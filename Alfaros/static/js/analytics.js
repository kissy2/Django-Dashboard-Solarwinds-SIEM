Chart.defaults.global.responsive = false;
Chart.defaults.global.maintainAspectRatio = false;

function cool(id, title, type, data, label) {
    var ctx = document.getElementById(id).getContext('2d');
    var myChart = new Chart(ctx, {
        type: type,
        data: {
            labels: label,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: [
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                    'rgba(97, 172, 62, 0.5)',
                ],

                borderWidth: 1
            }]
        }
    });

}

function display_chart(js_data, length, id, title, type) {
    let chart_data = [],
        labels = [];
    for (let i = 0; i < length; ++i) chart_data[i] = 0;
    if (length == 24) {
        for (let i = 0; i < length; ++i) labels[i] = i + "h";
        for (let i in js_data) chart_data[parseInt(js_data[i]['fields']['date'].substr(11, 2))]++;
    } else if (length == 7) {
        labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        for (let i in js_data) chart_data[new Date(parseInt(js_data[i]['fields']['date'].substr(0, 4)), parseInt(js_data[i]['fields']['date'].substr(5, 2)) - 1, parseInt(js_data[i]['fields']['date'].substr(8, 2) - 1)).getDay()]++;
    } else if (length == 12) {
        labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        for (let i in js_data) chart_data[parseInt(js_data[i]['fields']['date'].substr(5, 2)) - 1]++;
    }
    cool(id, title, type, chart_data, labels);
}

function create(current = 1, index = 'in', long) {
    long = 10;
    node = document.getElementById("pager");
    node.innerHTML = "";
    document.getElementById("inner").innerHTML = "";
    var node1, node0, node2, js_data = JSON.parse(sessionStorage.getItem(index)),
        length = js_data.length;
    node0 = document.createElement("a");
    node0.setAttribute('id', 'first');
    node0.appendChild(document.createTextNode("«"));
    node.appendChild(node0);
    if ((current - 25) >= 1) {
        node3 = document.createElement("div");
        node3.setAttribute('class', 'dropdown1');
        node.appendChild(node3);
        node0 = document.createElement("A");
        node0.setAttribute('class', 'dropbtn');
        node0.appendChild(document.createTextNode("..."));
        node3.appendChild(node0);
        node2 = document.createElement("div");
        node2.setAttribute('class', 'dropdown-content0');
        node3.appendChild(node2);
        for (var i = current - 25; i <= current - 4; i++) {
            node0 = document.createElement("A");
            node0.appendChild(document.createTextNode(i));
            node0.setAttribute('onclick', "create(" + i + ",'" + index + "')");
            node2.appendChild(node0);
        }
    }
    node2 = document.createElement("div");
    node2.setAttribute('class', 'main');
    node.appendChild(node2);
    for (var i = current - 3; i <= current + 3; i++)
        if (i >= 1 && i <= Math.ceil(length / long)) {
            if (i == current) {
                node1 = document.createElement("A");
                node1.setAttribute('class', 'active');
                node1.setAttribute('onclick', "create(" + i + ",'" + index + "')");
                node1.appendChild(document.createTextNode(i));
                node2.appendChild(node1);
            } else {
                node1 = document.createElement("A");
                node1.setAttribute('onclick', "create(" + i + ",'" + index + "')");
                node1.appendChild(document.createTextNode(i));
                node2.appendChild(node1);
            }
        }
    if ((current + 25) <= Math.ceil(length / long)) {
        console.log("aaa");
        node3 = document.createElement("div");
        node3.setAttribute('class', 'dropdown0');
        node.appendChild(node3);
        node0 = document.createElement("A");
        node0.setAttribute('class', 'dropbtn');
        node0.appendChild(document.createTextNode("..."));
        node3.appendChild(node0);
        node2 = document.createElement("div");
        node2.setAttribute('class', 'dropdown-content1');
        node3.appendChild(node2);

        for (var i = current + 4; i <= current + 25; i++) {
            node0 = document.createElement("A");
            node0.appendChild(document.createTextNode(i));
            node0.setAttribute('onclick', "create(" + i + ",'" + index + "')");
            node2.appendChild(node0);
        }
    }
    node0 = document.createElement("a")
    node0.setAttribute('id', 'last');
    node0.appendChild(document.createTextNode("»"));
    node.appendChild(node0);
    var node = document.getElementById("inner"),
        node0, node1, count, i = (current - 1) * long;;
    if (current * long < js_data.length) count = current * long;
    else count = length;
    let input = "";
    for (i; i < count; i++) {
        node0 = document.createElement("TR");
        node0.setAttribute('id', js_data[i].pk);
        node.appendChild(node0);
        node1 = document.createElement("TD");
        node0.appendChild(node1);
        node1.appendChild(document.createTextNode(js_data[i].fields['date']));
        for (let j in js_data[i].fields) input += j + " : " + js_data[i].fields[j] + "  ,  ";
        input = input.substr(0, input.length - 5);
        node1 = document.createElement("TD");
        node0.appendChild(node1);
        node1.appendChild(document.createTextNode(input));
        input = "";
    }
    if (length != 0) document.getElementById("showing").innerHTML = "Showing " + ((current - 1) * long + 1) + " to " + count + " of " + length + " Events";
}

function compare(a, b, order) {
    if (order == 'pk') {
        if (b.pk > a.pk)
            return 1;
        else if (b.pk < a.pk)
            return -1;
        else return 0;
    } else {
        if (b.fields[order] > a.fields[order])
            return 1;
        else if (b.fields[order] < a.fields[order])
            return -1;
        else return 0;
    }
}

function ordering(order = 'severity') {
    var js_data, search_or_in = true;
    if (sessionStorage.getItem("search_js_data")) {
        js_data = JSON.parse(sessionStorage.getItem("search_js_data"));
        search_or_in = false;
    } else {
        js_data = JSON.parse(sessionStorage.getItem("in"));
    }
    if (order[0] == '-') {
        order = order.slice(1);
        js_data = js_data.sort(function(a, b) {
            return compare(a, b, order)
        })
    } else
        js_data = js_data.sort(function(a, b) {
            return compare(b, a, order)
        });
    if (search_or_in) {
        sessionStorage.setItem("in", JSON.stringify(js_data));
        create();
    } else {
        sessionStorage.setItem("search_js_data", JSON.stringify(js_data));
        create(1, 'search_js_data');
    }
};


function updown(order, elem) {
    let field = ['pk', 'threat', 'severity', 'date', 'attacker', 'target'];
    order = field[order], all = document.getElementsByTagName("th");
    for (var i = 0; i < all.length; i++) {
        if (all[i] != elem) {
            all[i].value = false;
            all[i].children[0].children[0].className = "order_up";
            all[i].children[0].children[1].className = "order_down";
        }
    }
    if (!elem.value) {
        elem.children[0].children[1].className = "order_down";
        elem.children[0].children[0].className = "active_order_up";
        elem.value = true;
        ordering(order);
    } else {
        elem.children[0].children[0].className = "order_up";
        elem.children[0].children[1].className = "active_order_down";
        elem.value = false;
        ordering('-' + order);
    }
}



function schedule(self) {
    const node = self.parentElement;
    if (self.value == "Custom Date") {
        let temp = document.createElement("input");
        temp.setAttribute("type", "number");
        temp.setAttribute("autocomplete", "off");
        temp.setAttribute("placeholder", "Days");
        temp.setAttribute("class", "title");
        temp.setAttribute("style", "margin-left:5px;width:50px");
        node.setAttribute("style", "margin-left:60px");
        node.appendChild(temp);
        temp.focus()
    } else if (node.children.length > 1) {
        node.removeChild(node.children[2]);
        node.removeAttribute("style");
    }
}

function saver() {
    const self = document.getElementsByClassName("modal_content")[0],
        val0 = self.children[0].children[1].value.trim(),
        len = self.children[1].children,
        val1 = len.length == 2 ? len[1].value : len[2].value,
        val2 = self.children[2].children[1].value;
    if (val0 === "") {
        self.children[0].children[1].style.boxShadow = "0 0 0 3px red";
        self.children[0].children[1].focus();
        if (len.length == 3) len[2].style.removeProperty('box-shadow');
    } else if (val1 === "" || (len.length == 3 && (len[2].value.indexOf(".") != -1 || len[2].value.indexOf("-") != -1))) {
        len[2].style.boxShadow = "0 0 0 3px red";
        len[2].focus();
        self.children[0].children[1].style.removeProperty('box-shadow');
    } else {
        self.children[0].children[1].style.removeProperty('box-shadow');
        if (len.length == 3) len[2].style.removeProperty('box-shadow');
        r = new XMLHttpRequest();
        r.open("POST", "/report_handler/", true);
        r.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        r.setRequestHeader("X-CSRFToken", document.getElementsByTagName("input")[0].value);
        r.send(`name=${val0}&schedule=${val1}&format=${val2}`);
        document.getElementsByClassName("close")[0].click();
    }
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementsByClassName("pop_modal_box")[0].addEventListener("click", () => {
        var modal = document.getElementsByClassName('modal')[0];
        modal.style.background = 'rgba(0,0,0,.5)';
        modal.className += ' modal_active';
        modal.children[0].style.transform = 'scale(1,1)'
    });
    var order_objects = document.getElementsByTagName("tr")[0].children;
    for (let i = 0; i < order_objects.length; i++) order_objects[i].addEventListener("click", () => {
        updown(this.cellIndex, this);
    });
    document.getElementsByClassName("sexy_btn")[0].addEventListener("click", () => {
        const modal = document.getElementsByClassName("modal")[0];
        modal.className = "modal";
        modal.children[0].style.transform = 'scale(0,1)'
    });
    document.getElementsByClassName("close")[0].addEventListener("click", () => {
        const modal = document.getElementsByClassName("modal")[0];
        modal.className = "modal";
        modal.children[0].style.transform = 'scale(0,1)'
    });
    document.getElementsByClassName("greport_select")[0].addEventListener("change", e => {
        schedule(e.srcElement)
    })
    document.getElementsByClassName("sexy_btn")[1].addEventListener("click", e => {
        saver()
    })
})