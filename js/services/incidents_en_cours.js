const capitalref = getUrlVars().cr;
let capitalName = '';
const clientref = getUrlVars().client;
const ownerref = getUrlVars().owner;
const ownername = '';
let clientName = '';
let incidentsEnCours = 0;
let critiquesEnCours = 0;
const dateGtr = '';
const dateCreation = '';
let dataChanged = [];
let enPause = 1;
const today = moment().format('YYYY[-]MM[-]DD');

/** ******************************************* Affichage Bandeau Haut  ****************************************** */
/** ************************************************************************************************************** */
const pageTitle = 'Incidents en cours';
$(document).prop('title', pageTitle);
$('#pageTitle').html(pageTitle);
$('#gaucheTexte').html('En cours : ');
$('#droiteTexte').html('Urgents : ');

// Cas BU - Titre
if (ownerref === '0' && clientref === '0') {
  $('#groupTitle').append(' - BU : ');
  if (capitalref === 'total') {
    capitalName = 'NATIONAL';
  } else {
    capitalName = capitalref;
  }
  $('#filterTitle').html(capitalName);
}
// Cas Client- Titre
if (ownerref === '0' && clientref !== '0') {
  $('#groupTitle').append(' - Client : ');
  $.getJSON(
    `http://10.1.2.7:3100/requests/ListClientCasebyId/${clientref}`,
    function(data) {
      clientName = data[0].AccountName;
      $('#filterTitle').html(clientName);
    }
  );
}

// Cas Owner - Titre
if (ownerref !== '0' && clientref === '0') {
  $('#groupTitle').append(' - Intervenant : ');
  $.getJSON(
    `http://10.1.2.7:3100/requests/ListOwnerNamebyId/${ownerref}`,
    function(data) {
      ownerName = data[0].OwnerName;
      $('#filterTitle').html(ownerName);
    }
  );
}

// Récupération et reformatage des données
const getIncidentsList = (year = 0) =>
  new Promise(function(resolve, reject) {
    fetch(
      `http://10.1.2.7:3100/requests/incidentsList/0/${year}/${capitalref}/${ownerref}/${clientref}`
    ).then(response => {
      response.json().then(json => {
        json.forEach(element => {
          incidentsEnCours += 1;
          if (element.Type === '') {
            element.Type = 'Vide';
          }
          if (element.Priority === '') {
            element.Priority = 'Vide';
          }
          if (element.Date_de_la_continuite_service__c === '') {
            element.Date_de_la_continuite_service__c = 'En cours';
          }
          if (element.Territoire_du_site_1__c === '') {
            element.Territoire_du_site_1__c = 'Non renseigné';
          }
          if (
            element.Date_de_la_continuite_service__c == 'En cours' &&
            (element.Priority === 'Critique' || element.Priority === 'Haute')
          ) {
            element.retard = 1;
            element.Date_de_la_continuite_service__c = 'Urgent';
            critiquesEnCours += 1;
          } else {
            element.retard = 0;
          }
          if (
            element.Date_de_la_continuite_service__c !== 'Urgent' &&
            element.Date_de_la_continuite_service__c !== 'En cours'
          ) {
            element.tempsGTR = gtrOuvresCalc(
              element.Date_de_la_continuite_service__c,
              element.CreatedDate
            );
            element.Date_de_la_continuite_service__c = formatDate(
              element.Date_de_la_continuite_service__c
            );
            element.CreatedDate = formatDate(element.CreatedDate);
            element.GTR = 1;
          } else {
            element.tempsGTR = gtrOuvresCalc(today, element.CreatedDate);
            element.CreatedDate = formatDate(element.CreatedDate);
            element.GTR = 0;
          }
        });
        $('#EnCours').html(incidentsEnCours);
        $('#EnRetard').html(critiquesEnCours);
        dataChanged = json;

        resolve();
      });
    });
  }).then(json => {
    // Generation du tableau
    const table = $('#table').DataTable({
      data: dataChanged,
      columns: [
        { data: 'retard' },
        { data: 'CaseNumber' },
        { data: 'CreatedDate' },
        { data: 'Objet_du_ticket__c' },
        { data: 'Type' },
        { data: 'Status' },
        { data: 'Priority' },
        { data: 'Date_de_la_continuite_service__c' },
        { data: 'Territoire_du_site_1__c' },
        { data: 'Action_attendue__c' },
        { data: 'tempsGTR' },
        { data: 'GTR' }
      ],
      columnDefs: [
        {
          targets: 0,
          visible: false,
          searchable: false
        },
        {
          targets: 11,
          visible: false,
          searchable: false
        },
        {
          targets: 7,
          createdCell(td, cellData, rowData, row, col) {
            if (rowData.retard == 1) {
              $(td).css('background', '#F44336');
              $(td).css('color', '#ffffff');
            }
            if (rowData.GTR == 1) {
              $(td).css('background', '#33691E');
              $(td).css('color', '#ffffff');
            }
          }
        },
        {
          targets: 10,
          createdCell(td, cellData, rowData, row, col) {
            if (rowData.retard == 1 || rowData.tempsGTR >= 20) {
              $(td).css('background', '#F44336');
              $(td).css('color', '#ffffff');
            }
            if (rowData.GTR == 1 && rowData.tempsGTR < 20) {
              $(td).css('background', '#33691E');
              $(td).css('color', '#ffffff');
            }
          }
        }
      ],
      language: {
        lengthMenu: 'Afficher _MENU_ résultats par page',
        zeroRecords: 'Pas de résultat',
        info: '_PAGE_ / _PAGES_ pages',
        infoEmpty: 'Pas de résultat',
        infoFiltered: '(filtre sur _MAX_ total lignes)'
      },
      pageLength: 13,
      scrollCollapse: true,
      pageResize: false,
      fixedHeader: true,
      responsive: true,
      searching: false,
      paging: true,
      ordering: false,
      lengthChange: false,
      dom:
        '<"bottom row"<"col"<"pageDiv">>"<"col"<"row justify-content-center navDiv">>"<"col"<"row justify-content-end dateDiv">>'
    });
    function infos() {
      return {
        page: table.page.info().page,
        pages: table.page.info().pages
      };
    }
    /** *************************************Gestion Bas de Page Tableau ********************************* */
    $('div.dateDiv').append('<a></a>');

    /** ************** Previous Button ************ */
    $('div.navDiv').append(
      "<div class='col text-center' id='previousButton'>Previous</div>"
    );
    $('#previousButton').click(function() {
      if (infos().page === 0) {
        table.page('last').draw('page');
      } else {
        table.page('previous').draw('page');
      }
      $('div.pageDiv a').html(`${infos().page + 1}/${infos().pages} Pages`);
    });

    /** ************** Pause Button ************ */
    $('div.navDiv').append(
      "<div class='col text-center' id='pauseButton'>Pause</div>"
    );
    $('#pauseButton').click(function() {
      if (enPause === 1) {
        interval = setInterval(function() {
          $('#pauseButton').html('Pause');
          if (infos().page + 1 == infos().pages) {
            table.page('first').draw('page');
          } else {
            table.page('next').draw('page');
          }
          $('div.pageDiv a').html(`${infos().page + 1}/${infos().pages} Pages`);
        }, 30000);
        enPause = 0;
      } else {
        clearInterval(interval);
        $('#pauseButton').html('Play');
        enPause = 1;
      }
    });

    /** ************** Next Button *********** */
    $('div.navDiv').append("<div class='col text-center' id='nextButton'>Next");
    $('#nextButton').click(function() {
      if (infos().page + 1 == infos().pages) {
        table.page('first').draw('page');
        $('div.pageDiv a').html(`${infos().page + 1}/${infos().pages} Pages`);
      } else {
        table.page('next').draw('page');
        $('div.pageDiv a').html(`${infos().page + 1}/${infos().pages} Pages`);
      }
    });
    $('div.pageDiv').append('<a></a>');
    $('div.pageDiv a').html(`${infos().page + 1}/${infos().pages} Pages`);

    /** ************************************* Reload ********************************* */
    $('#pauseButton').click();
    setInterval(function() {
      const date = moment().format('DD[/]MM[/]YYYY [|] HH[:]mm[:]ss');
      $('div.dateDiv a').html(date);
    }, 1000);
  });

/** ***************************************Chargement scripts onload ************* */
window.onload = function() {
  /** ***********************Chargement des Graphiques onload ********************* */
  getIncidentsList().then;
};

function formatDate(date) {
  date = moment(date).format('DD[-]MM[-]YYYY');
  return date;
}

function gtrCalc(dateend, datestart) {
  const gtr = (
    (moment(dateend) - moment(datestart)) /
    (60 * 60 * 24 * 1000)
  ).toFixed(0);
  return gtr;
}

function gtrOuvresCalc(dateend, datestart) {
  let gtrOuvres = 0;
  const gtr = (
    (moment(dateend) - moment(datestart)) /
    (60 * 60 * 24 * 1000)
  ).toFixed(0);
  let i = 0;
  while (i < gtr) {
    if (moment(datestart).day() < 5) {
      gtrOuvres += 1;
    }
    datestart = moment(datestart).add(1, 'd');
    i += 1;
  }
  return gtrOuvres;
}

function getUrlVars() {
  const vars = [];
  let hash = '';
  const hashes = window.location.href
    .slice(window.location.href.indexOf('?') + 1)
    .split('&');
  for (let i = 0; i < hashes.length; i += 1) {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}
