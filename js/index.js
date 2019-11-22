let capitalesList = [];
let countTotal = 0;
let countRetardTotal = 0;

/*********************************************************
 * Fonction Génération Tableau National
 *********************************************************/

$.getJSON('http://10.1.2.7:3000/requests/projetscount/0', function(data) {
  //Nationale
  $.each(data, function(a, b) {
    if (b.Capitale_Regionale == 'Gennevilliers') {
      countTotal += b['Chiffres'];
      $('#totalGennevilliers').html(b['Chiffres']);
    }
    if (b.Capitale_Regionale == 'Guyane') {
      countTotal += b['Chiffres'];
      $('#totalAutres').html(b['Chiffres']);
    }
    if (b.Capitale_Regionale == 'Lyon') {
      countTotal += b['Chiffres'];
      $('#totalLyon').html(b['Chiffres']);
    }
    if (b.Capitale_Regionale == 'Marseille') {
      countTotal += b['Chiffres'];
      $('#totalMarseille').html(b['Chiffres']);
    }
    if (b.Capitale_Regionale == 'Rennes') {
      countTotal += b['Chiffres'];
      $('#totalRennes').html(b['Chiffres']);
    }
    if (b.Capitale_Regionale == 'Scenotechnique') {
      countTotal += b['Chiffres'];
      $('#totalScenotechnique').html(b['Chiffres']);
    }
    if (b.Capitale_Regionale == 'Strasbourg') {
      countTotal += b['Chiffres'];
      $('#totalStrasbourg').html(b['Chiffres']);
    }
    if (b.Capitale_Regionale == 'Toulouse') {
      countTotal += b['Chiffres'];
      $('#totalToulouse').html(b['Chiffres']);
    }
  });
  $('#totalDossier').html(countTotal);
});

$.getJSON('http://10.1.2.7:3000/requests/projetsretardcount/0', function(data) {
  //Nationale
  $.each(data, function(a, b) {
    if (b.Capitale_Regionale == 'Gennevilliers') {
      countRetardTotal += b['Chiffres'];
      $('#totalRetardGennevilliers').html(b['Chiffres']);
    }
    if (b.Capitale_Regionale == 'Guyane') {
      countRetardTotal += b['Chiffres'];
      $('#totalRetardAutres').html(b['Chiffres']);
    }
    if (b.Capitale_Regionale == 'Lyon') {
      countRetardTotal += b['Chiffres'];
      $('#totalRetardLyon').html(b['Chiffres']);
    }
    if (b.Capitale_Regionale == 'Marseille') {
      countRetardTotal += b['Chiffres'];
      $('#totalRetardMarseille').html(b['Chiffres']);
    }
    if (b.Capitale_Regionale == 'Rennes') {
      countRetardTotal += b['Chiffres'];
      $('#totalRetardRennes').html(b['Chiffres']);
    }
    if (b.Capitale_Regionale == 'Scenotechnique') {
      countRetardTotal += b['Chiffres'];
      $('#totalRetardScenotechnique').html(b['Chiffres']);
    }
    if (b.Capitale_Regionale == 'Strasbourg') {
      countRetardTotal += b['Chiffres'];
      $('#totalRetardStrasbourg').html(b['Chiffres']);
    }
    if (b.Capitale_Regionale == 'Toulouse') {
      countRetardTotal += b['Chiffres'];
      $('#totalRetardToulouse').html(b['Chiffres']);
    }
  });
  $('#totalRetardDossier').html(countRetardTotal);
});

function addUrlNational(element) {
  $(element).attr('href', function() {
    return this.href + '?cr=total&com=0&client=0';
  });
}

/*********************************************************
 * Fonction Génération Tableau Service
 *********************************************************/

async function getTicketsCountByType() {
  let numberTotal = 0;
  const list = await fetch(
    `http://10.1.2.7:3100/requests/ticketscounts/0/0/total/0/0/type`
  )
    .then(response => {
      return response.json();
    })
    .catch(error => {
      return `ListTicketsCounts request error : ${error}`;
    });
  list.forEach(number => {
    numberTotal += number.nombre;
    if (number.Type === 'Devis') {
      const totalRMA = document.getElementById('totalDevis');
      totalRMA.insertAdjacentHTML('beforeEnd', number.nombre);
    }
    if (number.Type === 'Preparation Produit') {
      const totalPrepa = document.getElementById('totalPrepa');
      totalPrepa.insertAdjacentHTML('beforeEnd', number.nombre);
    }
    if (number.Type === 'RMA') {
      const totalRMA = document.getElementById('totalRMA');
      totalRMA.insertAdjacentHTML('beforeEnd', number.nombre);
    }
  });
  const totalTickets = document.getElementById('totalTickets');
  totalTickets.insertAdjacentHTML('beforeEnd', numberTotal);
  return list;
}

async function incidentsListbyPriority() {
  let numberTotal = 0;
  const list = await fetch(
    `http://10.1.2.7:3100/requests/ticketscounts/0/0/total/0/0/incident`
  )
    .then(response => {
      return response.json();
    })
    .catch(error => {
      return `ListTicketsCounts request error : ${error}`;
    });
  list.forEach(number => {
    numberTotal += number.nombre;
    if (number.Priority === 'Critique') {
      const totalCritiques = document.getElementById('totalCritiques');
      totalCritiques.insertAdjacentHTML('beforeEnd', number.nombre);
    }
  });
  const totalIncidents = document.getElementById('totalIncidents');
  totalIncidents.insertAdjacentHTML('beforeEnd', numberTotal);
}
getTicketsCountByType().then(() => incidentsListbyPriority());

/*********************************************************
 * Fonction Génération Select  Affaires Capitale ou BU
 *********************************************************/
let $input, val, list, match, capitale, region;
$.getJSON('http://10.1.2.7:3000/requests/CapitaleRegion', function(data) {
  $.each(data, function(a, b) {
    $(`#affCR`).append(
      $('<option></option>')
        .attr('value', b.Code_Capitale_Regionale)
        .text(b.Capitale_Regionale)
    );
  });
  $('select.selectAffCapitale').selectpicker('refresh');
});

$(document).ready(function() {
  $('select.selectAffCapitale').change(function() {
    if (val !== '') {
      $('.btn-affCapitale')
        .addClass('enabled')
        .removeClass('disabled');
    }
    capitale = $(this).val();
  });
});

function addUrlCR(element) {
  $(element).attr('href', function() {
    return this.href + '?cr=' + capitale + '&com=0&client=0';
  });
}

/*********************************************************
 * Fonction Génération Select  Affaires Commercial
 *********************************************************/

$.getJSON('http://10.1.2.7:3000/requests/listCommerciaux', function(data) {
  $.each(data, function(a, b) {
    if (b.Name_Vendeur !== '') {
      $(`#affCom`).append(
        $('<option></option>')
          .attr('value', b.Code_Vendeur1)
          .text(b.Name_Vendeur)
      );
    }
  });
  $('select.selectAffCom').selectpicker('refresh');
});

$(document).ready(function() {
  $('select.selectAffCom').change(function() {
    if (val !== '') {
      $('.btn-affCom')
        .addClass('enabled')
        .removeClass('disabled');
    }
    commercial = $(this).val();
  });
});

function addUrlCom(element) {
  $(element).attr('href', function() {
    return this.href + '?cr=total&com=' + commercial + '&client=0';
  });
}

/*********************************************************
 * Fonction Génération Select Affaires Client
 *********************************************************/

$.getJSON('http://10.1.2.7:3000/requests/listClients', function(data) {
  $.each(data, function(a, b) {
    if (b.Nom_Client !== '') {
      $(`#affClient`).append(
        $('<option></option>')
          .attr('value', b.N_Client)
          .text(b.Nom_Client)
      );
    }
  });
  $('select.selectAffClient').selectpicker('refresh');
});

$(document).ready(function() {
  $('select.selectAffClient').change(function() {
    if (val !== '') {
      $('.btn-affClient')
        .addClass('enabled')
        .removeClass('disabled');
    }
    client = $(this).val();
  });
});

function addUrlClient(element) {
  $(element).attr('href', function() {
    return this.href + '?cr=total&com=0&client=' + client;
  });
}

/*********************************************************
 * Fonction Génération Select Service National
 *********************************************************/

function addUrlServiceNational(element) {
  $(element).attr('href', function() {
    return this.href + '?cr=total&client=0&owner=0';
  });
}

/*********************************************************
 * Fonction Génération Select Service Région
 *********************************************************/

$.getJSON('http://10.1.2.7:3100/requests/listRegion', function(data) {
  $.each(data, function(a, b) {
    if (b.Territoire_du_site_1__c !== '') {
      $(`#serviceRegion`).append(
        $('<option></option>')
          .attr('value', b.Territoire_du_site_1__c)
          .text(b.Territoire_du_site_1__c)
      );
    }
  });
  $('select.selectServiceRegion').selectpicker('refresh');
});

$(document).ready(function() {
  $('select.selectServiceRegion').change(function() {
    if (val !== '') {
      $('.btn-serviceRegion')
        .addClass('enabled')
        .removeClass('disabled');
    }
    region = $(this).val();
  });
});

function addUrlServiceRegion(element) {
  $(element).attr('href', function() {
    return this.href + '?cr=' + region + '&client=0&owner=0';
  });
}

/*********************************************************
 * Fonction Génération Select Service Client
 *********************************************************/

$.getJSON('http://10.1.2.7:3100/requests/ListClientCase', function(data) {
  $.each(data, function(a, b) {
    if (b.AccountName !== '') {
      $(`#serviceClient`).append(
        $('<option></option>')
          .attr('value', b.AccountId)
          .text(b.AccountName)
      );
    }
  });
  $('select.selectServiceClient').selectpicker('refresh');
});

$(document).ready(function() {
  $('select.selectServiceClient').change(function() {
    if (val !== '') {
      $('.btn-serviceClient')
        .addClass('enabled')
        .removeClass('disabled');
    }
    serviceClient = $(this).val();
  });
});

function addUrlServiceClient(element) {
  $(element).attr('href', function() {
    return this.href + '?cr=total&client=' + serviceClient + '&owner=0';
  });
}

/*********************************************************
 * Fonction Génération Select Service Owner
 *********************************************************/

$.getJSON('http://10.1.2.7:3100/requests//ListOwnerName', function(data) {
  $.each(data, function(a, b) {
    if (b.OwnerName !== '') {
      $(`#serviceOwner`).append(
        $('<option></option>')
          .attr('value', b.OwnerId)
          .text(b.OwnerName)
      );
    }
  });
  $('select.selectServiceOwner').selectpicker('refresh');
});

$(document).ready(function() {
  $('select.selectServiceOwner').change(function() {
    if (val !== '') {
      $('.btn-serviceOwner')
        .addClass('enabled')
        .removeClass('disabled');
    }
    serviceOwner = $(this).val();
  });
});

function addUrlServiceOwner(element) {
  $(element).attr('href', function() {
    return this.href + '?cr=total&client=0&owner=' + serviceOwner;
  });
}
