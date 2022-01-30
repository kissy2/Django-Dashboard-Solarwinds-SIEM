var source;
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
    node0.value = document.getElementById("to_copy").textContent;
    node0.style.opacity = 0;
    node0.style.height = 0;
    node0.style.width = 0;
    node0.select();
    window.document.execCommand('copy');
    parent.removeChild(node0);
});
document.getElementsByTagName("select")[1].addEventListener("change", () => {
    ordering();
}, {
    passive: true
});
document.getElementById("search").addEventListener("keyup", () => {
    search()
});
var order_objects = document.getElementsByTagName("tr")[0].children;
for (let i = 0; i < order_objects.length; i++) order_objects[i].addEventListener("click", (e) => {
    updown(e.srcElement);
});
/*var pop=document.getElementsByClassName("pop_modal_box");for(let i=0;i<pop.length;i++)pop[i].addEventListener("click",()=>{var modal=document.getElementsByClassName('modal')[0];modal.style.background='rgba(0,0,0,.5)';modal.className+=' modal_active';modal.children[0].style.transform='scale(1.0)';});
 */
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
    modal.className = "modal"
});
document.getElementsByTagName("input")[1].addEventListener("click", (e) => {
    e.srcElement.checked ? live() : notify();
})

function notify() {
    try {
        source.close();
    } catch (er) {} finally {
        source = new EventSource("/live?notify=true&last_id=" + sessionStorage.getItem("last_pk"));
        const target = document.getElementById("notification");
        source.addEventListener('count', (event) => {
            if (parseInt(event.data) != 0 && target.textContent !== event.data + "Click To Reload") {
                target.style.display = "block";
                target.innerHTML = event.data + "<span class='tooltiptext'>Click To Reload</span>"
            }
        });
        update_t(source);
        update_s(source);
    }
}

function live() {
    try {
        source.close();
    } catch (er) {} finally {
        document.getElementById("notification").style.display = "none";
        source = new EventSource("/live?notify=false&last_id=" + sessionStorage.getItem("last_pk"));
        source.addEventListener("live", (event) => {
            bpgb2a(event)
        });
        update_t(source);
        update_ss(source);
    }
}

function bpgb2a(e) {
    if (e.data.length > 2) {
        let in_store = db.transaction("in", "readwrite").objectStore('in');
        const new_js_data = JSON.parse(e.data);
        console.log(new_js_data);
        for (i in new_js_data) {
            obj = {
                'pk': new_js_data[i].pk
            };
            for (j in new_js_data[i].fields) j == "severity" ? obj[j] = parseInt(new_js_data[i].fields[j]) : obj[j] = new_js_data[i].fields[j];
            in_store.add(obj);
        }
        e.srcElement.close();
        create();
        sessionStorage.setItem("last_pk", new_js_data[i].pk);
        source = new EventSource("/live?notify=false&last_id=" + new_js_data[i].pk);
        source.addEventListener("live", (es) => {
            bpgb2a(es)
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
        console.log(r.responseText)
    }
})
document.getElementsByClassName("sexy_btn")[0].addEventListener("click", () => {
    let modal = document.getElementsByClassName("modal")[0];
    modal.children[0].style.transform = 'scale(0.0)';
    modal.className = "modal"
});