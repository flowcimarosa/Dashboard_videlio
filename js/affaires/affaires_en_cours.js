const capitalref = getUrlVars().cr;
const comref = getUrlVars().com;
const clientref = getUrlVars().client;
let capitalName = '';
let commercialName = '';
let clientName = '';
let enCoursAffaires = 0;
let enRetardAffaires = 0;
const dataChanged = [];
let enPause = 1;
const today = moment().format('YYYY[-]MM[-]DD');

/** ******************************************* Affichage Bandeau Haut  ****************************************** */
/** ************************************************************************************************************** */
const pageTitle = 'Affaires en cours';
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

/** ********************************* Récupération et reformatage des données  *********************************** */
/** ************************************************************************************************************** */

$.getJSON(
  `http://10.1.2.7:3000/requests/affairesencours/0/${capitalref}/${comref}/${clientref}`,
  function(data) {
    data.map(result => {
      enCoursAffaires += 1;
      let retardCond = 0;
      if (result.pseudo_client === '') {
        result.pseudo_client = result.Nom_Client;
      }
      if (
        result.cloture_prevu < today ||
        result.cloture_prevu === null ||
        result.cloture_prevu === '0000-00-00'
      ) {
        retardCond += 1;
        result.retard = 1;
      } else if (
        result.etude_cocher === 1 &&
        (result.avancement_etude_date_plan_implantation < today ||
          result.avancement_etude_date_plan_implantation === null ||
          result.avancement_etude_date_plan_implantation === '0000-00-00') &&
        result.avancement_etude_percent_plan_implantation < 100
      ) {
        retardCond += 1;
        result.retard = 1;
      } else if (
        result.doe_cocher === 1 &&
        (result.avancement_doe_date < today ||
          result.avancement_doe_date === null ||
          result.avancement_doe_date === '0000-00-00') &&
        result.avancement_doe_percent < 100
      ) {
        retardCond += 1;
        result.retard = 1;
      } else if (
        result.atelier_cocher === 1 &&
        (result.avancement_integration_date_preparation_atelier < today ||
          result.avancement_integration_date_preparation_atelier === null ||
          result.avancement_integration_date_preparation_atelier ===
            '0000-00-00') &&
        result.avancement_integration_percent_preparation_atelier < 100
      ) {
        result.retard = 1;
        retardCond += 1;
      } else if (
        result.programmation_cocher === 1 &&
        (result.avancement_integration_date_prog_expert < today ||
          result.avancement_integration_date_prog_expert === null ||
          result.avancement_integration_date_prog_expert === '0000-00-00') &&
        result.avancement_integration_percent_prog_expert < 100
      ) {
        result.retard = 1;
        retardCond += 1;
      } else if (
        result.formation_cocher === 1 &&
        (result.avancement_formation_date < today ||
          result.avancement_formation_date === null ||
          result.avancement_formation_date === '0000-00-00') &&
        result.avancement_formation_percent < 100
      ) {
        result.retard = 1;
        retardCond += 1;
      } else if (
        (result.avancement_integration_date_maillage_mecanique < today ||
          result.avancement_integration_date_maillage_mecanique === null ||
          result.avancement_integration_date_maillage_mecanique ===
            '0000-00-00') &&
        result.avancement_integration_percent_maillage_mecanique < 100
      ) {
        result.retard = 1;
        retardCond += 1;
      } else if (
        (result.avancement_integration_date_integration_equipement < today ||
          result.avancement_integration_date_integration_equipement === null ||
          result.avancement_integration_date_integration_equipement ===
            '0000-00-00') &&
        result.avancement_integration_percent_integration_equipement < 100
      ) {
        result.retard = 1;
        retardCond += 1;
      } else {
        result.retard = 0;
        retardCond = 0;
      }
      if (retardCond > 0) {
        enRetardAffaires += 1;
      }
      if (
        result.cloture_prevu !== null &&
        result.cloture_prevu !== '0000-00-00'
      ) {
        result.cloture_prevu = formatDate(result.cloture_prevu);
      } else {
        result.cloture_prevu = 'Inconnue';
      }

      dataChanged.push(result);
    });
    $('#EnRetard').html(enRetardAffaires);
    /* * Fin Récupération et reformatage des données   */

    $('#EnCours').html(enCoursAffaires);

    // Generation du tableau
    $(document).ready(function() {
      const table = $('#table').DataTable({
        data: dataChanged,
        columns: [
          { data: 'retard' },
          { data: 'cloture_prevu' },
          { data: 'numero_cv' },
          { data: 'pseudo_client' },
          { data: 'Description_Offer' },
          { data: 'affectation_cdp' },
          { data: 'affectation_cdc' },
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
            createdCell(td, cellData, rowData, row, col) {
              if (rowData.retard === 1) {
                $(td).css('background', '#F44336');
                $(td).css('color', '#ffffff');
              }
            }
          },
          {},
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
