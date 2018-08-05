//Configure aqui o endereço e a porta do Arduino
//var url_global= "http://geninho.homeip.net:88";
var url_global= "http://geninhofloripa.ddns.net:82";

$.support.cors = true;

// FUNCAO  UM  - MONTA
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
        const larguraBotao = (dimerizavel == '1') ? 3 ? 6;

        $('.row').append(
          '<div class="bloco\
            col-lg-' +larguraBotao+' col-sm-' +larguraBotao+' \
            col-md-' +larguraBotao+' col-xs-' +larguraBotao+'" \
            id="div_botao_' +digitalPin+' ">\
            <button style="background-image:url(images/' +digitalPin+ '_'+verbo+'.jpg);"\
              id="botao_'+digitalPin+'" class="btn btn-large btn-primary botao '+classe_botao+'" \
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
      alert("The XML file could not be processed correctly.");
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
          const addClass = (statusPin == '1') ? 'ligado' : 'desligado';
          const removeClass = (statusPin == '1') ? 'desligado' : 'ligado';

          $("#botao_"+digitalPin).attr("data-comando", command);
          $("#botao_"+digitalPin).attr("data-status", statusPin);
          $("#botao_"+digitalPin).html(namePin);
          $("#botao_"+digitalPin).removeClass(removeClass);
          $("#botao_"+digitalPin).addClass(addClass);
          $("#botao_"+digitalPin).css("background-image", "url(images/" + digitalPin + "_" + verb + ".jpg)");
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





// FUNCAO  T R E S -   CHECA ESTADO
function checaEstado() {

  $.ajax({
    type: "GET",
    crossDomain: true,
    url: url_global,
    async : true,
    contentType: "text/xml",
    dataType: "xml",

    success: function(xml) {
      $(xml).find('Pin').each(function(index){
        var digitalPin = $(this).find('digitalPin').text();
        var statusPin = $(this).find('Estado').text();
        var namePin = $(this).find('namePin').text();
        //var tipoPin= $(this).find('Tipo').text();

        if (namePin=="") namePin= digitalPin;

        var status_atual= $("#botao_"+digitalPin).attr("data-status");

        //se o estado do botão em questão for diferente do que foi servido, anima e troca...

        if (status_atual!=statusPin) {

          var comando, verbo, classe_retirar, classe_adicionar;

          if (statusPin=="1") {
            comando="OFF";
            verbo= "ON";
            classe_adicionar= "ligado";
            classe_retirar= "desligado";
          }
          else {
            comando="ON";
            verbo= "OFF";
            classe_adicionar= "desligado";
            classe_retirar= "ligado";
          }

          $("#botao_"+digitalPin).attr("data-comando", comando);
          $("#botao_"+digitalPin).attr("data-status", statusPin);

          //if (tipoPin!="2") {
          $("#botao_"+digitalPin).html(namePin);

          $("#botao_"+digitalPin).removeClass(classe_retirar);
          //}

          $("#botao_"+digitalPin).addClass(classe_adicionar);

          $("#botao_"+digitalPin).css("background-image", "url(images/"+digitalPin+"_"+verbo+".jpg)");
        }
      });


    },
    error: function() {
      alert("The XML File could not be processed correctly. E agora?");
    }

  });

}





// FUNCAO   Q U A T R O   -     M A G I C A
$(document).ready(function() {

  setupComponentsOnUI();

  setInterval(function() {
    checaEstado();
  }, 15000);


  $(document).on('click', '.botao', function() {

    var pino=              $(this).attr("data-pino");
    var nome=              $(this).attr("data-nome");
    var comando=           $(this).attr("data-comando");
    var requerConfirmacao= $(this).attr("data-requerconfirmacao");
    var passa= 0;


    if ((requerConfirmacao=="1") && (comando=="ON")) {

      passa= confirm("Tem realmente certeza absoluta que realmente fazer isto?");
    }
    else {

      passa=1;
    }


    if (passa) {

      sendToArduino(pino, comando);
    }

  });

});
