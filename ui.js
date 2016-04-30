document.addEventListener("DOMContentLoaded", function() {
    var keys = 'A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, LEFT_CLICK, RIGHT_CLICK, SPACE, ENTER, CTRL'.replace(/ /g, "").split(",");
    console.log(keys);
    _(keys).chain().map(function(letter){return '<li class="mdl-menu__item">' + letter + '</li>'})
        .each(function(elem) {$('.mdl-js-menu').append(elem)});

    $('.dropdown').keydown(function(event) {
        "use strict";

        if(event.keyCode == 38 || event.keyCode == 40) {
            console.log("down hit");
            return;
        }

        var field = $(this);
        var prevValue = field.val();
        var refresh = function() {
            var val = field.val();
            // $(this).parent().find('.mdl-js-menu').html('<li class="mdl-menu__item">' + this.value + '</li>');
            var menu = field.parent().find('.mdl-js-menu');
            menu.empty();

            var resnum = 0;

            _(keys).chain().filter(function(l){
                var regex = new RegExp("^" + val, "i");
                console.log("val, " + regex.test(l));
                return regex.test(l);
            }).map(function(letter){return '<li class="mdl-menu__item">' + letter + '</li>'})
                .each(function(elem) {
                    menu.append(elem);
                    resnum++;
                });
            if(resnum == 0) {
                field.val(prevValue);
                refresh();
                console.log("cancelling");
                return;
            }
            field.click();
            field.click();

        };
        setTimeout(refresh, 2);
    })
});