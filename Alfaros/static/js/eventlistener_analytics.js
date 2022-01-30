document.getElementsByClassName("pop_modal_box")[0].addEventListener("click", () => {
    var modal = document.getElementsByClassName('modal')[0];
    modal.style.background = 'rgba(0,0,0,.5)';
    modal.className += ' modal_active';
    modal.children[0].style.transform = 'scale(1.0)'
});
var order_objects = document.getElementsByTagName("tr")[0].children;
for (let i = 0; i < order_objects.length; i++) order_objects[i].addEventListener("click", () => {
    updown(this.cellIndex, this);
});
document.getElementsByClassName("sexy_btn")[0].addEventListener("click", () => {
    document.getElementsByClassName("modal")[0].className = "modal"
});
document.getElementsByClassName("close")[0].addEventListener("click", () => {
    document.getElementsByClassName("modal")[0].className = "modal"
});
document.getElementsByClassName("greport_select")[0].addEventListener("change", e => {
    schedule(e.srcElement)
})