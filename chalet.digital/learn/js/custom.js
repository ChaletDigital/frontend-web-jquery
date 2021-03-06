//Configure aqui o endere�o e a porta do Arduino
//var url_global= "http://geninho.homeip.net:88";
var url_global= "http://192.168.25.36:82";

$.support.cors = true;


// FUNCAO  U M  - MONTA
function monta() {
	 
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
	
		            var digitalPin = $(this).find('digitalPin').text();
		            var statusPin = $(this).find('Estado').text();
		            var namePin = $(this).find('namePin').text();
		            var requerConfirmacao = $(this).find('requerConfirmacao').text();
		            var dimerizavel = $(this).find('dimerizavel').text();
		            var pulso = $(this).find('pulso').text();
		            
		            if (namePin=="") namePin= digitalPin;
		            
		            
		            var comando, verbo, classe_botao;		            		            
		            if (statusPin=="1") {
		            
			            comando="OFF";  
			            verbo= "ON"; 
			            classe_botao= "ligado";
			    }
		            else {
		            
			            comando="ON";
			            verbo= "OFF";
			            classe_botao= "desligado";
			    }
		            
		            var larguraBotao;		            
		            if (dimerizavel=="1") larguraBotao=3;
		            else larguraBotao=6;
	
		            
		            $('.row').append('<div class="bloco\
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
		  
		     alert("The XML File could not be processed correctly.");
	          
	          }
	          
	  
     });
		 
}



 
 
// FUNCAO  D O I S  - 
function envia(pino, valor) {
    //console.log(pino+ " - " +valor);

    $("#div_botao_"+pino+" .img_loading").css("display", "block");
	
    $.ajax({
        type: "GET",
	crossDomain: true,
	async : true,
	contentType: "text/xml",
	dataType: "xml",
	url: url_global,
	  
	// valor a ser enviado ao Arduino para ligar ou desligar algo, de acordo com os par�metros
	data: 'PIN'+pino+'='+valor,
	  
	success: function(xml) { 
            $("#div_botao_"+pino+" .img_loading").hide();
          
            $(xml).find('Pin').each(function(index){      
	        var digitalPin =          $(this).find('digitalPin').text();
	        var statusPin =           $(this).find('Estado').text();
	        var namePin =             $(this).find('namePin').text();
	        var pulso =               $(this).find('pulso').text();
	           
	        if (namePin=="") namePin= digitalPin;
	            	 
	        var status_atual= $("#botao_"+digitalPin).attr("data-status");		        
		        
		// se o estado do bot�o em quest�o for diferente do que foi servido, anima e troca...
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
		    $("#botao_"+digitalPin).html(namePin);
		    $("#botao_"+digitalPin).removeClass(classe_retirar);
		    $("#botao_"+digitalPin).addClass(classe_adicionar);
		    $("#botao_"+digitalPin).css("background-image", "url(images/"+digitalPin+"_"+verbo+".jpg)");
		        
		
		}
		//se for igual quer dizer que outro app ligou ou desligou, ent�o n�o precisa fazer nada
		else {        
		    if ((pulso=="1") && (digitalPin==pino)) {
		        $("#botao_"+digitalPin).attr("class", "ligado");
		        
                        setTimeout(function() {
                            $("#botao_"+digitalPin).attr("class", "desligado");        
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
	        
	            //se o estado do bot�o em quest�o for diferente do que foi servido, anima e troca...
	        
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
	 
	 
	monta();
	
	
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
		 
		     envia(pino, comando);
		 }
		 
    });
    
});

