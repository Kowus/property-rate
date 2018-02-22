(function () {
    "use strict";

    // custom scrollbar

    $("html").niceScroll({
        styler: "fb",
        cursorcolor: "#F2B33F",
        cursorwidth: '6',
        cursorborderradius: '10px',
        background: '#424f63',
        spacebarenabled: false,
        cursorborder: '0',
        zindex: '1000'
    });

    $(".scrollbar1").niceScroll({
        styler: "fb",
        cursorcolor: "rgba(97, 100, 193, 0.78)",
        cursorwidth: '6',
        cursorborderradius: '0',
        autohidemode: 'false',
        background: '#F1F1F1',
        spacebarenabled: false,
        cursorborder: '0'
    });


    $(".scrollbar1").getNiceScroll();
    if ($('body').hasClass('scrollbar1-collapsed')) {
        $(".scrollbar1").getNiceScroll().hide();
    }

    $('#sby_area').autocomplete({
        classes: {
            "ui-autocomplete": "highlight"
        },
        source: function (request, response) {
            $.ajax({
                url: "/search_area",
                type: "GET",
                data: request,  // request is the value of search input
                success: function (data) {
                    // Map response values to fiedl label and value
                    response($.map(data, function (el) {
                        return {
                            label: el.name,
                            code: el.code,
                            value: el._id
                        };
                    }));
                }
            });
        },
        minLength: 1,
        // set an onFocus event to show the result on input field when result is focused
        focus: function (event, ui) {
            this.label = ui.item.label + ' (' + ui.item.code + ')';
            this.value = this.label;
            $(this).next("input").val(ui.item.value);
            /*$('#are_a').label = ui.item.code+' :: '+ui.item.label;
            $('#are_a').value = ui.item.value;*/
            // Prevent other event from not being execute
            event.preventDefault();
        },
        select: function (event, ui) {
            // Prevent value from being put in the input:
            this.label = ui.item.label + ' (' + ui.item.code + ')';
            this.value = label;
            // Set the id to the next input hidden field
            $(this).next("input").val(ui.item.value);
            // Prevent other event from not being execute
            event.preventDefault();
            // optionnal: submit the form after field has been filled up
            // $('#quicksearch').submit();
        }
    });
    $('#area_bar').autocomplete({
        classes: {
            "ui-autocomplete": "highlight"
        },
        source: function (request, response) {
            $.ajax({
                url: "/search_area",
                type: "GET",
                data: request,  // request is the value of search input
                success: function (data) {
                    // Map response values to fiedl label and value
                    response($.map(data, function (el) {
                        return {
                            label: el.name,
                            code: el.code,
                            value: el._id,
                            x_min: el.location.x.min,
                            x_max: el.location.x.max,
                            y_min: el.location.y.min,
                            y_max:el.location.y.max
                        };
                    }));
                }
            });
        },
        minLength: 1,
        // set an onFocus event to show the result on input field when result is focused
        focus: function (event, ui) {
            this.label = ui.item.label + ' (' + ui.item.code + ')';
            this.value = this.label;
            $(this).next("input").val(ui.item.value);
            $('#xmax').html(ui.item.x_maxg)
            /*$('#are_a').label = ui.item.code+' :: '+ui.item.label;
            $('#are_a').value = ui.item.value;*/
            // Prevent other event from not being execute
            event.preventDefault();
        },
        select: function (event, ui) {
            // Prevent value from being put in the input:
            this.value = ui.item.label + ' (' + ui.item.code + ')';
            // Set the id to the next input hidden field
            $(this).next("input").val(ui.item.value);
            // Prevent other event from not being execute
            event.preventDefault();
            // optionnal: submit the form after field has been filled up
            // $('#quicksearch').submit();
        }
    });
    $('#use_bar').autocomplete({
        classes: {
            "ui-autocomplete": "highlight"
        },
        source: function (request, response) {
            $.ajax({
                url: "/search_use",
                type: "GET",
                data: request,  // request is the value of search input
                success: function (data) {
                    // Map response values to fiedl label and value
                    response($.map(data, function (el) {
                        return {
                            label: el.name,
                            code: el.code,
                            value: el._id,
                            rate: el.rate
                        };
                    }));
                }
            });
        },
        minLength: 1,
        // set an onFocus event to show the result on input field when result is focused
        focus: function (event, ui) {
            this.label = ui.item.label + ' (' + ui.item.code + ')';
            this.value = this.label;
            $(this).next("input").val(ui.item.value);
            $('#use_rate').val(ui.item.rate);
            /*$('#are_a').label = ui.item.code+' :: '+ui.item.label;
            $('#are_a').value = ui.item.value;*/
            // Prevent other event from not being execute
            event.preventDefault();
        },
        select: function (event, ui) {
            // Prevent value from being put in the input:
            this.value = ui.item.label + ' (' + ui.item.code + ')';
            // Set the id to the next input hidden field
            $(this).next("input").val(ui.item.value);
            $('#use_rate').val(ui.item.rate);
            // Prevent other event from not being execute
            event.preventDefault();
            // optionnal: submit the form after field has been filled up
            // $('#quicksearch').submit();
        }
    });
    $('#san_bar').autocomplete({
        classes: {
            "ui-autocomplete": "highlight"
        },
        source: function (request, response) {
            $.ajax({
                url: "/search_san",
                type: "GET",
                data: request,  // request is the value of search input
                success: function (data) {
                    // Map response values to fiedl label and value
                    response($.map(data, function (el) {
                        return {
                            label: el.name,
                            code: el.code,
                            value: el._id
                        };
                    }));
                }
            });
        },
        minLength: 1,
        // set an onFocus event to show the result on input field when result is focused
        focus: function (event, ui) {
            this.label = ui.item.label + ' (' + ui.item.code + ')';
            this.value = this.label;
            $(this).next("input").val(ui.item.value);
            /*$('#are_a').label = ui.item.code+' :: '+ui.item.label;
            $('#are_a').value = ui.item.value;*/
            // Prevent other event from not being execute
            event.preventDefault();
        },
        select: function (event, ui) {
            // Prevent value from being put in the input:
            this.value = ui.item.label + ' (' + ui.item.code + ')';
            // Set the id to the next input hidden field
            $(this).next("input").val(ui.item.value);
            // Prevent other event from not being execute
            event.preventDefault();
            // optionnal: submit the form after field has been filled up
            // $('#quicksearch').submit();
        }
    });

    $('#add_prop').click(function () {
        var $form = $('#prop_form'),
            arb = $('#area_bar').val().split('('),
            usb = $('#use_bar').val().split('(')
        ;
        var add_prop = $.post('/users/add_prop', {
            use_code: $form.find('[name="use_code"]').val(),
            sanitation_code: $form.find('[name="sanitation_code"]').val(),
            prop_num: $form.find('[name="prop_num"]').val(),
            area: $form.find('[name="area"]').val(),
            len: $form.find('[name="len"]').val(),
            wid: $form.find('[name="wid"]').val(),
            use_rate: $form.find('[name="use_rate"]').val(),
            x: $form.find('[name="x"]').val(),
            y: $form.find('[name="y"]').val(),
            loc_des: $form.find('[name="loc_des"]').val(),
            owner: $form.find('[name="owner"]').val()
        });
        add_prop.done(function (data) {
            console.log(data);
            $('#add_prop_mess').html(' <div class="alert alert-success alert-dismissible" role="alert">\n' +
                '                    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>\n' +
                '                    Inserted new property: <strong>' + data._id + '</strong>\n' +
                '                </div>');
            $('#prop-list').prepend(
                '<a class="list-group-item media" href="">\n' +
                '                                        <div class="media-body">\n' +
                '                                            <div class="pull-left">\n' +
                '                                                <div class="lg-item-heading">' + arb[arb.length - 1].split(')')[0] + $form.find('[name="prop_num"]').val() + '</div>\n' +
                '                                            </div>\n' +
                '                                            <div class="pull-right">\n' +
                '                                                <div class="lg-item-heading">\n' + usb[usb.length - 1].split(')')[0] + ' </div>\n' +
                '                                            </div>\n' +
                '                                            <div class="clearfix"></div>\n' +
                '\n' +
                '                                            </div>\n' +
                '                                    </a>'
            );
            $form.find('[name="use_code"]').val("");
            $form.find('[name="sanitation_code"]').val("");
            $form.find('[name="prop_num"]').val('');
            $form.find('[name="area"]').val('');
            $('#area_bar').val('');
            $('#san_bar').val('');
            $('#use_bar').val('');
            $form.find('[name="len"]').val('');
            $form.find('[name="wid"]').val('');
            $form.find('[name="use_rate"]').val('');
            $form.find('[name="x"]').val('');
            $form.find('[name="y"]').val('');
            $form.find('[name="loc_des"]').val('');
        }).fail(function (err) {
            alert(err);
        });
    });

    $('.createdAt').each(function () {
        $(this).text(' ' + moment(new Date($(this).attr('data-createdAt')).toUTCString()).format('MMM/DD/YYYY'));
    });


    $('.calcs').each(function () {
        let san = Number($(this).attr('data-san')),
            impost = Number($(this).attr('data-impost')),
            rate_val = Number($(this).attr('data-rate_val'))
        ;
        $(this).text('¢ '+round_number(san + (impost * rate_val)));
    });

})(jQuery);

                     
     
  function round_number(value, places) {
      if(places){
          var pow = Math.pow(10, places);
          return Math.round(value, pow) / pow;
      }else {
          return Math.round(value * 100)/100
      }
  }