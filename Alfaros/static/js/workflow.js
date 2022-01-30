var db = null;

function update(self) {
    const val0 = self.parentElement.parentElement.children[0].textContent.trim(),
        val1 = self.parentElement.parentElement.children[1].children[0].value.trim(),
        val2 = self.parentElement.parentElement.children[2].children[0].value.trim(),
        val3 = self.parentElement.parentElement.children[4].children[0].checked ? "Active" : "Disabled",
        val4 = self.parentElement.parentElement.children[3].children[0].checked ? "TRUE" : "FALSE";
    if (val1 === "") {
        self.parentElement.parentElement.children[2].children[0].style.removeProperty('box-shadow');
        self.parentElement.parentElement.children[1].children[0].style.boxShadow = "0 0 0 3px red";
        self.parentElement.parentElement.children[1].children[0].focus()
    } else if (val2 === "") {
        self.parentElement.parentElement.children[1].children[0].style.removeProperty('box-shadow');
        self.parentElement.parentElement.children[2].children[0].style.boxShadow = "0 0 0 3px red";
        self.parentElement.parentElement.children[2].children[0].focus()
    } else {
        self.parentElement.parentElement.children[1].children[0].style.removeProperty('box-shadow');
        self.parentElement.parentElement.children[2].children[0].style.removeProperty('box-shadow');
        const transaction = db.transaction("timerule", "readwrite").objectStore('timerule');
        transaction.get(val0).onsuccess = e => {
            res = e.target.result;
            res.time = val1;
            res.severity = val2;
            res.autoincr = val3;
            res.status = val4;
            transaction.put(res);
        }
        r = new XMLHttpRequest();
        r.open("POST", "/update/", true);
        r.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        r.setRequestHeader("X-CSRFToken", document.getElementsByTagName("input")[0].value);
        r.send(`name=${val0}&time=${val1}&severity=${val2}&status=${val3}&auto=${val4}`);
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

function tmupdate(self) {
    const val1 = self.parentElement.parentElement.children[1].textContent.trim(),
        val2 = self.parentElement.parentElement.children[2].children[0].value.trim(),
        val3 = self.parentElement.parentElement.children[4].children[0].checked ? "ACTIVE" : "DISABLED",
        val4 = self.parentElement.parentElement.children[3].children[0].value.trim();
    if (val2 === "") {
        self.parentElement.parentElement.children[3].children[0].style.removeProperty('box-shadow');
        self.parentElement.parentElement.children[2].children[0].style.boxShadow = "0 0 0 3px red";
        self.parentElement.parentElement.children[2].children[0].focus()
    } else if (val4 === "") {
        self.parentElement.parentElement.children[2].children[0].style.removeProperty('box-shadow');
        self.parentElement.parentElement.children[3].children[0].style.boxShadow = "0 0 0 3px red";
        self.parentElement.parentElement.children[3].children[0].focus()
    } else {
        self.parentElement.parentElement.children[2].children[0].style.removeProperty('box-shadow');
        self.parentElement.parentElement.children[3].children[0].style.removeProperty('box-shadow');
        r = new XMLHttpRequest();
        r.open("POST", "/ticket_monitoring_handler/", true);
        r.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        r.setRequestHeader("X-CSRFToken", document.getElementsByTagName("input")[0].value);
        r.send(`action=upt&severity=${val1}&time=${val2}&nt=${val4}&status=${val3}&an=${val3}`);
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

document.addEventListener("DOMContentLoaded", function() {
    var source;
    const request = indexedDB.open("local");

    request.onupgradeneeded = e => {
        var res = e.target.result;
        var in_dt = res.createObjectStore("in", {
            keyPath: "pk"
        });
        in_dt.createIndex("rule_name", "rule_name");
        in_dt.createIndex("date", "date");
        in_dt.createIndex("severity", "severity");
        in_dt.createIndex("source", "source");
        in_dt.createIndex("destination", "destination");
        in_dt.createIndex("manager", "manager");
        in_dt.createIndex("status", "status");

        in_dt = res.createObjectStore("report", {
            keyPath: "pk"
        });
        in_dt.createIndex("report_name", "report_name");
        in_dt.createIndex("type", "type");
        in_dt.createIndex("schedule", "schedule");
        in_dt.createIndex("creation_date", "creation_date");
        in_dt.createIndex("next_run_time", "next_run_time");
        in_dt.createIndex("owner", "owner");
        in_dt.createIndex("view", "view");


        in_dt = res.createObjectStore("greport", {
            keyPath: "pk"
        });
        in_dt.createIndex("report_name", "report_name");
        in_dt.createIndex("schedule", "schedule");
        in_dt.createIndex("creation_date", "creation_date");
        in_dt.createIndex("next_run_time", "next_run_time");
        in_dt.createIndex("owner", "owner");
        in_dt.createIndex("view", "view");

        in_dt = res.createObjectStore("timerule", {
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
        r.open("GET", "/time_rule", true);
        r.send();
        r.onreadystatechange = (e) => {
            if (e.currentTarget.readyState == 4 && e.currentTarget.status == 200) {
                const data = JSON.parse(e.currentTarget.responseText);
                const transaction = db.transaction("timerule", "readwrite");
                transaction.objectStore('timerule').clear();
                for (i in data) {
                    obj = {
                        'rule_name': data[i].pk
                    };
                    for (j in data[i].fields)
                        if (j == "time" || j == "severity") {
                            if (data[i].fields[j]) obj[j] = parseInt(data[i].fields[j]);
                            else obj[j] = ""
                        } else obj[j] = data[i].fields[j];
                    transaction.objectStore('timerule').add(obj);
                }
                paginator(1, 10, data.length);
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
                document.getElementById("showing").innerHTML = "Showing " + ((current - 1) * long + 1) + " to " + count + " of " + length + " Rules";
            }
        }
    }


    let all = document.getElementsByClassName("update");
    for (let i = 0; i < all.length; i++) all[i].addEventListener("click", (e) => {
        update(e.srcElement)
    })
    document.getElementsByClassName("close")[0].addEventListener("click", () => {
        let modal = document.getElementsByClassName("nmodal")[0];
        modal.className = "nmodal";
        modal.children[0].style.transform = 'scale(0,1)';
    });
    document.getElementsByClassName("sexy_btn")[1].addEventListener("click", e => {
        r = new XMLHttpRequest();
        r.open("POST", "/ticket_monitoring_handler/", true);
        r.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        r.setRequestHeader("X-CSRFToken", document.getElementsByTagName("input")[0].value);
        const base = document.getElementsByClassName("nmodal_child")[0].children[1],
            severity = base.children[0].children[0].value.trim(),
            time = base.children[1].children[0].value.trim(),
            an = document.querySelector("input[name=an]:checked").value,
            nt = base.children[3].children[0].value.trim(),
            node = document.getElementById("inner0");
        r.send(`action=crt&severity=${severity}&time=${time}&an=${an}&nt=${nt}`);
        r.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                if (this.responseText !== "Done") {
                    document.getElementById("rticket").textContent = this.responseText;
                    document.getElementById("rticket").style.display = "block";
                } else {
                    const modal = document.getElementsByClassName("nmodal_active")[0];
                    modal.className = "nmodal";
                    modal.children[0].style.transform = 'scale(0,1)';
                    document.getElementById("rticket").style.display = "none";
                    const node1 = document.createElement("tr");
                    node.appendChild(node1);
                    let node2 = document.createElement("td"),
                        node3 = document.createElement("input");
                    node2.appendChild(node3);
                    node1.appendChild(node2);
                    node3.setAttribute("type", "checkbox");
                    node3.setAttribute("class", "sharp");
                    node3.setAttribute("value", severity);
                    node2 = document.createElement("td");
                    node2.appendChild(document.createTextNode(severity));
                    node1.appendChild(node2);
                    for (let i = 0; i < 2; i++) {
                        node2 = document.createElement("td"), node3 = document.createElement("input");
                        node2.appendChild(node3);
                        node1.appendChild(node2);
                        node3.setAttribute("type", "number");
                        node3.setAttribute('autocomplete', "off");
                        node3.setAttribute('placeholder', "Time In Minutes");
                        i == 0 ? node3.setAttribute("value", time) : node3.setAttribute("value", nt);
                    }
                    node2 = document.createElement("td");
                    node1.appendChild(node2);
                    node3 = document.createElement("input");
                    node2.appendChild(node3);
                    node3.setAttribute('type', "checkbox");
                    if (an === "ACTIVE") node3.setAttribute('checked', "checked");
                    node3.setAttribute('class', "radio1");

                    node2 = document.createElement("TD");
                    node3 = document.createElement("button");
                    node3.setAttribute('class', "tmupdate");
                    node2.appendChild(node3);
                    node1.appendChild(node2);
                    node3.addEventListener("click", (e) => {
                        tmupdate(e.srcElement)
                    })
                }
            }
        }
    })
    document.getElementsByClassName("sexy_btn")[0].addEventListener("click", () => {
        let modal = document.getElementsByClassName("nmodal")[0];
        modal.children[0].style.transform = 'scale(0,1)';
        modal.className = "nmodal";
    });
    document.getElementsByClassName("add")[0].addEventListener("click", () => {
        let modal = document.getElementsByClassName('nmodal')[0];
        modal.style.background = 'rgba(0,0,0,.5)';
        modal.className += ' nmodal_active';
        modal.children[0].style.transform = 'scale(1.0)';
    })
    document.getElementsByClassName("delete")[0].addEventListener("click", () => {
        let arr = "",
            all = document.querySelectorAll(".sharp:checked");
        for (let i = 0; i < all.length; i++) arr += all[i].value + ",";
        r = new XMLHttpRequest();
        r.open("POST", "/ticket_monitoring_handler/", true);
        r.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        r.setRequestHeader("X-CSRFToken", document.getElementsByTagName("input")[0].value);
        r.send(`action=del&arr=${arr=arr.substr(0,arr.length-1)}`);
        const node = document.getElementById("inner0");
        for (let i = 0; i < all.length; i++) node.removeChild(all[i].parentElement.parentElement)
    })
    all = document.getElementsByClassName("tmupdate");
    for (let i = 0; i < all.length; i++) all[i].addEventListener("click", (e) => {
        tmupdate(e.srcElement)
    })
    document.getElementById("tm").addEventListener("click", () => {
        document.getElementById("zombrani").style.display = "block"
    })
    document.getElementsByClassName("tmclose")[0].addEventListener("click", () => {
        document.getElementById("zombrani").style.display = "none"
    })
    document.getElementById("search").addEventListener("keyup", (e) => {
        if (e.which === 8 && e.srcElement.value.trim().length == 0) {
            sessionStorage.setItem("target", "in");
            create()
        } else {
            sessionStorage.setItem("target", "search");
            create()
        }
    });
    document.getElementsByTagName("select")[0].addEventListener("change", () => {
        create();
    }, {
        passive: true
    });
    var order_objects = document.getElementsByTagName("thead")[1].children[0].children;
    for (let i = 0; i < order_objects.length - 1; i++) order_objects[i].addEventListener("click", (e) => {
        updown(e.srcElement);
    });
})




function create(current = 1) {
    let index = sessionStorage.getItem("target");
    var long = document.getElementsByTagName("select")[0].value;
    const key = document.getElementsByClassName("active_order_down")[0] ? document.getElementsByClassName("active_order_down")[0].parentElement.parentElement.children[0].parentElement.getAttribute("deval") : document.getElementsByClassName("active_order_up")[0].parentElement.parentElement.children[0].parentElement.getAttribute("deval");
    document.getElementsByClassName("active_order_down")[0] ? document.getElementsByClassName("active_order_down")[0].parentElement.parentElement.children[0].parentElement.getAttribute("deval") : document.getElementsByClassName("active_order_up")[0].parentElement.parentElement.children[0].parentElement.getAttribute("deval");
    const direction = document.getElementsByClassName("active_order_down")[0] ? "prev" : "next";
    if (index == "in") {
        db.transaction("timerule", "readonly").objectStore("timerule").count().onsuccess = e => {
            length = e.target.result;
            paginator(current, long, length);
            draw_array(current, long, length, key, direction)
        }
    } else {
        const input = document.getElementById("search").value.trim();
        if (input.length != 0) {
            sessionStorage.setItem("target", "search");
            draw_array(current, long, 0, key, direction, false, ['rule_name', 'time', 'severity', 'autoincr', 'status'], input)
        } else {
            sessionStorage.setItem("target", "in");
            create();
        }
    }
}


function updown(elem) {
    let all = document.getElementsByTagName("thead")[1].children[0].children;
    for (var i = 0; i < all.length - 1; i++) {
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
    } else {
        elem.children[0].children[0].className = "order_up";
        elem.children[0].children[1].className = "active_order_down";
        elem.value = false;
    }
    create();
}



function paginator(current, long, length) {
    node = document.getElementById("pager");
    node.innerHTML = "";
    var node1, node0, node2;
    node0 = document.createElement("a")
    node0.setAttribute('id', 'first');
    node0.setAttribute('onclick', "create()");
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
            node0.setAttribute('onclick', "create(" + i + ")");
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
                node1.setAttribute('onclick', "create(" + i + ")");
                node1.appendChild(document.createTextNode(i));
                node2.appendChild(node1);
            } else {
                node1 = document.createElement("A");
                node1.setAttribute('onclick', "create(" + i + ")");
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
            node0.setAttribute('onclick', "create(" + i + ")");
            node2.appendChild(node0);
        }
    }
    node0 = document.createElement("a")
    node0.setAttribute('id', 'last');
    node0.setAttribute('onclick', "create(" + Math.ceil(length / long) + ")");
    node0.appendChild(document.createTextNode("»"));
    node.appendChild(node0);
}


function draw_array(current, long, length, key, direction, spec = true, field, input) {
    let count, i = (current - 1) * long,
        array = [],
        iter = 0;
    count = current * long < length ? current * long : length;
    const alera = key == "rule_name" ? db.transaction("timerule", "readonly").objectStore("timerule").openCursor(null, direction) : db.transaction("timerule", "readonly").objectStore("timerule").index(key).openCursor(null, direction)
    alera.onsuccess = e => {
        let cursor = e.target.result;
        if (spec) {
            if (cursor && iter < count) {
                if (iter >= i) {
                    array.push(cursor.value)
                }
                iter++;
                cursor.continue()
            } else search_or_in(array, current, long, length, count);
        } else {
            if (cursor) {
                for (let j in field) {
                    if (cursor.value[field[j]] !== null && (String(cursor.value[field[j]])).toUpperCase().includes(input.toUpperCase())) {
                        array.push(cursor.value);
                        break;
                    }
                }
                cursor.continue();
            } else {
                length = array.length;
                current * long < length ? count = current * long : count = length;
                paginator(current, long, length);
                search_or_in(array.slice(i, i + long), current, long, length, count)
            }
        }
    }
}

function search_or_in(array, current, long, length, count) {
    const args = {
        'time': 'Time In Hours',
        'severity': 'Severity to add'
    }
    var node = document.getElementById("inner1"),
        node0, node1, node2;
    node.innerHTML = "";
    for (let k = 0; k < array.length; k++) {
        node0 = document.createElement("TR");
        node.appendChild(node0);
        for (let j in array[k]) {
            node1 = document.createElement("TD");
            node0.appendChild(node1);
            switch (j) {
                case "rule_name":
                    node1.appendChild(document.createTextNode(array[k][j]));
                    break;
                case "severity":
                case "time":
                    node2 = document.createElement("input");
                    node2.setAttribute('type', "number");
                    node2.setAttribute('value', array[k][j]);
                    node2.setAttribute('autocomplete', "off");
                    node2.setAttribute('placeholder', args[j]);
                    if (j == "severity") {
                        node2.setAttribute('min', 0);
                        node2.setAttribute('max', 10);
                    }
                    node1.appendChild(node2);
                    break;
                case "autoincr":
                    node2 = document.createElement("input");
                    node2.setAttribute('type', "checkbox");
                    if (array[k][j] === "TRUE") node2.setAttribute('checked', "checked");
                    node2.setAttribute('class', "radio");
                    node1.appendChild(node2);
                    break;
                case "status":
                    node2 = document.createElement("input");
                    node2.setAttribute('type', "checkbox");
                    if (array[k][j] === "Active") node2.setAttribute('checked', "checked");
                    node2.setAttribute('class', "status");
                    node1.appendChild(node2);
                    break;

            }
        }
        node1 = document.createElement("TD");
        node0.appendChild(node1);
        node2 = document.createElement("button");
        node2.setAttribute('class', "update");
        node1.appendChild(node2)
    }
    let all = document.getElementsByClassName("update");
    for (let i = 0; i < all.length; i++) all[i].addEventListener("click", (e) => {
        update(e.srcElement)
    })

    if (length === 0) {
        current = 0;
        length = 0;
        count = 0;
        long = 1
    }
    document.getElementById("showing").innerHTML = "Showing " + ((current - 1) * long + 1) + " to " + count + " of " + length + " Alerts";
}