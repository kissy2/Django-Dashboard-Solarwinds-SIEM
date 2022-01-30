var db = null;

document.addEventListener("DOMContentLoaded", function() {
    var source;
    const request = indexedDB.open("local");
    request.onupgradeneeded = e => {
        db = e.target.result;
        var in_dt = db.createObjectStore("in", {
            keyPath: "pk"
        });
        in_dt.createIndex("rule_name", "rule_name");
        in_dt.createIndex("date", "date");
        in_dt.createIndex("severity", "severity");
        in_dt.createIndex("source", "source");
        in_dt.createIndex("destination", "destination");
        in_dt.createIndex("manager", "manager");
        in_dt.createIndex("status", "status");

        in_dt = db.createObjectStore("report", {
            keyPath: "pk"
        });
        in_dt.createIndex("report_name", "report_name");
        in_dt.createIndex("type", "type");
        in_dt.createIndex("schedule", "schedule");
        in_dt.createIndex("creation_date", "creation_date");
        in_dt.createIndex("next_run_time", "next_run_time");
        in_dt.createIndex("owner", "owner");
        in_dt.createIndex("view", "view");

        in_dt = db.createObjectStore("greport", {
            keyPath: "pk"
        });
        in_dt.createIndex("report_name", "report_name");
        in_dt.createIndex("schedule", "schedule");
        in_dt.createIndex("creation_date", "creation_date");
        in_dt.createIndex("next_run_time", "next_run_time");
        in_dt.createIndex("owner", "owner");
        in_dt.createIndex("view", "view");

        in_dt = db.createObjectStore("timerule", {
            keyPath: "rule_name"
        });
        in_dt.createIndex("time", "time");
        in_dt.createIndex("autoincr", "autoincr");
        in_dt.createIndex("severity", "severity");
        in_dt.createIndex("status", "status");


    }
    request.onsuccess = e => {
        db = e.target.result;
        r = new XMLHttpRequest();
        r.open("GET", "/api/report?lstm=100&id=reload", true);
        r.send();
        r.onreadystatechange = (e) => {
            if (e.currentTarget.readyState == 4 && e.currentTarget.status == 200) {
                const data = JSON.parse(e.currentTarget.responseText),
                    transaction = db.transaction("report", "readwrite");
                transaction.objectStore('report').clear();
                for (i in data) {
                    obj = {
                        'pk': data[i].pk
                    };
                    for (j in data[i].fields) {
                        if (j == "schedule") !isNaN(data[i].fields[j]) ? obj[j] = data[i].fields[j] + " Days" : obj[j] = data[i].fields[j];
                        else obj[j] = data[i].fields[j];
                    }
                    transaction.objectStore('report').add(obj);
                }
                paginator(1, 10, data.length, 'report');
                if (data.length === 0) {
                    current = 0;
                    length = 0;
                    count = 0;
                    long = 1
                } else {
                    current = 1;
                    length = data.length;
                    length < 10 ? count = length : count = 10;
                    long = 10
                }
                document.getElementById("showing1").innerHTML = "Showing " + ((current - 1) * long + 1) + " to " + count + " of " + length + " Report";
            }
            sessionStorage.setItem("target1", "in");
        }
    }
    document.getElementsByTagName("button")[0].addEventListener("click", () => {
        r = new XMLHttpRequest();
        r.open("GET", "/greport", true);
        r.send();
        r.onreadystatechange = (e) => {
            if (e.currentTarget.readyState == 4 && e.currentTarget.status == 200) {
                const data = JSON.parse(e.currentTarget.responseText),
                    transaction = db.transaction("greport", "readwrite");
                transaction.objectStore('greport').clear();
                for (i in data) {
                    obj = {
                        'pk': data[i].pk
                    };
                    for (j in data[i].fields) obj[j] = data[i].fields[j];
                    transaction.objectStore('greport').add(obj);
                }
                sessionStorage.setItem("target0", "in");
                create(1, "greport");
                document.getElementById("zombrani").style.display = "block"
            }
        }
    })
    var order_objects = document.getElementsByTagName("th");
    for (let i = 0; i < order_objects.length; i++) order_objects[i].addEventListener("click", (e) => {
        updown(e.srcElement);
    });
    document.getElementsByTagName("select")[0].addEventListener("change", () => {
        create(1, 'greport');
    }, {
        passive: true
    });
    document.getElementsByTagName("select")[3].addEventListener("change", () => {
        create(1, 'report');
    }, {
        passive: true
    });
    document.getElementById("search0").addEventListener("keyup", (e) => {
        if (e.which === 8 && e.srcElement.value.trim().length == 0) {
            sessionStorage.setItem("target0", "in");
            create(1, "greport")
        } else {
            sessionStorage.setItem("target0", "search");
            create(1, "greport")
        }
    });
    document.getElementById("search1").addEventListener("keyup", (e) => {
        if (e.which === 8 && e.srcElement.value.trim().length == 0) {
            sessionStorage.setItem("target1", "in");
            create(1, "report")
        } else {
            sessionStorage.setItem("target1", "search");
            create(1, "report")
        }
    });
    const inter = document.getElementsByTagName("select");
    inter[inter.length - 3].addEventListener("change", e => {
        db.transaction("report", "readonly").objectStore("report").openCursor(null, "next").onsuccess = a => {
            key = a.target.result.key;
            r = new XMLHttpRequest();
            r.open("GET", `/api/report?lstm=${e.srcElement.value.toLowerCase()}&id=${key}`, true);
            r.send();
            r.onreadystatechange = (e) => {
                if (e.currentTarget.readyState == 4 && e.currentTarget.status == 200) {
                    const data = JSON.parse(e.currentTarget.responseText),
                        transaction = db.transaction("report", "readwrite");
                    let obj = {};
                    for (i in data) {
                        obj = {
                            'pk': data[i].pk
                        };
                        for (j in data[i].fields) {
                            if (j == "schedule") !isNaN(data[i].fields[j]) ? obj[j] = data[i].fields[j] + " Days" : obj[j] = data[i].fields[j];
                            else obj[j] = data[i].fields[j];
                        }
                        transaction.objectStore('report').add(obj);
                    }
                    create(1, "report")
                }
            }
        }
    })
    document.getElementsByClassName("tmclose")[0].addEventListener("click", () => {
        document.getElementById("zombrani").style.display = "none"
    })
    document.getElementsByClassName("delete")[0].addEventListener("click", () => {
        let arr = "",
            all = document.querySelectorAll(".sharp:checked");
        if (all.length != 0) {
            for (let i = 0; i < all.length; i++) arr += all[i].value + ",";
            arr = arr.substr(0, arr.length - 1);
            r = new XMLHttpRequest();
            r.open("POST", "/greport/", true);
            r.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            r.setRequestHeader("X-CSRFToken", document.getElementsByTagName("input")[0].value);
            r.send(`action=del&arr=${arr}`);
            arr = arr.split(",");
            const tr = db.transaction("greport", "readwrite").objectStore("greport");
            for (let i = 0; i < arr.length; i++) tr.delete(parseInt(arr[i]));
            create(parseInt(document.getElementsByClassName("active")[1].textContent), "greport")
        }
    })
})




function create(current = 1, store = "report") {
    let index, long, key, direction, s_field = null,
        inter;
    if (store == "greport") {
        index = sessionStorage.getItem("target0");
        long = parseInt(document.getElementsByTagName("select")[0].value);
        key = document.getElementsByClassName("active_order_down")[0] ? document.getElementsByClassName("active_order_down")[0].parentElement.parentElement.children[0].parentElement.getAttribute("deval") : document.getElementsByClassName("active_order_up")[0].parentElement.parentElement.children[0].parentElement.getAttribute("deval");
        direction = document.getElementsByClassName("active_order_down")[0] ? "prev" : "next";
    } else {
        index = sessionStorage.getItem("target1");
        inter = document.getElementsByTagName("select");
        long = parseInt(inter[inter.length - 1].value);
        direction = document.getElementsByClassName("active_order_down1")[0] ? "prev" : "next";
        key = document.getElementsByClassName("active_order_down1")[0] ? document.getElementsByClassName("active_order_down1")[0].parentElement.parentElement.children[0].parentElement.getAttribute("deval") : document.getElementsByClassName("active_order_up1")[0].parentElement.parentElement.children[0].parentElement.getAttribute("deval");
        if (index == "search") s_field = inter[inter.length - 2].value.toLowerCase().replace(/ /g, "_");
    }
    if (index == "in") {
        db.transaction(store, "readonly").objectStore(store).count().onsuccess = e => {
            length = e.target.result;
            paginator(current, long, length, store);
            draw_array(current, long, length, key, direction, true, null, null, store)
        }
    } else {
        let ss = "search",
            tar = "target",
            args = ['report_name', 'type', 'schedule', 'creation_date', 'next_run_time', 'owner', 'view'];
        if (store == "greport") {
            ss += "0";
            tar += "0";
            args.splice(1, 1);
        } else {
            ss += "1";
            tar += "1"
        }
        const input = document.getElementById(ss).value.toUpperCase().trim();
        if (input.length != 0) {
            sessionStorage.setItem(tar, "search");
            draw_array(current, long, 0, key, direction, false, args, input, store, s_field)
        } else {
            sessionStorage.setItem(tar, "in");
            create(1, store);
        }
    }
}


function updown(elem) {
    const all = elem.parentElement.children;
    let i = 1,
        l = all.length - 1,
        uc = "order_up",
        dc = "order_down",
        tar = "greport";
    if (all.length == 7) {
        tar = "report";
        uc += 1;
        dc += 1;
        i = 0;
        l += 1
    };
    for (i; i < l; i++) {
        if (all[i] != elem) {
            all[i].value = false;
            all[i].children[0].children[0].className = uc;
            all[i].children[0].children[1].className = dc;
        }
    }
    if (!elem.value) {
        elem.children[0].children[1].className = dc;
        elem.children[0].children[0].className = "active_" + uc;
        elem.value = true;
    } else {
        elem.children[0].children[0].className = uc;
        elem.children[0].children[1].className = "active_" + dc;
        elem.value = false;
    }
    create(1, tar);
}

function paginator(current, long, length, store) {
    node = document.getElementById(store == "greport" ? "pager0" : "pager1");
    node.innerHTML = "";
    var node1, node0, node2;
    node0 = document.createElement("a")
    node0.setAttribute('class', 'first');
    node0.setAttribute('onclick', `create(1,"${store}")`);
    node0.appendChild(document.createTextNode("«"));
    node.appendChild(node0);
    if ((current - 13) >= 1) {
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
        for (var i = current - 13; i <= current - 4; i++) {
            node0 = document.createElement("A");
            node0.appendChild(document.createTextNode(i));
            node0.setAttribute('onclick', `create(${i},"${store}")`);
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
                node1.setAttribute('onclick', `create(${i},"${store}")`);
                node1.appendChild(document.createTextNode(i));
                node2.appendChild(node1);
            } else {
                node1 = document.createElement("A");
                node1.setAttribute('onclick', `create(${i},"${store}")`);
                node1.appendChild(document.createTextNode(i));
                node2.appendChild(node1);
            }
        }
    if ((current + 13) <= Math.ceil(length / long)) {
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

        for (var i = current + 4; i <= current + 13; i++) {
            node0 = document.createElement("A");
            node0.appendChild(document.createTextNode(i));
            node0.setAttribute('onclick', `create(${i},"${store}")`);
            node2.appendChild(node0);
        }
    }
    node0 = document.createElement("a")
    node0.setAttribute('class', 'last');
    node0.setAttribute('onclick', `create(${Math.ceil(length/long)},"${store}")`);
    node0.appendChild(document.createTextNode("»"));
    node.appendChild(node0);
}


function draw_array(current, long, length, key, direction, spec = true, field, input, store, s_field) {
    let i = (current - 1) * long,
        array = [],
        iter = 0,
        count = current * long < length ? current * long : length;
    db.transaction(store, "readonly").objectStore(store).index(key).openCursor(null, direction).onsuccess = e => {
        let cursor = e.target.result;
        if (spec) {
            if (cursor && iter < count) {
                if (iter >= i) {
                    array.push(cursor.value)
                }
                iter++;
                cursor.continue()
            } else {
                search_or_in(array, current, long, length, count, store)
            }
        } else {
            if (cursor) {
                if (store == "report") {
                    if (cursor.value[s_field].toUpperCase().includes(input)) array.push(cursor.value);
                } else {
                    for (let j in field) {
                        if (cursor.value[field[j]] !== null && (String(cursor.value[field[j]])).toUpperCase().includes(input.toUpperCase())) {
                            array.push(cursor.value);
                            break;
                        }
                    }
                }
                cursor.continue();
            } else {
                length = array.length;
                current * long < length ? count = current * long : count = length;
                paginator(current, long, length, store);
                search_or_in(array.slice(i, i + long), current, long, length, count, store)
            }
        }
    }
}



function search_or_in(array, current, long, length, count, store) {
    var node = document.getElementById(store == "greport" ? "inner0" : "inner1"),
        node0, node1, index;
    node.innerHTML = "";
    for (let k = 0; k < array.length; k++) {
        node0 = document.createElement("TR");
        node.appendChild(node0);
        for (let j in array[k])
            if (j != "pk") {
                if (store == "greport") {
                    node1 = document.createElement("TD");
                    node0.appendChild(node1);
                    switch (j) {
                        case "report_name":
                            node2 = document.createElement("input");
                            node2.setAttribute('type', "checkbox");
                            node2.setAttribute('class', "sharp");
                            node2.setAttribute('value', array[k]['pk']);
                            node1.appendChild(node2);
                            node1 = document.createElement("TD");
                            node0.appendChild(node1);
                            node2 = document.createElement("input");
                            node2.setAttribute('type', "text");
                            node2.setAttribute('value', array[k][j]);
                            node2.setAttribute('autocomplete', "off");
                            node2.setAttribute('class', 'rname');
                            node2.setAttribute('placeholder', "Change Report Name");
                            node1.appendChild(node2);
                            break;
                        case "schedule":
                            node2 = document.createElement("select");
                            const arr = ["Daily", "Weekly", "Monthly", "Custom Date"];
                            index = array[k][j][0] == "D" ? 0 : array[k][j][0] == "W" ? 1 : array[k][j][0] == "M" ? 2 : 3;
                            node2.setAttribute("class", "greport_select");
                            node1.appendChild(node2);
                            for (let i = 0; i < arr.length; i++) {
                                temp = document.createElement("option");
                                temp.appendChild(document.createTextNode(arr[i]));
                                node2.appendChild(temp);
                                if (i == index) {
                                    temp.setAttribute("selected", "");
                                    if (i == 3) {
                                        temp = document.createElement("input");
                                        temp.setAttribute("type", "number");
                                        temp.setAttribute("autocomplete", "off");
                                        temp.setAttribute("placeholder", "Days");
                                        temp.setAttribute("class", "rname");
                                        temp.setAttribute("style", "margin-left:5px;width:50px");
                                        temp.setAttribute("value", array[k][j]);
                                        node1.appendChild(temp);
                                    }
                                }
                            }
                            break;
                        case "next_run_time":
                            const p = new Date(array[k][j] * 1000);
                            node1.appendChild(document.createTextNode(`${p.getFullYear()}-${p.getMonth()<10?"0"+p.getMonth():p.getMonth()}-${p.getDate()<10?"0"+p.getDate():p.getDate()} ${p.getHours()<10?"0"+p.getHours():p.getHours()}:${p.getMinutes()<10?"0"+p.getMinutes():p.getMinutes()}:${p.getSeconds()<10?"0"+p.getSeconds():p.getSeconds()}`));
                            break;
                        case "view":
                            node2 = document.createElement("select");
                            const arr1 = {
                                "HTML Only": "HTML",
                                "PDF Only": "PDF",
                                "HTML & PDF": "HTML%26PDF"
                            };
                            index = array[k][j].toUpperCase() == "HTML&PDF" ? "HTML%26PDF" : array[k][j].toUpperCase();
                            node2.setAttribute("class", "greport_select");
                            for (let i in arr1) {
                                temp = document.createElement("option");
                                temp.appendChild(document.createTextNode(i));
                                temp.setAttribute("value", arr1[i]);
                                node2.appendChild(temp);
                                if (arr1[i] == index) temp.setAttribute("selected", "")
                            }
                            node1.appendChild(node2);
                            node1 = document.createElement("TD");
                            node0.appendChild(node1);
                            node2 = document.createElement("button");
                            node2.setAttribute('class', "update");
                            node1.appendChild(node2)
                            break;
                        default:
                            node1.appendChild(document.createTextNode(array[k][j]))
                    }
                } else {
                    node1 = document.createElement("TD");
                    node0.appendChild(node1);
                    if (j == "view") {
                        temp = array[k][j].split('&');
                        for (let c = 0; c < temp.length; c++) {
                            tempnode = document.createElement("A");
                            node1.appendChild(tempnode);
                            tempnode.setAttribute("href", "/rtemp?name=" + array[k]['report_name'] + "&id=" + array[k]['pk'] + "&type=" + temp[c]);
                            tempnode.textContent = temp[c];
                        }
                    } else node1.appendChild(document.createTextNode(array[k][j]))
                }
            }
    }
    if (store == "greport") {
        let all = document.getElementsByClassName("update");
        for (let i = 0; i < all.length; i++) all[i].addEventListener("click", (e) => {
            update(e.srcElement)
        });
        all = document.querySelectorAll("td:nth-child(3) .greport_select");
        for (let i = 0; i < all.length; i++) all[i].addEventListener("change", (e) => {
            schedule(e.srcElement)
        });
    }
    if (length === 0) {
        current = 0;
        length = 0;
        count = 0;
        long = 1
    }
    document.getElementById(store == "greport" ? "showing0" : "showing1").innerHTML = "Showing " + ((current - 1) * long + 1) + " to " + count + " of " + length + " Reports";
}


function update(self) {
    const val0 = self.parentElement.parentElement.children[0].children[0].value,
        val1 = self.parentElement.parentElement.children[1].children[0].value.trim(),
        len = self.parentElement.parentElement.children[2].children,
        val2 = len.length == 1 ? len[0].value : len[1].value,
        val3 = self.parentElement.parentElement.children[6].children[0].value;
    if (val1 === "") {
        self.parentElement.parentElement.children[1].children[0].style.boxShadow = "0 0 0 3px red";
        self.parentElement.parentElement.children[1].children[0].focus();
        if (len.length == 2) len[1].style.removeProperty('box-shadow');
    } else if (val2 === "" || (len.length == 2 && (len[1].value.indexOf(".") != -1 || len[1].value.indexOf("-") != -1))) {
        len[1].style.boxShadow = "0 0 0 3px red";
        len[1].focus();
        self.parentElement.parentElement.children[1].children[0].style.removeProperty('box-shadow');
    } else {
        self.parentElement.parentElement.children[1].children[0].style.removeProperty('box-shadow');
        if (len.length == 2) len[1].style.removeProperty('box-shadow');
        const transaction = db.transaction("greport", "readwrite").objectStore('greport');
        transaction.get(parseInt(val0)).onsuccess = e => {
            res = e.target.result;
            res.report_name = val1;
            res.schedule = val2;
            res.view = val3;
            transaction.put(res);
        }
        r = new XMLHttpRequest();
        r.open("POST", "/greport/", true);
        r.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        r.setRequestHeader("X-CSRFToken", document.getElementsByTagName("input")[0].value);
        r.send(`action=upt&id=${val0}&name=${val1}&schedule=${val2}&view=${val3}`);
        r.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                self.parentElement.parentElement.style.animation = "2s colorchange";
                setTimeout(function() {
                    self.parentElement.parentElement.style.removeProperty('animation')
                }, 2100)
            };
        }
    }
}

function schedule(self) {
    const node = self.parentElement;
    if (self.value == "Custom Date") {
        let temp = document.createElement("input");
        temp.setAttribute("type", "number");
        temp.setAttribute("autocomplete", "off");
        temp.setAttribute("placeholder", "Days");
        temp.setAttribute("class", "rname");
        temp.setAttribute("style", "margin-left:5px;width:50px");
        node.appendChild(temp);
        temp.focus()
    } else if (node.children.length > 1) node.removeChild(node.children[1]);
}