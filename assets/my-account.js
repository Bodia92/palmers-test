$(document).ready(function(){
	// Cookies by https://stackoverflow.com/a/1599291/5645836
	const createCookie = (name, value, minutes) => {
		if (minutes) {
			var date = new Date();
			date.setTime(date.getTime() + (minutes * 60 * 1000));
			var expires = "; expires=" + date.toGMTString();
		}
		else var expires = "";

		document.cookie = name + "=" + value + expires + "; path=/";
	}

	const readCookie = name => {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	}

	const eraseCookie = name => {
		createCookie(name, "", -1);
	}

	const tokens = {
		access: $('#tokens--access').html(),
		refresh: $('#tokens--refresh').html(),
	};

	const cookie = readCookie('ca_pointstogo_top');
	if(cookie) $(".login_btn__text p + p").find('span').html(cookie || '');
	const filter = $('#tokens--api_filters').length ? parseInt($('#tokens--api_filters').html()) : 4;

	if($('#tokens--api_filters').length || (!$('#tokens--api_filters').length && !cookie))
		(async () => {
			try {
				const genderFormat = g => g == 'Unknown' ? 'Other' : g;

				const $tohide = $('#dashboard_block__in--tohide');
				const $toshow = $('#dashboard_block__in--toshow');
				const $svg = $('#dashboard_block__points_graph--svg');

				const $fname = $("#account_information__value--fname");
				const $lname = $("#account_information__value--lname");
				const $email = $("#account_information__value--email");
				const $mphone = $("#account_information__value--mphone");
				const $hphone = $("#account_information__value--hphone");
				const $regdate = $("#account_information__value--regdate");
				const $bday = $("#account_information__value--bday");
				const $gender = $("#account_information__value--gender");
				const $store = $("#account_information__value--store");
				const $store_select = $("#account_information__value--store_select").find('select').eq(0);

				const $edit_form = {
					fname: $('#general_information__value--fname'),
					lname: $("#general_information__value--lname"),
					email: $("#general_information__value--email"),
					mphone: $("#general_information__value--mphone"),
					hphone: $("#general_information__value--hphone"),
					bday: $("#general_information__value--bday"),
					gender: $("#general_information__value--gender"),
					store: $("#general_information__value--store"),
				}

				const $points = $("#account_information__value--points");
				const $pointstogo = $("#account_information__value--pointstogo, .account_information__value--pointstogo");
				const $pointstogo_top = $(".login_btn__text p + p");
				const $dollars = $("#account_information__value--dollars");
				const $expire = $("#account_information__value--expire");

				const $coupons_table = $("#account_information__value--coupons");
				const $history_table = $("#account_information__value--history");

				const res = await fetch('https://palmers-api.calibratenz.dev:8443/v1/loyalty?filter=' + filter, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'X-LoyaltyToken': tokens.access
					}
				}).then(res => res.json());
				// console.log('RESULT:', res);
				if(res && res.member) {

					// Dashboard & Account Details

					$fname.html(res.firstName || '');
					$lname.html(res.lastName || '');
					$email.html(res.address ? res.address.email || '' : '');
					$mphone.html(res.address ? res.address.mobile || '' : '');
					$hphone.html(res.address ? res.address.phone || '' : '');
					$regdate.html(new Date(res.startDate || 0).toISOString().slice(0, 10).split('-').reverse().join('/'));
					if(!res.dateOfBirth || res.dateOfBirth.slice(0, 10) == '1900-01-01') $bday.html('');
					else $bday.html(new Date(res.dateOfBirth || 0).toISOString().slice(0, 10).split('-').reverse().join('/'));
					$gender.html(genderFormat(res.sex) || '');

					$points.html(res.points == 'undefined' ? '' : res.points);
					$pointstogo.find('span').html(res.pointsToGo || '');
					createCookie('ca_pointstogo_top', res.pointsToGo, 30);
					$pointstogo_top.find('span').html(res.pointsToGo || '');
					$dollars.html('<span>$</span>' + ((res.rewardDollars || 0) * -1));

					if(!res.expiry)
						$expire.html('');
					else {
						$expire.find('span').eq(0).html(res.expiry.value * -1);
						$expire.find('span').eq(1).html(res.expiry.humanDate.slice(0, 10).split('-').reverse().join('/'));
					}
					for(i = 0; i < 10; i++) {
						$svg.find('g').eq(i).find('path').removeClass();
						$svg.find('g').eq(i).find('path').addClass(Math.floor((100 - parseInt(res.pointsToGo || 0)) / 10) <= i ? 'st0' : 'st1');
					}

					// Froms

					if($store.length) {
						const $store_select_option = $store_select.find('option[value="'+(res.branchId || 0)+'"]');
						$store.html($store_select_option.html());
						$store_select_option.prop("selected",true).trigger("change");
					}

					$edit_form.fname.val(res.firstName || '');
					$edit_form.lname.val(res.lastName || '');
					$edit_form.email.val(res.address ? res.address.email || '' : '');
					$edit_form.mphone.val(res.address ? res.address.mobile || '' : '');
					$edit_form.hphone.val(res.address ? res.address.phone || '' : '');
					if(!res.dateOfBirth || res.dateOfBirth.slice(0, 10) == '1900-01-01') $edit_form.bday.val('');
					else $edit_form.bday.val(new Date(res.dateOfBirth || 0).toISOString().slice(0, 10));
					$edit_form.gender.find('option[value="'+(res.sex || 'Female')+'"]').prop("selected",true).trigger("change");

					// My Rewards

					if(res.coupons && res.coupons.length) {
						const $mould = $coupons_table.find('tbody tr').eq(0);
						$coupons_table.find('tbody tr').eq(0).remove();
						res.coupons.map(v => {
							const $clone = $mould.clone();
							$clone.find('td').eq(0).html('$' + v.value.toFixed(2));
							$clone.find('td').eq(1).html(v.status);
							$clone.find('td').eq(2).html(v.issueDate.slice(0, 10).split('-').reverse().join('/'));
							$clone.find('td').eq(3).html(v.expirationDate.slice(0, 10).split('-').reverse().join('/'));
							$clone.find('td').eq(4).html(v.redemptionDate == '-' ? v.redemptionDate : v.redemptionDate.slice(0, 10).split('-').reverse().join('/'));
							if(v.status == "Issued") $clone.addClass('active_state_mod');
							$coupons_table.find('tbody').append($clone);
						});
					}

					// In-Store Orders

					if(res.transactions && res.transactions.length) {
						if($history_table.length) {
							const $mould = $history_table.find('tbody tr').eq(0);
							$history_table.find('tbody tr').eq(0).remove();
							res.transactions.map(v => {
								const $clone = $mould.clone();
								$clone.find('td').eq(0).html(v.date.slice(0, 10).split('-').reverse().join('/'));
								// $clone.find('td').eq(1).html('---');
								$clone.find('td').eq(1).html(v.store);
								$clone.find('td').eq(2).html('$' + v.value.toFixed(2));
								$clone.find('td').eq(3).html(v.points + ' points');
								$clone.find('td').eq(4).html(v.pointsBalance + ' points');
								$clone.find('td').eq(5).find('a').attr('href', '/account?view=transaction&transaction='+v.transactionId).prop('hidden', false);
								$history_table.find('tbody').append($clone);
							});
						}
						const gets = new URLSearchParams(window.location.search);
						if(gets.get('transaction')) {
							const transaction = res.transactions.filter(v => v.transactionId == gets.get('transaction'))[0];

							const $breadcrumb_order_id = $('#account_information__value--breadcrumb_order_id').eq(0);
							const $order_id = $('#account_information__value--order_id').eq(0);
							const $order_date = $('#account_information__value--order_date').eq(0);
							const $order_table = $('#account_information__value--order_table').eq(0);
							const $order_total = $('#account_information__value--order_total').eq(0);

							if(transaction && transaction.lines && transaction.lines.length) {
								$order_date.html(transaction.date.slice(0, 10).split('-').reverse().join('/'));
								$breadcrumb_order_id.html(gets.get('transaction'));
								$order_id.html(gets.get('transaction'));
								$order_total.html('$'+transaction.value.toFixed(2));

								const $mould = $order_table.find('tbody tr').eq(0);
								$order_table.find('tbody tr').eq(0).remove();
								transaction.lines.map(v => {
									const $clone = $mould.clone();
									$clone.find('td').eq(0).html(v.description);
									$clone.find('td').eq(1).html(v.quantity);
									$clone.find('td').eq(2).html(v.extension.toString().slice(0,1) == '-' ? '-$' + v.extension.toString().slice(1) : '$' + v.extension.toFixed(2));
									$order_table.find('tbody').append($clone);
								})
							}
						}
					}

					$tohide.prop( "hidden", true );
					$toshow.prop( "hidden", false );
				}
				else {
					// TO-DO: Log out the user or refresh tokens & reload page
					// 1. Send out the request to refresh the token
					const res = await fetch('https://palmers-api.calibratenz.dev:8443/v1/shopify/refreshTokens', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							refreshToken: tokens.refresh
						})
					}).then(res => res.json());
					// 2. If success, refresh the page
					if(res && res.access && res.access.token) window.location.reload();
					else {
						// 3. If failed, logout
						$('.misc-hide_next_element').remove();
						const logout = await fetch('/account/logout');
						if(logout.status == 200) window.location.reload(); // hit logout behind the scenes & refresh the page to show the login form
						else window.location.replace("/account/logout"); // try to redirect to logout rather than fetching it if failed
					}
				}
			} catch (error) {
				console.log('Error', error);
			}
		})();
});