
$.support.cors = true;

const url_global= "http://geninhofloripa.ddns.net:82";
const REFRESH_TIME_MS = 15000;

const replies = {
    'XML_ISSUE' :'The XML file could not be processed correctly.',
    'CONFIRMATION' :'Are you sure you sure you really want to do that?',
};

// FUNCTION ONE: Receive the XML from Arduino and builds UI based on the XML
function setupComponentsOnUI() {

  $.ajax({
    type: "GET",
    crossDomain: true,
    url: url_global,
    async : true,
    contentType: "text/xml",
    dataType: "xml",

    success: function(xml) {
      $("#loading").remove();
      $(xml).find('Pin').each(function(index){

        const digitalPin = $(this).find('digitalPin').text();
        const statusPin = $(this).find('Estado').text();
        const requerConfirmacao = $(this).find('requerConfirmacao').text();
        const dimerizavel = $(this).find('dimerizavel').text();
        const pulso = $(this).find('pulso').text();

        let namePin = $(this).find('namePin').text();
        if (namePin == '') namePin = digitalPin;

        const comando = (statusPin == '1') ? 'OFF' : 'ON';
        const verbo = (statusPin == '1') ? 'ON' : 'OFF';
        const classe_botao = (statusPin == '1') ? 'ligado' : 'desligado';
        const larguraBotao = (dimerizavel == '1') ? 3 : 6;

        $('.row').append(
          '<div class="bloco\
            col-lg-' +larguraBotao+' col-sm-' +larguraBotao+' \
            col-md-' +larguraBotao+' col-xs-' +larguraBotao+'" \
            id="div_botao_' +digitalPin+' ">\
            <button \
              id="botao_'+digitalPin+'" class="btn btn-large botao '+classe_botao+'" \
              data-status="' +statusPin+ '" data-nome="' +namePin+' " \
              data-requerconfirmacao="' +requerConfirmacao+ '" \
              data-dimerizavel="' +dimerizavel+ '" \
              data-pulso="' +pulso+ '" \
              data-comando="' +comando+ '" \
              data-pino="' +digitalPin+ '">' +namePin+ '\
            </button>\
          </div>');
      });
    },
    error: function() {
      alert(message['XML_ISSUE']);
    }
  });
}


// FUNCTION TWO: Send a GET request to Arduino with a new value for a pin and updates UI
function sendToArduino(pin, value) {

  $("#div_botao_" + pin + " .img_loading").css("display", "block");

  $.ajax({
    type: "GET",
    crossDomain: true,
    async : true,
    contentType: "text/xml",
    dataType: "xml",
    url: url_global,

    //Value to be sent to Arduino on the GET request, according to parameters given
    data: 'PIN' + pin + '=' + value,

    success: function(xml) {
      $("#div_botao_" + pin + " .img_loading").hide();

      $(xml).find('Pin').each(function(index){
        const digitalPin = $(this).find('digitalPin').text();
        const statusPin = $(this).find('Estado').text();
        const pulse = $(this).find('pulso').text();

        let namePin = $(this).find('namePin').text();
        if (namePin == '') namePin = digitalPin;

        const currentStatus= $("#botao_" + digitalPin).attr("data-status");
        // If the pin value we received is different from our current UI, we need to update the UI
        if (currentStatus != statusPin) {
          const command = (statusPin == '1') ? 'OFF' : 'ON';
          const verb = (statusPin == '1') ? 'ON' : 'OFF';
          const shouldAddClass = (statusPin == '1') ? 'ligado' : 'desligado';
          const shouldRemoveClass = (statusPin == '1') ? 'desligado' : 'ligado';

          $("#botao_"+digitalPin).attr("data-comando", command);
          $("#botao_"+digitalPin).attr("data-status", statusPin);
          $("#botao_"+digitalPin).html(namePin);
          $("#botao_"+digitalPin).removeClass(shouldRemoveClass);
          $("#botao_"+digitalPin).addClass(shouldAddClass);
        }
        // If it's the same (it means other app has updated it), then UI doesn't need to be changed
        else {
          if ((pulse == '1') && (digitalPin == pin)) {
            $("#botao_" + digitalPin).attr("class", "ligado");
            setTimeout(function() {
              $("#botao_" + digitalPin).attr("class", "desligado");
            }, 250);
          }
        }
      });
    }
  });
}

// FUNCTION 3: Receives a new XML from Arduino and updates the UI if needed
function checkArduinoState() {

  $.ajax({
    type: "GET",
    crossDomain: true,
    url: url_global,
    async : true,
    contentType: "text/xml",
    dataType: "xml",

    success: function(xml) {

      //TODO: Remove all duplicated code between Funtions 2 and 3
      $(xml).find('Pin').each(function(index){
        const digitalPin = $(this).find('digitalPin').text();
        const statusPin = $(this).find('Estado').text();
        const pulse = $(this).find('pulso').text();

        let namePin = $(this).find('namePin').text();
        if (namePin == '') namePin = digitalPin;

        const currentStatus= $("#botao_" + digitalPin).attr("data-status");
        // If the pin value we received is different from our current UI, we need to update the UI
        if (currentStatus != statusPin) {
          const command = (statusPin == '1') ? 'OFF' : 'ON';
          const verb = (statusPin == '1') ? 'ON' : 'OFF';
          const shouldAddClass = (statusPin == '1') ? 'ligado' : 'desligado';
          const shouldRemoveClass = (statusPin == '1') ? 'desligado' : 'ligado';

          $("#botao_"+digitalPin).attr("data-comando", command);
          $("#botao_"+digitalPin).attr("data-status", statusPin);
          $("#botao_"+digitalPin).html(namePin);
          $("#botao_"+digitalPin).removeClass(shouldRemoveClass);
          $("#botao_"+digitalPin).addClass(shouldAddClass);
        }
      });
    },
    error: function() {
      alert(message['XML_ISSUE']);
    }
  });
}

// FUNCION 4: Main
$(document).ready(function() {

  setupComponentsOnUI();

  setInterval(function() {
    checkArduinoState();
  }, REFRESH_TIME_MS);

  $(document).on('click', '.botao', function() {

    const pin = $(this).attr("data-pino");
    const name = $(this).attr("data-nome");

    const command = $(this).attr("data-comando");
    const requiresConfirmation = $(this).attr("data-requerconfirmacao");
    const needsUserConfirmation = (requiresConfirmation == '1') && (command == 'ON')

    let commandIsAuthorized = true;
    if (needsUserConfirmation) commandIsAuthorized = confirm(message['CONFIRMATION']);
    if (commandIsAuthorized) sendToArduino(pin, command);
  });
});
