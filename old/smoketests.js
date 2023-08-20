let overall_response_quality = 'success';
function colorFor(responseQuality) {
  switch(responseQuality) {
    case 'degraded':
      return 'orange';
    case 'failure':
      return 'red';
    case 'success':
      return 'green';
  }
}

function updatedQuality(current, overall) {
  if (current == 'degraded' && overall == 'success') {
    return 'degraded';
  } else if (current == 'failure') {
    return 'failure';
  } else {
    return overall;
  }
}

function addDiv(value, test_name) {
  let div = document.createElement('div');
  let text = document.createTextNode(value);
  div.appendChild(text);
  $("#" + test_name + "_results_area").append($(div));
  return $(div);
}

function handleBeforeSend(test_name) {
  $("#" + test_name + "_results_area").empty();
  $("#" + test_name + "_indicator").text('running ...');
  $("#" + test_name + "_indicator").css('color', 'white');
  $("#" + test_name + "_indicator").prop('bgColor', 'grey');
}

function handleError(test_name) {
  $("#" + test_name + "_indicator").text('server error');
  $("#" + test_name + "_indicator").prop('color', 'white');
  $("#" + test_name + "_indicator").prop('bgColor', 'red');
}

function api_calls() {
  var calls = new Array();

  var call = new Map();
  call.set('name', 'GET beneficiary');
  call.set('url', 'http://localhost:3000/services/json/beneficiaries/ff1db153-bc97-4bfb-b83f-414572466050');
  call.set('service', 'services/json/beneficiaries/ff1db153-bc97-4bfb-b83f-414572466050');
  calls.push(call);

  var call = new Map();
  call.set('name', 'GET card order');
  call.set('url', 'http://localhost:3000/services/json/card_order/113');
  call.set('service', 'services/json/card_orders/113');
  calls.push(call);

  var call = new Map();
  call.set('name', 'GET card');
  call.set('url', 'http://localhost:3000/services/json/card/825392973');
  call.set('service', 'services/json/card/825392973');
  calls.push(call);

  var call = new Map();
  call.set('name', 'GET mobile challenge');
  call.set('url', 'http://localhost:3000/services/json/mobile_challenges?card_code=825392973');
  call.set('service', 'services/json/mobile_challenges?card_code=825392973');
  calls.push(call);

  var call = new Map();
  call.set('name', 'GET payment');
  call.set('url', 'http://localhost:3000/services/json/payment?guid=1234');
  call.set('service', 'services/json/mobile_challenges/payment?guid=1234');
  calls.push(call);

  return calls;
}

$(function() {
  $('#test_api').on('submit', function(e) {
    e.preventDefault();

    for (const call of api_calls()) {
      const start = Date.now();
      $.ajax({
        url: call.get('url'),
        method: 'get',
        dataType: 'json',
        username: 'webuser1',
        password: 'webuser1',
        success: function(data, textStatus, jqXHR) {
          const benchmark = (Date.now() - start) / 1000;

          $("#test_api_indicator").text('');
      
          if (benchmark > 0.1) {
            response_quality = 'degraded';
          } else {
            response_quality = 'success';
          }

          overall_response_quality = updatedQuality(response_quality, overall_response_quality);
  
          let div = addDiv(call.get('name'), 'test_api');
          $(div).css('color', colorFor(response_quality));

          addDiv('Service: ' + call.get('service'), 'test_api');
          addDiv('Response: ' + response_quality, 'test_api');
          addDiv('Duration: ' + benchmark, 'test_api');
    
          if (jqXHR.status != 200) {
            addDiv('Message: ' +jqXHR.response, 'test_api');
          }

          let hr = document.createElement('hr');
          $("#test_api_results_area").append($(hr));
      
          $("#test_api_indicator").prop('bgColor', colorFor(overall_response_quality));
        },
        beforeSend: function(data, textStatus, jqXHR) {
          handleBeforeSend('test_api');
        },
        error: function(data, textStatus, jqXHR) {
          handleError('test_api');
        }
      });
    }
  });
  
  $('#test_vendors').on('submit', function(e) {
    e.preventDefault();
    $.ajax({
      url: '/smoke_tests?test=vendors',
      method: 'post',
      data: $(this).serialize(),
      success: function(data, textStatus, jqXHR) {
        $("#test_vendors_indicator").text('');
        let overall_response_quality = 'green';
    
        $(data).each(function() {
          let response_quality = this['response_quality'];
          overall_response_quality = updatedQuality(response_quality, overall_response_quality);

          let div = addDiv(this['name'], 'test_vendors');
          $(div).css('color', colorFor(response_quality));

          addDiv('Service: ' + this['service'], 'test_vendors');
          addDiv('Response: ' + response_quality, 'test_vendors');

          let metrics = this['metrics'];
          if (metrics && metrics['duration']) {
            addDiv('Duration: ' + metrics['duration'], 'test_vendors');
          }
    
          if (this['message']) {
            addDiv('Message: ' + this['message'], 'test_vendors');
          }

          let hr = document.createElement('hr');
          $("#test_vendors_results_area").append($(hr));
        });
    
        $("#test_vendors_indicator").prop('bgColor', colorFor(overall_response_quality));
      },
      beforeSend: function(data, textStatus, jqXHR) {
        handleBeforeSend('test_vendors');
      },
      error: function(data, textStatus, jqXHR) {
        handleError('test_vendors');
      }
    });
  });

  $(document).on('ajax:send', function(event, data, status, xhr) {
    $("#results_area").empty();
    $("#indicator").text('running ...');
    $("#indicator").css('color', 'white');
    $("#indicator").prop('bgColor', 'grey');
  });

  $(document).on('ajax:error', function(event, data, status, xhr) {
    $("#indicator").text('server error');
    $("#indicator").prop('color', 'white');
    $("#indicator").prop('bgColor', 'red');
  });

});