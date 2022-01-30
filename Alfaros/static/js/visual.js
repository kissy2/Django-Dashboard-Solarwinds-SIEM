var color_24 = ['rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)', 'rgba(97, 172, 62, 0.5)'];
var color_4 = ['rgb(255, 177,193)', 'rgb(204, 178, 255)', 'rgb(255, 207, 159)', 'rgb(255,230, 170)', 'rgb(156,223,223)']
var color_7 = ['rgba(255, 99, 132, 0.3)', 'rgba(54, 162, 235, 0.3)', 'rgba(255, 206, 86, 0.3)', 'rgba(75, 192, 192, 0.3)', 'rgba(153, 102, 255, 0.3)', 'rgba(255, 159, 64, 0.3)', 'rgba(119,136,153,.3)']
var db = null,
    previous = "",
    ignore = 0,
    copy = "";
Chart.defaults.global.responsive = true;
Chart.defaults.global.maintainAspectRatio = false;

function cool(id, title, type, data, label, color) {
    var ctx = document.getElementById(id).getContext('2d');
    var myChart = new Chart(ctx, {
        type: type,
        data: {
            labels: label,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: color,
                borderWidth: 1
            }]
        },
        options: {
            tooltips: {
                enabled: true,
                bodyFontSize: 15,
                mode: 'point',
                callbacks: title == "Alerts Over Time" && type == "bar" && data.length == 24 ? {
                    title: function(tooltipItem, data) {
                        return ""
                    },
                    label: (tooltipItems) => {
                        return tooltipItems.yLabel + ' Alerts between ' + tooltipItems.xLabel + ' - ' + tooltipItems.xLabel.slice(0, -1) + ':59h';
                    }
                } : {}
            },
            legend: {
                position: 'top',
            },
            title: type == "doughnut" || type == "pie" ? {
                display: true,
                text: title
            } : {},
        }
    });
}

function display_chart(js_data, length, id, title, type, color) {
    let chart_data = [],
        labels = [];
    for (let i = 0; i < length; ++i) chart_data[i] = 0;
    if (length == 24) {
        for (let i = 0; i < length; ++i) labels[i] = i + "h";
        for (let i in js_data) chart_data[parseInt(js_data[i]['date'].substr(11, 2))]++;
    } else if (length == 7) {
        labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        for (let i in js_data) chart_data[new Date(parseInt(js_data[i]['date'].substr(0, 4)), parseInt(js_data[i]['date'].substr(5, 2)) - 1, parseInt(js_data[i]['date'].substr(8, 2) - 1)).getDay()]++;
    } else if (length == 12) {
        labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        for (let i in js_data) chart_data[parseInt(js_data[i]['date'].substr(5, 2)) - 1]++;
    } else if (length == 5) {
        labels = ['Critical', 'High', 'Medium', 'Low', 'Very Low'];
        for (let i in js_data) switch (js_data[i]['severity']) {
            case 0:
            case 1:
            case 2:
                chart_data[4]++;
                break;
            case 3:
            case 4:
                chart_data[3]++;
                break;
            case 5:
            case 6:
                chart_data[2]++;
                break;
            case 7:
            case 8:
                chart_data[1]++;
                break;
            case 9:
            case 10:
                chart_data[0]++;
        }
    }
    rem = document.getElementById(id)
    par = rem.parentElement
    par.removeChild(rem)
    rem = document.createElement("canvas")
    rem.setAttribute("id", id)
    par.appendChild(rem)
    cool(id, title, type, chart_data, labels, color);
}

function create(current = 1) {
    let index = sessionStorage.getItem("target");
    var long = document.getElementsByTagName("select")[4].value;
    const key = document.getElementsByClassName("active_order_down")[0] ? document.getElementsByClassName("active_order_down")[0].parentElement.parentElement.children[0].parentElement.getAttribute("deval") : document.getElementsByClassName("active_order_up")[0].parentElement.parentElement.children[0].parentElement.getAttribute("deval");
    const direction = document.getElementsByClassName("active_order_down")[0] ? "prev" : "next";
    if (index == "in") {
        db.transaction("in", "readonly").objectStore("in").count().onsuccess = e => {
            length = e.target.result;
            paginator(current, long, length);
            draw_array(current, long, length, key, direction)
        }
    } else {
        const input = document.getElementById("search").value.trim().toUpperCase();
        if (input.length != 0) {
            sessionStorage.setItem("target", "search");
            draw_array(current, long, 0, key, direction, false, ['rule_name', 'date', 'severity', 'source', 'destination', 'manager', 'status'], input)
        } else {
            sessionStorage.setItem("target", "in");
            create();
        }
    }
}

//document.querySelector(".active_order_down,.active_order_up").parentElement.parentElement.textContent   to add->>>>>>>>>>>>>><
function updown(elem) {
    let all = document.getElementsByTagName("th");
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




function cool_count() {
    this.current += this.speed;
    if (this.current < this.total) {
        document.getElementById("total_alerts").innerHTML = this.current;
        requestAnimationFrame(cool_count.bind({
            total: this.total,
            current: this.current,
            speed: this.speed
        }));
    } else document.getElementById("total_alerts").innerHTML = this.total;
};


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
    db.transaction("in", "readonly").objectStore("in").index(key).openCursor(null, direction).onsuccess = e => {
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
                    if (cursor.value[field[j]] !== null && (String(cursor.value[field[j]])).toUpperCase().includes(input)) {
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
    var node = document.getElementById("inner"),
        node0, node1;
    const dont_include = 'pk,incident_type,tool_alias,is_threat,analyst_note';
    node.innerHTML = "";
    for (let k = 0; k < array.length; k++) {
        node0 = document.createElement("TR");
        node0.setAttribute('id', array[k].pk);
        node.appendChild(node0);
        for (let j in array[k])
            if (!dont_include.match(j)) {
                node1 = document.createElement("TD");
                node0.appendChild(node1);
                node1.appendChild(document.createTextNode(array[k][j]));
            }
        node1 = document.createElement("TD");
        node1.setAttribute('id', array[k].pk);
        node0.appendChild(node1);
        node2 = document.createElement("button");
        node2.setAttribute('class', "pop pop_modal_box");
        node1.setAttribute('class', "pop_modal_box");
        node1.appendChild(node2);
        node2.setAttribute('id', array[k].pk);
    }
    var tr_nodes = document.getElementsByTagName('tr');
    for (let j = 1; j < tr_nodes.length; j++) tr_nodes[j].addEventListener("click", (e) => {
        db.transaction("in", "readonly").objectStore("in").openCursor(IDBKeyRange.only(parseInt(e.currentTarget.id))).onsuccess = es => {
            let cursor = es.target.result;
            output = '<label>Rule ID:</label><br><span>' + cursor.value.pk + '</span><br>';
            for (let i in cursor.value)
                if (i != "pk" && i != "ID") output += '<label>' + i.replace('_', ' ') + ':</label><br><span>' + cursor.value[i] + '</span><br>';
            document.getElementById("to_copy").innerHTML = output;
            copy = output
        }
    });
    for (let j = 1; j < tr_nodes.length; j++) tr_nodes[j].lastElementChild.addEventListener("click", (e) => {
        let modal = document.getElementsByClassName('modal')[0],
            val;
        e.srcElement.parentNode.nodeName == "TR" ? val = e.srcElement.parentNode.children[0].textContent : val = e.srcElement.parentNode.parentNode.children[0].textContent;
        document.getElementById("id_capitas").textContent = val;
        document.getElementById("id").textContent = e.srcElement.id;
        modal.style.background = 'rgba(0,0,0,.5)';
        modal.className += ' modal_active';
        modal.children[0].style.transform = 'scale(1.0)';
        ignore = 1
    });
    if (length === 0) {
        current = 0;
        length = 0;
        count = 0;
        long = 1
    }
    document.getElementById("showing").innerHTML = "Showing " + ((current - 1) * long + 1) + " to " + count + " of " + length + " Alerts";
}

function update_t(source) {
    source.addEventListener('update_t', (event) => {
        if (event.data.length > 2) {
            const js_data = JSON.parse(event.data),
                elem = document.getElementsByClassName("modal_active")[0],
                base2 = document.getElementById("to_copy");
            let tr = db.transaction("in", "readwrite").objectStore("in"),
                current;
            for (let i = 0; i < js_data.length; i++) {
                tr.get(js_data[i].id).onsuccess = e => {
                    res = e.target.result;
                    if (js_data[i].status != res.status || res.analyst_note != js_data[i].note) {
                        res.status = js_data[i].status;
                        res.analyst_note = js_data[i].note;
                        res.manager = js_data[i].manager;
                        tr.put(res);
                    }
                }
                current = document.getElementById(`${js_data[i].id}`);
                if (current) {
                    current.children[5].textContent = js_data[i].manager;
                    current.children[6].textContent = js_data[i].status;
                }
                if (base2.children[2].textContent == String(js_data[i].id)) {
                    for (let j = 0; j < base2.children.length; j++) {
                        if (base2.children[j].textContent == "manager:") base2.children[j + 2].textContent = js_data[i].manager;
                        else if (base2.children[j].textContent == "status:") base2.children[j + 2].textContent = js_data[i].status;
                        else if (base2.children[j].textContent == "analyst note:") {
                            base2.children[j + 2].textContent = js_data[i].note;
                            break;
                        }
                    }
                }
                if (elem) {
                    let base = elem.children[0].children[0].children[1];
                    if (parseInt(base.children[0].children[1].textContent) == js_data[i].id) {
                        js_data[i].status === "In Progress" ? base.children[2].children[1].selectedIndex = 0 : js_data[i].status === "Resolved" ? base.children[2].children[1].selectedIndex = 1 : js_data[i].status === "False Positive" ? base.children[2].children[1].selectedIndex = 2 : base.children[2].children[1].selectedIndex = 3;
                        base.children[3].children[1].value = js_data[i].note;
                    }
                }
            }
        }
    })
}

function update_s(source) {
    source.addEventListener('update_s', (event) => {
        if (event.data.length > 2) {
            let tr = db.transaction("in", "readwrite").objectStore("in"),
                current;
            const elem = document.getElementsByClassName("modal_active")[0],
                base2 = document.getElementById("to_copy"),
                js_data = JSON.parse(event.data);
            for (let i = 0; i < js_data.length; i++) {
                tr.get(js_data[i].pid).onsuccess = e => {
                    res = e.target.result;
                    if (res) {
                        tr.delete(res.pk)
                        res.severity = js_data[i].nss;
                        res.pk = js_data[i].nid;
                        tr.put(res);
                    }
                }
                current = document.getElementById(`${js_data[i].pid}`);
                if (current) {
                    current.id = js_data[i].nid;
                    current.children[2].textContent = js_data[i].nss;
                    current.children[7].id = js_data[i].nid;
                    current.children[7].children[0].id = js_data[i].nid;
                }
                if (base2.children.length > 1 && base2.children[2].textContent == String(js_data[i].pid)) {
                    base2.children[2].textContent = js_data[i].nid;
                    for (let j = 0; j < base2.children.length; j++) {
                        if (base2.children[j].textContent == "severity:") {
                            base2.children[j + 2].textContent = js_data[i].nss;
                            break;
                        }
                    }
                }
                if (elem && elem.children[0].children[0].children[1].children[0].children[1].textContent == String(js_data[i].pid)) elem.children[0].children[0].children[1].children[0].children[1].textContent = js_data[i].nid;
            }
        }
    })
}


function update_ss(source) {
    source.addEventListener('update_s', (event) => {
        if (event.data.length > 2) {
            let tr = db.transaction("in", "readwrite").objectStore("in"),
                current;
            const elem = document.getElementsByClassName("modal_active")[0],
                base2 = document.getElementById("to_copy"),
                js_data = JSON.parse(event.data);
            for (let i = 0; i < js_data.length; i++) {
                tr.get(js_data[i].pid).onsuccess = e => {
                    res = e.target.result;
                    if (res) tr.delete(res.pk);
                }
                current = document.getElementById(`${js_data[i].pid}`);
                if (current) current.innerHTML = "<td colspan='8' style='background:#F08080;color:white;text-align:center;font-weight:bold'>♠ This Alert Has Been Removed ♠</td>";
                if (base2.children.length > 2 && base2.children[2].textContent == String(js_data[i].pid)) base2.innerHTML = "<label style='background:#F08080;color:white;text-align:center;margin:0 10% 0 10%;padding:7px'>♠ This Alert Has Been Removed ♠</label>";
                if (elem && elem.children[0].children[0].children[1].children[0].children[1].textContent == String(js_data[i].pid)) elem.className = "modal";
            }
        }
    })
}


function update_m(source) {
    source.addEventListener('mono', (event) => {
        if (ignore) {
            previous = event.data;
            ignore = 0
        } else if (event.data.length > 2 && previous !== event.data) {
            previous = event.data;
            const js_data = JSON.parse(event.data);
            document.getElementsByClassName("ring_ring")[0].style.display = "flex";
            content = ""
            for (let i = 0; i < js_data.length; i++) {
                expiring = js_data[i].fields['expired'] == 1 ? "<div><span class='warning2'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>The time defined by the administrator to treat this ticket has expired.</div>" : "<div><span class='warning1'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>Beware half time has passed since you opened this ticket {" + js_data[i].fields['half'] / 60 + "} minutes remaining.</div>"
                content += "<b>" + js_data[i].fields['manager'].toUpperCase() + "</b> Concerning the ticket you have opened upon the alert <" + js_data[i].pk + "> at " + js_data[i].fields['time'] + " ‼" + expiring + "<br><br>";
            }
            document.getElementsByClassName('modal_content')[1].innerHTML = content;
        }
    })
}


function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s));
}

document.addEventListener("DOMContentLoaded", function() {
    var source;
    r = new XMLHttpRequest();
    r.open("GET", "/api/data", true);
    r.send();
    r.onreadystatechange = (e) => {
        if (e.currentTarget.readyState == 4 && e.currentTarget.status == 200) {
            const request = indexedDB.open("local"),
                data = JSON.parse(e.currentTarget.responseText);
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
                const transaction = db.transaction("in", "readwrite");
                transaction.objectStore('in').clear();
                for (i in data) {
                    obj = {
                        'pk': data[i].pk
                    };
                    for (j in data[i].fields) j == "severity" ? obj[j] = parseInt(data[i].fields[j]) : obj[j] = data[i].fields[j];
                    transaction.objectStore('in').add(obj);
                }
            }
            sessionStorage.setItem("target", "in");
            paginator(1, 10, data.length);
            var tr_nodes = document.getElementsByTagName('tr');
            for (let j = 1; j < tr_nodes.length; j++) tr_nodes[j].addEventListener("click", (e) => {
                db.transaction("in", "readonly").objectStore("in").openCursor(IDBKeyRange.only(parseInt(e.currentTarget.id))).onsuccess = es => {
                    let cursor = es.target.result;
                    output = '<label>Rule ID:</label><br><span>' + cursor.value.pk + '</span><br>';
                    for (let i in cursor.value)
                        if (i != "pk" && i != "ID") output += '<label>' + i.replace('_', ' ') + ':</label><br><span>' + cursor.value[i] + '</span><br>';
                    document.getElementById("to_copy").innerHTML = output;
                }
            });
            for (let j = 1; j < tr_nodes.length; j++) tr_nodes[j].lastElementChild.addEventListener("click", (e) => {
                let modal = document.getElementsByClassName('modal')[0],
                    val;
                e.srcElement.parentNode.nodeName == "TR" ? val = e.srcElement.parentNode.children[0].textContent : val = e.srcElement.parentNode.parentNode.children[0].textContent;
                document.getElementById("id_capitas").textContent = val;
                document.getElementById("id").textContent = e.srcElement.id;
                modal.style.background = 'rgba(0,0,0,.5)';
                modal.className += ' modal_active';
                modal.children[0].style.transform = 'scale(1.0)';
            });
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
            document.getElementById("showing").innerHTML = "Showing " + ((current - 1) * long + 1) + " to " + count + " of " + length + " Alerts";

            sessionStorage.setItem("last_pk", data[data.length - 1].pk);
        }
    }

    document.getElementsByClassName("ring_ring")[0].addEventListener("click", (e) => {
        const modal = document.getElementsByClassName("nmodal")[0];
        modal.className += " nmodal_active";
        modal.children[0].style.transform = 'scale(1.0)';
        ["SPAN", "BUTTON"].indexOf(e.srcElement.nodeName) != -1 ? e.srcElement.parentElement.style.display = "none" : e.srcElement.style.display = "none"
    })
    document.getElementsByClassName("forced")[0].addEventListener("click", () => {
        const modal = document.getElementsByClassName("nmodal")[0];
        modal.children[0].style.transform = 'scale(0.0)';
        modal.className = "nmodal";
        document.getElementsByClassName("ring_ring")[0].style.display = "none"
    });
    document.getElementsByClassName("capitos")[0].children[0].addEventListener("click", () => {
        document.getElementsByClassName("alert_detail")[0].style.display = 'none';
        document.getElementsByClassName("alert_container")[0].style.width = '95%';
        document.getElementsByClassName("pop_alert_detail")[0].className += " pop_alert_detail_active";
    });
    document.getElementsByClassName("capitos")[0].children[1].addEventListener("click", () => {
        document.getElementsByClassName("alert_detail")[0].style.display = 'none';
        document.getElementsByClassName("alert_container")[0].style.width = '95%';
        document.getElementsByClassName("pop_alert_detail")[0].className += " pop_alert_detail_active";
    });
    document.getElementsByClassName("capitos")[0].children[2].addEventListener("click", () => {
        node0 = document.createElement('textarea');
        parent = document.getElementsByTagName('body')[0];
        parent.appendChild(node0);
        node0.value = document.getElementById("to_copy").innerHTML.replace(/<label>|<\/label>|<span *>|<\/span>/g, "").replace(/<br>/g, "\n");
        node0.style.opacity = 0;
        node0.style.height = 0;
        node0.style.width = 0;
        node0.select();
        window.document.execCommand('copy');
        parent.removeChild(node0);
    });
    document.getElementsByTagName("select")[4].addEventListener("change", () => {
        create();
    }, {
        passive: true
    });
    let chart = document.getElementsByClassName("chart");
    chart[0].addEventListener("change", e => {
        const id = e.srcElement.getAttribute("vlad"),
            title = e.srcElement.getAttribute("title"),
            type = e.srcElement.value;
        document.getElementById("total_alerts").style.opacity = "0"
        db.transaction("in", "readonly").objectStore("in").getAll().onsuccess = e => {
            display_chart(e.target.result, 5, id, title, type, color_4);
        }, {
            passive: true
        }
    });
    chart[1].addEventListener("change", e => {
        const id = e.srcElement.getAttribute("vlad"),
            title = e.srcElement.getAttribute("title"),
            type = e.srcElement.value;
        range = parseInt(chart[2].value)
        if (range == 24 || range == 12) color = color_24
        else color = color_7
        db.transaction("in", "readonly").objectStore("in").getAll().onsuccess = e => {
            display_chart(e.target.result, range, id, title, type, color);
        }, {
            passive: true
        }
    });
    chart[2].addEventListener("change", e => {
        const id = e.srcElement.getAttribute("vlad"),
            title = e.srcElement.getAttribute("title"),
            range = parseInt(e.srcElement.value);
        if (range == 24 || range == 12) color = color_24
        else color = color_7
        db.transaction("in", "readonly").objectStore("in").getAll().onsuccess = e => {
            display_chart(e.target.result, range, id, title, chart[1].value, color);
        }, {
            passive: true
        }
    });
    document.getElementById("search").addEventListener("keyup", (e) => {
        if (e.which === 8 && e.srcElement.value.trim().length == 0) {
            sessionStorage.setItem("target", "in");
            create()
        } else {
            sessionStorage.setItem("target", "search");
            create()
        }
    });
    document.getElementById("notification").addEventListener("click", () => {
        location.reload()
    })
    var order_objects = document.getElementsByTagName("tr")[0].children;
    for (let i = 0; i < order_objects.length - 1; i++) order_objects[i].addEventListener("click", (e) => {
        updown(e.srcElement);
    });
    document.getElementsByClassName("pop_alert_detail")[0].children[0].addEventListener("click", () => {
        document.getElementsByClassName("alert_detail")[0].style.display = 'block';
        document.getElementsByClassName("alert_container")[0].style.width = '77%';
        document.getElementsByClassName("pop_alert_detail")[0].className = "pop_alert_detail";
    });
    document.getElementsByClassName("pop_alert_detail")[0].children[1].addEventListener("click", () => {
        document.getElementsByClassName("alert_detail")[0].style.display = 'block';
        document.getElementsByClassName("alert_container")[0].style.width = '77%';
        document.getElementsByClassName("pop_alert_detail")[0].className = "pop_alert_detail";
    });
    document.getElementsByClassName("close")[0].addEventListener("click", () => {
        let modal = document.getElementsByClassName("modal")[0];
        modal.children[0].style.transform = 'scale(0.0)';
        modal.className = "modal";
        document.getElementById("rticket").style.display = "none";
    });
    document.getElementsByTagName("input")[1].addEventListener("click", (e) => {
        e.srcElement.checked ? live() : notify();
    })
    document.getElementsByClassName("alert_filter")[0].addEventListener("keyup", (e) => {
        const input = e.srcElement.value.trim().toUpperCase(),
            base = document.getElementById("to_copy"),
            all = base.children;;
        base.innerHTML = copy;
        if (input.length != 0) {
            for (let i = 0; i < all.length; i++)
                if (all[i].nodeName == "SPAN") {
                    index = all[i].textContent.toUpperCase().indexOf(input);
                    if (index != -1) {
                        content = all[i].textContent;
                        all[i].innerHTML = content.substr(0, index) + "<span style='background:rgba(0,123,255,.25);font-weight:bold'>" + content.substr(index, input.length) + "</span>" + content.substr(index + input.length)
                    }
                }
        }
    })


    function notify() {
        try {
            source.close();
        } catch (er) {} finally {
            order();
            p = new Date();
            current = String(`${p.getFullYear()}-${p.getMonth()<10?"0"+p.getMonth():p.getMonth()}-${p.getDate()<10?"0"+p.getDate():p.getDate()}%20${p.getHours()<10?"0"+p.getHours():p.getHours()}:${p.getMinutes()<10?"0"+p.getMinutes():p.getMinutes()}:${p.getSeconds()<10?"0"+p.getSeconds():p.getSeconds()}`)
            source = new EventSource("/live?current=" + current + "&notify=true&last_id=" + sessionStorage.getItem("last_pk"));
            const target = document.getElementById("notification");
            source.addEventListener('count', (event) => {
                if (parseInt(event.data) > 0 && target.textContent !== event.data + "Click To Reload") {
                    target.style.display = "block";
                    target.innerHTML = event.data + "<span class='tooltiptext'>Click To Reload</span>"
                }
            });
            update_t(source);
            update_s(source);
            update_m(source)
        }
    }

    function live() {
        try {
            source.close();
        } catch (er) {} finally {
            document.getElementById("notification").style.display = "none";
            order();
            source = new EventSource("/live?notify=false&last_id=" + sessionStorage.getItem("last_pk"));
            source.addEventListener("live", (event) => {
                bpgb2a(event)
            });
            update_t(source);
            setTimeout(function() {
                update_ss(source)
            }, 100);
            update_m(source)
        }
    }

    function bpgb2a(e) {
        if (e.data.length > 2) {
            let in_store = db.transaction("in", "readwrite").objectStore('in');
            const new_js_data = JSON.parse(e.data);
            for (i in new_js_data) {
                obj = {
                    'pk': new_js_data[i].pk
                };
                for (j in new_js_data[i].fields) j == "severity" ? obj[j] = parseInt(new_js_data[i].fields[j]) : obj[j] = new_js_data[i].fields[j];
                in_store.add(obj);
            }
            e.srcElement.close();
            order();;
            sessionStorage.setItem("last_pk", new_js_data[i].pk);
            source = new EventSource("/live?notify=false&last_id=" + new_js_data[i].pk);
            source.addEventListener("live", (es) => {
                bpgb2a(es);
                update_t(source);
                setTimeout(function() {
                    update_ss(source)
                }, 100);
                update_m(source)
            })
        }
    }
    async function start() {
        while (db == null) await sleep(100);
        notify()
    };
    start();
    document.getElementsByClassName("sexy_btn")[1].addEventListener("click", e => {
        r = new XMLHttpRequest();
        r.open("POST", "/ticket/", true);
        r.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        r.send(`id=${e.srcElement.parentElement.parentElement.children[1].children[0].children[1].textContent}&status=${document.getElementsByTagName("select")[0].value}&note=${document.getElementsByTagName("textarea")[0].value}`);
        r.onreadystatechange = function(e) {
            if (e.currentTarget.readyState > 3 && e.currentTarget.status == 200) {
                if (e.currentTarget.responseText !== "Done") {
                    document.getElementById("rticket").style.display = "block";
                    document.getElementById("rticket").textContent = r.responseText;
                } else document.getElementsByClassName("modal_active")[0].className = "modal";
            }
        }
    })
    document.getElementsByClassName("sexy_btn")[0].addEventListener("click", () => {
        let modal = document.getElementsByClassName("modal")[0];
        modal.children[0].style.transform = 'scale(0.0)';
        modal.className = "modal";
        document.getElementById("rticket").style.display = "none";
    });
    async function test() {
        while (db === null)
            await sleep(200)
        db.transaction("in", "readonly").objectStore("in").getAll().onsuccess = e => {
            display_chart(e.target.result, 24, "alert_overtime_chart", "Alerts Over Time", "bar", color_24);
            display_chart(e.target.result, 5, "severity", "Alerts Severity", "doughnut", color_4);
            let cool = cool_count.bind({
                total: e.target.result.length,
                current: 0,
                speed: Math.ceil(e.target.result.length / 100)
            });
            cool()
        };
    };
    test()
});

function order() {
    elem = document.getElementsByTagName("th")[1];
    elem.value = true;
    updown(elem);

}