/**
 * Include your custom JavaScript here.
 *
 * We also offer some hooks so you can plug your own logic. For instance, if you want to be notified when the variant
 * changes on product page, you can attach a listener to the document:
 *
 * document.addEventListener('variant:changed', function(event) {
 *   var variant = event.detail.variant; // Gives you access to the whole variant details
 * });
 *
 * You can also add a listener whenever a product is added to the cart:
 *
 * document.addEventListener('product:added', function(event) {
 *   var variant = event.detail.variant; // Get the variant that was added
 *   var quantity = event.detail.quantity; // Get the quantity that was added
 * });
 *
 * If you are an app developer and requires the theme to re-render the mini-cart, you can trigger your own event. If
 * you are adding a product, you need to trigger the "product:added" event, and make sure that you pass the quantity
 * that was added so the theme can properly update the quantity:
 *
 * document.documentElement.dispatchEvent(new CustomEvent('product:added', {
 *   bubbles: true,
 *   detail: {
 *     quantity: 1
 *   }
 * }));
 *
 * If you just want to force refresh the mini-cart without adding a specific product, you can trigger the event
 * "cart:refresh" in a similar way (in that case, passing the quantity is not necessary):
 *
 * document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', {
 *   bubbles: true
 * }));
 */
$(document).ready(function () {
    function runPostcodeCheck() {
        $.ajax({
            method: "GET",
            url: "https://shop-api.palmers.co.nz/?pc=" + $('#select-postcode').val(),
            success: function (data) {
                if (data != -1) {
                    document.dispatchEvent(new CustomEvent('modal:close'));
                    $('#select-postcode').prop('disabled', false);
                    $("#storePostcodeSearch").prop('disabled', false);

                    var store_data = JSON.parse(data);
                    localStorage["selectedStore"] = data;

                    $("#storeNameHeader").html(store_data['name']);
                    $("#storeSelectorBar span").html('Shopping from <b>' + store_data['name'] + '</b> in ' + store_data['user_postcode'] + '.');

                    location.reload();
                } else {
                    $('#select-postcode').prop('disabled', false);
                    $("#storePostcodeSearch").prop('disabled', false);
                    alert("Postcode not found. Please try another postcode or contact Palmers for assistance.");
                }
            }
        });
    };

    function getDataByID(data, theID) {
        return data.filter(
            function (data) {
                return data.id == theID
            }
        );
    }

    function runProductPageStockCheck(the_sku = null) {
        var thisSKU = the_sku || $('input[name=id][data-sku]').attr('data-sku');
        var store_data = JSON.parse(localStorage["selectedStore"]);
        $.ajax({
            method: "POST",
            url: "https://shop-api.palmers.co.nz/?stock=true",
            data: {
                products: [thisSKU + ":1"]
            },
            success: function (data) {
                if (data != -1) {
                    var product_data = JSON.parse(data);

                    if (!the_sku) {
                        $(".product-form__inventory").removeClass('inventory--high').removeClass('inventory--low');

                        if (product_data[thisSKU][store_data['name'].replace("Palmers ", "")]['available'] > 0) {
                            $(".product-form__inventory").addClass('inventory--high').text('In stock at ' + store_data['name']);
                            $('.store-availability-information.selected-available').show();
                            $('.store-availability-information.selected-unavailable').hide();
                            $('.store-availability-information__title.text--strong').text("Available at " + store_data['name']);
                            $('.shopify-payment-button').hide();
                            //$('.product-form__add-button').removeClass('button--disabled').addClass('button--primary');
                            //$('.product-form__add-button').prop('disabled', false);
                            //$('.product-form__add-button').text('Add to cart');
                        } else {
                            $(".product-form__inventory").addClass('inventory--low');
                            $(".product-form__inventory").text('Sold out at ' + store_data['name']);
                            $('.store-availability-information.selected-available').hide();
                            $('.store-availability-information.selected-unavailable').show();
                            $('.store-availability-information__title.text--strong').text("Unavailable at " + store_data['name']);
                            $('.shopify-payment-button').hide();
                            //$('.product-form__add-button').removeClass('button--primary').addClass('button--disabled');
                            //$('.product-form__add-button').prop('disabled', true);
                            //$('.product-form__add-button').text('Sold out at ' + store_data['name']);
                        }
                    }

                    var new_html = "";
                    $.each(product_data[thisSKU], function (index, location) {
                        if (typeof store_data['other_location_data']['Palmers ' + location['name']] !== "undefined") {
                            new_html += '<div class="store-availability-list__item"><p class="store-availability-list__location text--strong">';
                            new_html += store_data['other_location_data']['Palmers ' + location['name']]['name'] + '</p>';
                            new_html += '<div class="store-availability-list__item-info"><div class="store-availability-list__stock">';
                            if (product_data[thisSKU][location['name']]['available'] > 0) {
                                new_html += '<svg focusable="false" class="icon icon--store-availability-in-stock" viewBox="0 0 18 14" role="presentation"><path d="M2 6l5 5 9-9" stroke="#00C200" stroke-width="3" fill="none"></path></svg> Available';
                            } else {
                                new_html += '<svg focusable="false" class="icon icon--store-availability-out-of-stock" viewBox="0 0 18 14" fill="none" role="presentation"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 10l-2 2-4-4-4 4-2-2 4-4-4-4 2-2 4 4 4-4 2 2-4 4 4 4z" fill="#FD1A20"></path></svg> Unavailable';
                            }
                            new_html += '</div><div class="store-availability-list__contact">';
                            new_html += store_data['other_location_data']['Palmers ' + location['name']]['address_line_1']
                            if (store_data['other_location_data']['Palmers ' + location['name']]['address_line_2'].length > 0) {
                                new_html += ', ' + store_data['other_location_data']['Palmers ' + location['name']]['address_line_2'];
                            }
                            new_html += '<br>' + store_data['other_location_data']['Palmers ' + location['name']]['city'] + ', '
                            new_html += store_data['other_location_data']['Palmers ' + location['name']]['region'];
                            new_html += ', ' + store_data['other_location_data']['Palmers ' + location['name']]['postcode'];
                            new_html += '<br>Phone: ' + store_data['other_location_data']['Palmers ' + location['name']]['phone'] + '</div></div></div>';
                        }
                    });
                    $('.store-availabilities-list.modal__content').html(new_html);
                }
            }
        });
    }

    function runCartStockCheck() {
        var skuQuery = [];
        var allSKUs = $('.line-sku').each(function () {
            skuQuery.push($(this).text() + ":" + ($(this).parents('.line-item').find('.quantity-selector__value').val() || 1));
        });

        var checkoutStatus = false;
        var store_data = JSON.parse(localStorage["selectedStore"]);
        $.ajax({
            method: "POST",
            url: "https://shop-api.palmers.co.nz/?stock=true&cart=true&bc=" + store_data["branch"],
            data: {
                products: skuQuery
            },
            success: function (data) {
                if (data != -1) {
                    try {
                        var product_data = JSON.parse(data);
                        for (var key of Object.keys(product_data)) {
                            $(".line-item__meta[data-sku=" + key + "] .product-label.product-label--custom1").remove();
                            $(".line-item__meta[data-sku=" + key + "] .product-label.product-label--custom2").remove();
                            if (product_data[key] == true) {
                                $(".line-item__meta[data-sku=" + key + "]").prepend('<span class="product-label product-label--custom2">Available at ' + store_data['name'] + '</span>');
                            } else {
                                $(".line-item__meta[data-sku=" + key + "]").prepend('<span class="product-label product-label--custom1">Unavailable at ' + store_data['name'] + '</span>');
                            }
                        }
                    } catch (error) {
                        console.log("JSON parse error")
                    }
                }
            }
        });
    }

    $("#storePostcodeSearch").on('click touch', function () {
        $(this).prop('disabled', true);
        $('#select-postcode').prop('disabled', true);
        runPostcodeCheck();
    });

    if (localStorage["selectedStore"]) {
        var store_data = JSON.parse(localStorage["selectedStore"]);
        $("#storeNameHeader").html(store_data['name']);
        $("#storeSelectorBar span").html('Shopping from <b>' + store_data['name'] + '</b> in ' + store_data['user_postcode'] + '.');
        $("#storeSelectorBar a").text('Change Store');
    } else {
        // To do: fix
        $('.item-availability-modal-opener.ca_restyle_availability').addClass('ca_hidden').hide();
    }

    if (window.location.pathname.indexOf('/products/') !== -1) {
        if (localStorage["selectedStore"]) {
            runProductPageStockCheck();
        } else {
            $(".product-form__inventory").removeClass('inventory--high').removeClass('inventory--low').html('<a href="#" data-action="open-modal" aria-controls="StoreAvailabilityModal-picker" aria-label="Select store">Please select your local Palmers store</a>');
            $('.shopify-payment-button').hide();
            $('.product-form__add-button').prop('disabled', false).text('Select your Palmers store').attr('data-action', "open-modal").attr('aria-controls', "StoreAvailabilityModal-picker").attr('aria-label', "Select store");
        }
    }

    if ((window.location.pathname.indexOf('/cart') !== -1) || ($('.line-sku').length > 0 && $('.line-item__meta').length > 0)) {
        if (localStorage["selectedStore"]) {
            document.addEventListener('cart:rerendered', function (event) {
				// console.log('NOTE: cart:rerendered event has fired AND runCartStockCheck() is running because it is a /cart page OR there are .line-sku & .line-item__meta both present');
                runCartStockCheck();
                Zapiet.start(ZapietWidgetConfig);
            });
			// console.log('NOTE: runCartStockCheck() running because it is a /cart page OR there are .line-sku & .line-item__meta both present');
            runCartStockCheck();
            var store_data = JSON.parse(localStorage["selectedStore"]);
            if (window.ZapietEvent) {
                window.ZapietEvent.listen('selected_method', function () {
                    setTimeout(function () {
                        if ($('.checkoutMethodContainer').hasClass('pickup')) {
                            $("#pickupGeoSearchField").val(store_data['user_postcode']);
                            $("#pickupGeoSearchField").siblings('.button').click();
                            setTimeout(function () {
                                $("input[name=location_id][value=" + store_data['id'] + "]").click();
                                $("#storePickupApp .checkoutMethodContainer .locations").scrollTop($("#storePickupApp .checkoutMethodContainer .locations").scrollTop() + ($("input[name=location_id][value=" + store_data['id'] + "]").position().top - $("#storePickupApp .checkoutMethodContainer .locations").position().top) - ($("#storePickupApp .checkoutMethodContainer .locations").height() / 2) + ($("input[name=location_id][value=" + store_data['id'] + "]").height() / 2))
                            }, 1200);
                        } else {
                            $("#deliveryGeoSearchField").val(store_data['user_postcode']);
                            $("#deliveryGeoSearchField").siblings('.button').click();
                        }
                    }, 1000);
                });
                window.ZapietEvent.listen('widget_loaded', function () {
                    setTimeout(function () {
                        $("#deliveryGeoSearchField").val(store_data['user_postcode']);
                        $("#deliveryGeoSearchField").siblings('.button').click();
                    }, 1000);

                });
            }
        } else if (window.location.pathname.indexOf('/cart') !== -1) {
            $("#storePickupApp").after('<button type="button" name="select-store" class="cart-recap__checkout button button--primary button--full button--large" data-action="open-modal" aria-controls="StoreAvailabilityModal-picker" aria-label="Select store">Select your Palmers store</button>');
            $("#storePickupApp").remove();
            $("button[name=checkout]").remove();
        }
    }

    let product_recommendations_updated = false;
    if ($('.product-recommendations') && localStorage["selectedStore"]) {
        $('.product-recommendations').on('DOMSubtreeModified', function () {
            if (!product_recommendations_updated) {
                product_recommendations_updated = true;
                attachCLicksToavailabilityOpeners();
				// console.log('NOTE: DOMSubtreeModified has fired for .product-recommendations and runCartStockCheck() running because .product-recommendations present AND selectedStore set in localStorage');
                runCartStockCheck();
            }
        });
    }
    $(document).on('theme:loading:end', e => {
        if (localStorage["selectedStore"] && $('.line-sku').length > 0) {
            attachCLicksToavailabilityOpeners();
			// console.log('NOTE: theme:loading:end has fired and runCartStockCheck() running because selectedStore set in localStorage AND .line-sku is present');
            runCartStockCheck();
        }
    })
    const attachCLicksToavailabilityOpeners = function () {
        $(".item-availability-modal-opener").on('click touch', function (e) {
            const sku = $(this).data('sku');
            const title = $(this).data('title');
            if (sku && localStorage["selectedStore"]) {
                $('#general-availability-modal .modal__title').html(title)
                $('#general-availability-modal .store-availabilities-list.modal__content').html('<h4>Loading...</h4>')
                runProductPageStockCheck(sku);
            }
            else {
                return false;
            }
        });
    }
    if (localStorage["selectedStore"]) {
        attachCLicksToavailabilityOpeners();
    }

    $('#account_information__value--signup_method select').on('change', function () {
        const $card = $('#general_information__value--card');
        const $receipt = $('#general_information__value--receipt');
        if ($(this).find(':selected').val() == 'new') {
            $card.parent().prop("hidden", true);
            $card.prop("required", false);
            $receipt.parent().prop("hidden", false);
        }
        else {
            $card.parent().prop("hidden", false);
            $card.prop("required", true);
            $receipt.parent().prop("hidden", true);
        }
    });

    $('#customer_api_login').on('submit', function (e) {
        const $form = $(this);
        const $redirect = $form.find('#customer_api_login_redirect');
        const $register_login = $form.hasClass('register-login') ? true : false;
        const return_url = $form.find('#customer_api_login_return').val();
        const redirect = $form.find('#customer_api_login_redirect').val();
        const $submit = $form.find('.form__submit').eq(0);
        const $alert = $form.find('#login-form-error');
        if (!redirect) {
            (async () => {
                try {
                    console.log('Fetching data...')
                    const fd = new FormData(document.querySelector("#customer_api_login"));
                    fd.delete('redirect');
                    const res = await fetch('https://palmers-api.calibratenz.dev:8443/v1/shopify/login', { method: 'POST', body: fd }).then(res => res.json());
                    if (res && res.multipass_token) {
                        // Success, redirecting...
                        console.log('Success, redirecting...')
                        $redirect.val(res.multipass_token);
						// Cleaning up login & pass fields so the wont be sent as part of the get request
						$form.find('#customer_api_login_email').val('');
						$form.find('#customer_api_login_password').val('');
                        $form.submit();
                    }
                    else {
                        // User not found...
                        $submit.prop("disabled", false);
                        $submit.removeClass('button--disabled');
                        $submit.addClass('button--primary');
                        if (res && res.message) $alert.html(res.message);
                        else $alert.html('Something went wrong, please try again later or contact support (#E0A)...')
                        $alert.prop("hidden", false);
                        console.log('User not found...');
						if($register_login) window.location.replace("/account/login");
                    }
                } catch (error) {
                    console.log('Something went wrong, please try again later or contact support (#E0B)...');
                    $submit.prop("disabled", false);
                    $submit.removeClass('button--disabled');
                    $submit.addClass('button--primary');
                    console.log(error);
					if($register_login) window.location.replace("/account/login");
                }
            })();
            // In progress...
            console.log('Login in progress...');
            $submit.prop("disabled", true);
            $submit.addClass('button--disabled');
            $submit.removeClass('button--primary');
            return false;
        }
        else {
            console.log('Applying token...')
            $form.attr('action', return_url + 'login/multipass/' + redirect);
            $form.attr('method', 'get');
        }
    });
    $('#edit_password form').on('submit', function (e) {
        const $form = $(this);
        const $redirect = $form.find('#customer_api_login_redirect');
        const redirect = $form.find('#customer_api_login_redirect').val();
        const return_url = $form.find('#customer_api_login_return').val();
        const $submit = $form.find('.form__submit').eq(0);
        const $alert = $form.find('#login-form-error');

        if (!redirect) {
            (async () => {
                try {
                    console.log('Fetching data...')
                    const fd = new FormData(document.querySelector("#edit_password form"));
                    fd.delete('redirect');
                    const res = await fetch('https://palmers-api.calibratenz.dev:8443/v1/shopify/passwordChange', {
                        method: 'POST',
                        headers: {
                            'X-UserToken': $('#tokens--access').length ? $('#tokens--access').html() : ''
                        },
                        body: fd
                    }).then(res => res.json());
                    if (res && res.multipass_token) {
                        // Success, redirecting...
                        console.log('Success, logging out...')
                        const logout = await fetch('/account/logout');
                        console.log('Redirecting...')
                        $redirect.val(res.multipass_token);
                        $form.submit();
                    }
                    else {
                        // User not found...
                        $submit.prop("disabled", false);
                        $submit.removeClass('button--disabled');
                        $submit.addClass('button--primary');
                        if (res && res.message) $alert.html(res.message);
                        else $alert.html('Something went wrong, please try again later or contact support (#E1A)...')
                        $alert.prop("hidden", false);
                        console.log('User not found...');
                    }
                } catch (error) {
                    console.log('Something went wrong, please try again later or contact support (#E1B)...');
                    $submit.prop("disabled", false);
                    $submit.removeClass('button--disabled');
                    $submit.addClass('button--primary');
                    console.log(error);
                }
            })();
            // In progress...
            console.log('Password change in progress...');
            $submit.prop("disabled", true);
            $submit.addClass('button--disabled');
            $submit.removeClass('button--primary');
            return false;
        }
        else {
            console.log('Applying token...')
            $form.attr('action', return_url.split('/').filter(v => v != 'addresses').join('/') + '/login/multipass/' + redirect);
            $form.attr('method', 'get');
        }
    });
    $('#general_information form, #preferred_store form').on('submit', function (e) {
        const $form = $(this);
        const $submit = $form.find('.form__submit');
        const $alert = $form.find('.alert.alert--error');

        const $fields = {
            fname: $('#general_information__value--fname'),
            lname: $("#general_information__value--lname"),
            email: $("#general_information__value--email"),
            mphone: $("#general_information__value--mphone"),
            hphone: $("#general_information__value--hphone"),
            bday: $("#general_information__value--bday"),
            gender: $("#general_information__value--gender"),
            store: $("#general_information__value--store"),
        }

        // In progress...
        console.log('Updating account bio...');
        $submit.prop("disabled", true);
        $submit.addClass('button--disabled');
        $submit.removeClass('button--primary');

        (async () => {
            try {
                console.log('Sending data...')
                const res = await fetch('https://palmers-api.calibratenz.dev:8443/v1/auth/ares-update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-UserToken': $('#tokens--access').length ? $('#tokens--access').html() : ''
                    },
                    body: JSON.stringify({
                        ...(v => v ? { FirstName: v } : {})($fields.fname.val() || null),
                        ...(v => v ? { LastName: v } : {})($fields.lname.val() || null),
                        ...(v => v ? { EmailAddress: v } : {})($fields.email.val() || null),
                        ...(v => v ? { LandlineNumber: v } : {})($fields.hphone.val() || null),
                        ...(v => v ? { MobileNumber: v } : {})($fields.mphone.val() || null),
                        ...(v => v ? { DateOfBirth: v } : {})($fields.bday.val() || null),
                        ...(v => v ? { Gender: v } : {})($fields.gender.val() || 'Female'),
                        ...(v => v ? { PreferredBranch: v } : {})($fields.store.val() || 998),
                    })
                }).then(res => res.json());

                if (res && res.customerId) {
                    // Success, refreshing...
                    console.log('Success, refreshing...')
                    window.location.reload()
                }
                else {
                    // User not found...
                    $submit.prop("disabled", false);
                    $submit.removeClass('button--disabled');
                    $submit.addClass('button--primary');
                    if (res && res.message) $alert.html(res.message);
                    else $alert.html('Something went wrong, please try again later or contact support (#E2A)...')
                    $alert.prop("hidden", false);
                    console.log('User not found...');
                }
            } catch (error) {
                console.log('Something went wrong, please try again later or contact support (#E2B)...');
                $submit.prop("disabled", false);
                $submit.removeClass('button--disabled');
                $submit.addClass('button--primary');
                console.log(error);
            }
        })();
        return false;
    });
    $('#create_customer').on('submit', function (e) {
        const $form = $(this);
        const $submit = $form.find('.form__submit');
        const $alert = $form.find('.alert.alert--error');

        const $fields = {
            fname: $('#general_information__value--fname'),
            lname: $("#general_information__value--lname"),
            email: $("#general_information__value--email"),
            password: $("#general_information__value--password"),
            repassword: $("#general_information__value--repassword"),
            mphone: $("#general_information__value--mphone"),
            hphone: $("#general_information__value--hphone"),
            store: $("#general_information__value--store"),
            card: $("#general_information__value--card"),
            receipt: $("#general_information__value--receipt"),
            terms: $("#general_information__value--terms"),
            recaptcha: $form.find('.ca_recaptcha'),
        }

        // In progress...
        console.log('Creating account...');
        $submit.prop("disabled", true);
        $submit.addClass('button--disabled');
        $submit.removeClass('button--primary');

        (async () => {
            try {
                console.log('Sending data...')
                const res = await fetch('https://palmers-api.calibratenz.dev:8443/v1/auth/ares-register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...(v => v ? { FirstName: v } : {})($fields.fname.val() || null),
                        ...(v => v ? { LastName: v } : {})($fields.lname.val() || null),
                        ...(v => v ? { EmailAddress: v } : {})($fields.email.val() || null),
                        ...(v => v ? { LandlineNumber: v } : { LandlineNumber: '' })($fields.hphone.val() || null),
                        ...(v => v ? { MobileNumber: v } : {})($fields.mphone.val() || null),
                        ...(v => v ? { PreferredBranch: v } : {})($fields.store.val() || 998),
                        ...(v => v ? { Password: v } : {})($fields.password.val() || null),
                        ...(v => v ? { ConfirmPassword: v } : {})($fields.repassword.val() || null),
                        ...(v => {
                            //card & receipt = both
                            if (v.card && v.receipt) return {
                                CardNumber: v.card,
                                ReceiptNumber: v.receipt
                            }
                            //cards ! recipt = card
                            if (v.card && !v.receipt) return {
                                CardNumber: v.card
                            }
                            //!card & receipt = receipt
                            if (!v.card && v.receipt) return {
                                ReceiptNumber: v.receipt
                            }
                            return { ReceiptNumber: '' }
                        })({
                            card: $fields.card.val() || null,
                            receipt: $fields.receipt.val() || null,
                        }),
                        AcceptedTerms: $fields.terms.checked || $fields.terms.prop("checked") || $fields.terms.is(":checked") ? true : false,
                        SignupType: $fields.card.val() ? 'Existing' : 'New',
						recaptcha: $fields.recaptcha ? $fields.recaptcha.val() : ''
                    })
                }).then(res => res.json());

                if (res && res.ar_id) {
                    // Success, refreshing...
                    console.log('Success, logging in...')
					$('#customer_api_login').find('#customer_api_login_email').val($fields.email.val());
					$('#customer_api_login').find('#customer_api_login_password').val($fields.password.val());
					// $('#customer_api_login').submit();
					$('#customer_api_login button').click();
                    // window.location.replace("/account/login");
					return false;
                }
                else {
                    // User not found...
                    $submit.prop("disabled", false);
                    $submit.removeClass('button--disabled');
                    $submit.addClass('button--primary');
                    if (res && res.message) $alert.html(res.message);
                    else $alert.html('Something went wrong, please try again later or contact support (#E3A)...')
                    $alert.prop("hidden", false);
                    console.log('User not created...');
                }
            } catch (error) {
                console.log('Something went wrong, please try again later or contact support (#E3B)...');
                $submit.prop("disabled", false);
                $submit.removeClass('button--disabled');
                $submit.addClass('button--primary');
                console.log(error);
            }
        })();
        return false;
    });
    $('#customer_api_reset').on('submit', function (e) {
        const $form = $(this);
        const $submit = $form.find('.form__submit');
        const $alert = $form.find('.alert.alert--error');

        const $fields = {
            password: $("#reset_password__value--password"),
            repassword: $("#reset_password__value--repassword"),
            recaptcha: $form.find('.ca_recaptcha'),
        }

        const return_url = $("#reset_password__input--return_url").val() || '';

        // In progress...
        console.log('Changing password...');
        $submit.prop("disabled", true);
        $submit.addClass('button--disabled');
        $submit.removeClass('button--primary');

        (async () => {
            try {
                console.log('Sending data...')
                const gets = new URLSearchParams(window.location.search);
                const res = await fetch('https://palmers-api.calibratenz.dev:8443/v1/shopify/passwordRecover', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RecoverToken': gets.get('token') || ''
                    },
                    body: JSON.stringify({
                        ...(v => v ? { password: v } : {})($fields.password.val() || null),
                        ...(v => v ? { repassword: v } : {})($fields.repassword.val() || null),
                        ...(v => v ? { recaptcha: v } : {})($fields.recaptcha.val() || null),
                    })
                }).then(res => res.json());

                if (res && res.multipass_token) {
                    // Success, refreshing...
                    console.log('Success, refreshing...')
                    window.location.replace(return_url + 'login/multipass/' + res.multipass_token);
                }
                else {
                    // User not found...
                    $submit.prop("disabled", false);
                    $submit.removeClass('button--disabled');
                    $submit.addClass('button--primary');
                    if (res && res.message) $alert.html(res.message);
                    else $alert.html('Something went wrong, please try again later or contact support (#E3A)...')
                    $alert.prop("hidden", false);
                    console.log('User not created...');
                }
            } catch (error) {
                $alert.html('Something went wrong, please try again later or contact support (#E3B)...')
                $alert.prop("hidden", false);
                $submit.prop("disabled", false);
                $submit.removeClass('button--disabled');
                $submit.addClass('button--primary');
                console.log(error);
            }
        })();
        return false;
    });
    $('#recover_customer_password').on('submit', function (e) {
        const $form = $(this);
        const $submit = $form.find('.form__submit');
        const $alert = $form.find('.alert.alert--error');
        const $success = $form.find('.alert.alert--success');

        const $fields = {
            email: $("#customer_recover__value--email"),
        }

        // In progress...
        console.log('Checking account...');
        $submit.prop("disabled", true);
        $submit.addClass('button--disabled');
        $submit.removeClass('button--primary');

        (async () => {
            try {
                console.log('Sending data...')
                const res = await fetch('https://palmers-api.calibratenz.dev:8443/v1/shopify/requestPasswordRecover', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...(v => v ? { email: v } : {})($fields.email.val() || null),
                    })
                }).then(res => res.json());
                console.log(res);
                if (!res.message) {
                    // Success...
                    console.log('Success!')
                    $submit.prop("disabled", false);
                    $submit.removeClass('button--disabled');
                    $submit.addClass('button--primary');
                    if (res && res.message) $success.html(res.message);
                    else $success.html('We have sent you a recovery link! If your email exists in our database, you should recieve the link in a few minutes.')
                    $success.prop("hidden", false);
                }
                else {
                    // User not found...
                    $submit.prop("disabled", false);
                    $submit.removeClass('button--disabled');
                    $submit.addClass('button--primary');
                    if (res && res.message) $alert.html(res.message);
                    else $alert.html('Something went wrong, please try again later or contact support (#E4A)...')
                    $alert.prop("hidden", false);
                    console.log('User not created...');
                }
            } catch (error) {
                $alert.html('Something went wrong, please try again later or contact support (#E4B)...')
                $alert.prop("hidden", false);
                console.log('Something went wrong, please try again later or contact support (#E4B)...');
                $submit.prop("disabled", false);
                $submit.removeClass('button--disabled');
                $submit.addClass('button--primary');
                console.log(error);
            }
        })();
        return false;
    });
	$('.ca_recaptcha_form').prepend("<input type='hidden' name='recaptcha' class='ca_recaptcha' value='' />");
	$('.ca_recaptcha_form').find('.form__submit').click(function(){
		const $form = $(this).parents('.ca_recaptcha_form').eq(0);
		const $recaptcha = $form.find('.ca_recaptcha');
        grecaptcha.ready(function() {
          grecaptcha.execute('6Le_irYhAAAAAAPdmUHQz5bC3IDBo8F5QxslSeL3', {action: 'submit'}).then(function(token) {
			$recaptcha.val(token);
			$form.submit();
          });
        });
		return false;
	})
});