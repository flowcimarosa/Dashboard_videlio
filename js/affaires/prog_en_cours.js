let capitalref = getUrlVars()['cr'];
let comref = getUrlVars()['com'];
let clientref = getUrlVars()['client'];
let capitalName = '';
let commercialName = '';
let clientName = '';
let enCoursProg = '';
let enRetardProg = '';
let dataChanged = [];
let enPause = 1;
const today = moment().format('YYYY[-]MM[-]DD');

/** ******************************************* Affichage Bandeau Haut  ****************************************** */
/** ************************************************************************************************************** */
const pageTitle = 'Programmation en cours';
$(document).prop('title', pageTitle);
$('#pageTitle').html(pageTitle);
$('#gaucheTexte').html('En cours : ');
$('#droiteTexte').html('En retard : ');

// Cas BU - Titre
if (comref === '0' && clientref === '0') {
  $('#groupTitle').append(' - BU : ');
  if (capitalref === 'total') {
    capitalName = 'NATIONAL';
  } else {
    $.getJSON('http://10.1.2.7:3000/requests/CapitaleRegion', function(data) {
      $.each(data, function(a, b) {
        if (capitalref === b.Code_Capitale_Regionale) {
          capitalName = b.Capitale_Regionale;
        }
      });
      $('#filterTitle').html(capitalName);
    });
  }
  $('#filterTitle').html(capitalName);
}

// Cas Commercial - Titre
if (comref !== '0' && clientref === '0') {
  $('#groupTitle').append(' - Commercial : ');
  $.getJSON(
    `http://10.1.2.7:3000/requests/NomCommercialbyId/${comref}`,
    function(data) {
      commercialName = data[0].Name_Vendeur;
      $('#filterTitle').html(commercialName);
    }
  );
}

// Cas Client - Titre
if (comref === '0' && clientref !== '0') {
  $('#groupTitle').append(' - Client : ');
  $.getJSON(
    `http://10.1.2.7:3000/requests/NomClientbyId/${clientref}`,
    function(data) {
      clientName = data[0].Nom_Client;
      $('#filterTitle').html(clientName);
    }
  );
}

//Récupération et reformatage des données
$.getJSON(
  'http://10.1.2.7:3000/requests/progencours/0/' +
    capitalref +
    '/' +
    comref +
    '/' +
    clientref,
  function(data) {
    $.each(data, function(key, result) {
      if (result.avancement_integration_percent_prog_expert === 100) {
        return;
      }
      if (result.pseudo_client == '') {
        result.pseudo_client = result.Nom_Client;
      }
      if (
        result.cloture_prevu < today ||
        result.cloture_prevu === null ||
        result.cloture_prevu === '0000-00-00'
      ) {
        enRetardProg++;
        result.retard = 1;
      } else if (
        (result.avancement_integration_date_prog_expert < today ||
          result.avancement_integration_date_prog_expert === null ||
          result.avancement_integration_date_prog_expert === '0000-00-00') &&
        result.avancement_integration_percent_prog_expert !== 100
      ) {
        enRetardProg++;
        result.retard = 1;
      } else {
        result.retard = 0;
      }
      if (
        result.avancement_integration_date_prog_expert !== null &&
        result.avancement_integration_date_prog_expert !== '0000-00-00'
      ) {
        result.avancement_integration_date_prog_expert = formatDate(
          result.avancement_integration_date_prog_expert
        );
      } else {
        result.avancement_integration_date_prog_expert = 'Inconnue';
      }
      if (result.avancement_integration_percent_prog_expert !== 100) {
        enCoursProg++;
      }
      dataChanged.push(result);
    });
    $('#EnCours').html(enCoursProg);
    $('#EnRetard').html(enRetardProg);
    // Generation du tableau
    $(document).ready(function() {
      let table = $('#table').DataTable({
        data: dataChanged,
        columns: [
          { data: 'retard' },
          { data: 'avancement_integration_date_prog_expert' },
          { data: 'numero_cv' },
          { data: 'pseudo_client' },
          { data: 'Description_Offer' },
          { data: 'ref_prog' },
          { data: 'avancement_integration_percent_prog_expert' },
          { data: 'affectation_prog' },
          { data: 'type_projet' }
        ],
        columnDefs: [
          {
            targets: 0,
            visible: false,
            searchable: false
          },
          {
            targets: 1,
            createdCell: function(td, cellData, rowData, row, col) {
              if (rowData.retard == 1) {
                $(td).css('background', '#F44336');
                $(td).css('color', '#ffffff');
              }
            }
          },
          {
            targets: 2
          },
          {
            targets: 3
          },
          {
            targets: 4
          },
          {
            targets: 5
          },
          {
            targets: 6
          },
          {
            targets: 7
          },
          {
            targets: 8
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
          $('#pauseButton').html('Pause');
          interval = setInterval(function() {
            if (infos().page + 1 == infos().pages) {
              table.page('first').draw('page');
            } else {
              table.page('next').draw('page');
            }
            $('div.pageDiv a').html(
              `${infos().page + 1}/${infos().pages} Pages`
            );
          }, 30000);
          enPause = 0;
        } else {
          clearInterval(interval);
          $('#pauseButton').html('Play');
          enPause = 1;
        }
      });

      /** ************** Next Button *********** */
      $('div.navDiv').append(
        "<div class='col text-center' id='nextButton'>Next"
      );
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
  }
);

function formatDate(date) {
  date = moment(date).format('DD[-]MM[-]YYYY');
  return date;
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
