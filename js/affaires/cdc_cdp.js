let capitalref = getUrlVars()['cr'];
let capitalName = '';
let cdcList = [];
let cdpList = [];
let userSelected = '';

let list = [];
let val = '';
let projects = {};
const today = moment().format('YYYY[-]MM[-]DD');
const anneeEncours = moment().format('YYYY');
/** ******************************************* Affichage Bandeau Haut  ****************************************** */
/** ************************************************************************************************************** */
const pageTitle = `${anneeEncours} - Stats CDC/CDP`;
$(document).prop('title', pageTitle);
$('#pageTitle').html(pageTitle);
$('#gaucheTexte').html('');
$('#droiteTexte').html('');

// Nom de la BU
$.getJSON('http://10.1.2.7:3000/requests/CapitaleRegion', function(data) {
  $('#groupTitle').append('');
  $.each(data, function(a, b) {
    if (b.Code_Capitale_Regionale == capitalref) {
      capitalName = b.Capitale_Regionale;
    }
    if (capitalref == 'total') {
      $('#filterTitle').html('');
    } else {
      $('#filterTitle').html('');
    }
  });
});

// Recupération Liste CDC
async function getCdcList() {
  const CdcList = await fetch(`http://10.1.2.7:3000/requests/getCdcList`).then(
    response =>
      response.json().then(json => {
        json.forEach(element => {
          cdcList.push(element.cdc);
        });
      })
  );
  return cdcList;
}
// Recupération Liste CDP
async function getCdpList() {
  const CdpList = await fetch(`http://10.1.2.7:3000/requests/getCdpList`).then(
    response =>
      response.json().then(json => {
        json.forEach(element => {
          cdpList.push(element.cdp);
        });
      })
  );
  return cdpList;
}

// Création Liste fusionné
async function setList() {
  const getList = await cdpList.forEach(element => {
    list.push(element);
  });
  cdcList.forEach(element => {
    list.push(element);
  });
  list = [...new Set(list)];
  list.forEach(element => {
    $(`#list`).append(
      $('<option></option>')
        .attr('value', element)
        .text(element)
    );
  });
  $('select').selectpicker('refresh');
  return list;
}

getCdcList()
  .then(() => getCdpList())
  .then(() => setList());

async function getProjectsbyCdp(cdp) {
  if (cdp === '') {
    return;
  }
  projects = {
    list: [],
    counts: {
      cdp: {
        pcd: {
          open: {
            number: 0,
            hoursToProduct: 0,
            hoursProducted: 0
          },
          closed: {
            number: 0,
            hoursProducted: 0
          }
        },
        pld: {
          open: {
            number: 0,
            hoursToProduct: 0,
            hoursProducted: 0
          },
          closed: {
            number: 0,
            hoursProducted: 0
          }
        }
      },
      cdc: {
        pcd: {
          open: {
            number: 0,
            hoursToProduct: 0,
            hoursProducted: 0
          },
          closed: {
            number: 0,
            hoursProducted: 0
          }
        },
        pld: {
          open: {
            number: 0,
            hoursToProduct: 0,
            hoursProducted: 0
          },
          closed: {
            number: 0,
            hoursProducted: 0
          }
        }
      }
    }
  };
  const cdpProjectsOpen = await fetch(
    `http://10.1.2.7:3000/requests/getProjectsByCdcCdp/0/total/0/0/0/${cdp}/0`
  ).then(response =>
    response.json().then(json => {
      json.forEach(element => {
        const calcTempsVendu = () => {
          let calc = 0;
          if (element.temps_vendu_cp > 0) {
            calc += element.temps_vendu_cp;
          } else {
            calc += element.Sum_MOI;
          }
          if (element.temps_vendu_cc > 0) {
            calc += element.temps_vendu_cc;
          } else {
            calc += element.Sum_MOCC;
          }
          if (element.temps_vendu_tech_etude > 0) {
            calc += element.temps_vendu_tech_etude;
          } else {
            calc += element.Sum_MOE;
          }
          if (element.temps_vendu_prog > 0) {
            calc += element.temps_vendu_prog;
          } else {
            calc += element.Sum_MOPS + element.Sum_MOPA;
          }
          if (element.temps_vendu_exp > 0) {
            calc += element.temps_vendu_exp;
          } else {
            calc += element.Sum_MOXA + element.Sum_MOXS;
          }
          if (element.temps_vendu_tech > 0) {
            calc += element.temps_vendu_tech;
          } else {
            calc +=
              element.Sum_MOCS +
              element.Sum_MOCA +
              element.Sum_MOTS +
              element.Sum_MOTA;
          }
          return calc;
        };
        let temps_vendu = calcTempsVendu();
        let hoursProducted = element.temps_previsionnel - element.temps_restant;
        let hourstoProduct = temps_vendu - hoursProducted;
        if (element.type_projet == 'PCD') {
          projects.counts.cdp.pcd.open.number += 1;
          projects.counts.cdp.pcd.open.hoursProducted += hoursProducted;
          projects.counts.cdp.pcd.open.hoursToProduct += hourstoProduct;
        }
        if (element.type_projet == 'PLD') {
          projects.counts.cdp.pld.open.number += 1;
          projects.counts.cdp.pld.open.hoursProducted += hoursProducted;
          projects.counts.cdp.pld.open.hoursToProduct += hourstoProduct;
        }
        let affaire = {};
        affaire.numero_cv = element.numero_cv;
        affaire.type = element.type_projet;
        affaire.client = element.Nom_Client;
        affaire.cdp = element.affectation_cdp;
        affaire.cdc = element.affectation_cdc;
        affaire.Description = element.Description_Offer;
        affaire.cloture = 0;
        affaire.temps_vendu = temps_vendu;
        affaire.temps_passe = hoursProducted.toFixed(0);
        affaire.temps_restants = (
          temps_vendu - element.temps_previsionnel
        ).toFixed(0);
        if (
          hoursProducted / temps_vendu == NaN ||
          hoursProducted / temps_vendu == Infinity
        ) {
          affaire.tp = 0;
        } else {
          affaire.tp = (hoursProducted / temps_vendu) * 100;
        }
        projects.list.push(affaire);
      });
    })
  );

  const cdpProjectsClosed = await fetch(
    `http://10.1.2.7:3000/requests/getProjectsByCdcCdp/1/total/${anneeEncours}/0/0/${cdp}/0`
  ).then(response =>
    response.json().then(json => {
      json.forEach(element => {
        const calcTempsVendu = () => {
          let calc = 0;
          if (element.temps_vendu_cp > 0) {
            calc += element.temps_vendu_cp;
          } else {
            calc += element.Sum_MOI;
          }
          if (element.temps_vendu_cc > 0) {
            calc += element.temps_vendu_cc;
          } else {
            calc += element.Sum_MOCC;
          }
          if (element.temps_vendu_tech_etude > 0) {
            calc += element.temps_vendu_tech_etude;
          } else {
            calc += element.Sum_MOE;
          }
          if (element.temps_vendu_prog > 0) {
            calc += element.temps_vendu_prog;
          } else {
            calc += element.Sum_MOPS + element.Sum_MOPA;
          }
          if (element.temps_vendu_exp > 0) {
            calc += element.temps_vendu_exp;
          } else {
            calc += element.Sum_MOXA + element.Sum_MOXS;
          }
          if (element.temps_vendu_tech > 0) {
            calc += element.temps_vendu_tech;
          } else {
            calc +=
              element.Sum_MOCS +
              element.Sum_MOCA +
              element.Sum_MOTS +
              element.Sum_MOTA;
          }
          return calc;
        };
        let temps_vendu = calcTempsVendu();
        let hoursProducted = element.temps_previsionnel - element.temps_restant;
        if (element.type_projet == 'PCD') {
          projects.counts.cdp.pcd.closed.number += 1;
          projects.counts.cdp.pcd.closed.hoursProducted += hoursProducted;
        }
        if (element.type_projet == 'PLD') {
          projects.counts.cdp.pld.closed.number += 1;
          projects.counts.cdp.pld.closed.hoursProducted += hoursProducted;
        }
        let affaire = {};
        affaire.numero_cv = element.numero_cv;
        affaire.type = element.type_projet;
        affaire.client = element.Nom_Client;
        affaire.cdp = element.affectation_cdp;
        affaire.cdc = element.affectation_cdc;
        affaire.Description = element.Description_Offer;
        affaire.cloture = 1;
        affaire.temps_vendu = temps_vendu;
        affaire.temps_passe = hoursProducted.toFixed(0);
        affaire.temps_restants = (
          temps_vendu - element.temps_previsionnel
        ).toFixed(0);
        if (
          hoursProducted / temps_vendu == NaN ||
          hoursProducted / temps_vendu == Infinity
        ) {
          affaire.tp = 0;
        } else {
          affaire.tp = (hoursProducted / temps_vendu) * 100;
        }
        projects.list.push(affaire);
      });
    })
  );
  const cdcProjectsOpen = await fetch(
    `http://10.1.2.7:3000/requests/getProjectsByCdcCdp/0/total/0/0/0/0/${cdp}`
  ).then(response =>
    response.json().then(json => {
      json.forEach(element => {
        const calcTempsVendu = () => {
          let calc = 0;
          if (element.temps_vendu_cp > 0) {
            calc += element.temps_vendu_cp;
          } else {
            calc += element.Sum_MOI;
          }
          if (element.temps_vendu_cc > 0) {
            calc += element.temps_vendu_cc;
          } else {
            calc += element.Sum_MOCC;
          }
          if (element.temps_vendu_tech_etude > 0) {
            calc += element.temps_vendu_tech_etude;
          } else {
            calc += element.Sum_MOE;
          }
          if (element.temps_vendu_prog > 0) {
            calc += element.temps_vendu_prog;
          } else {
            calc += element.Sum_MOPS + element.Sum_MOPA;
          }
          if (element.temps_vendu_exp > 0) {
            calc += element.temps_vendu_exp;
          } else {
            calc += element.Sum_MOXA + element.Sum_MOXS;
          }
          if (element.temps_vendu_tech > 0) {
            calc += element.temps_vendu_tech;
          } else {
            calc +=
              element.Sum_MOCS +
              element.Sum_MOCA +
              element.Sum_MOTS +
              element.Sum_MOTA;
          }
          return calc;
        };
        let temps_vendu = calcTempsVendu();
        let hoursProducted = element.temps_previsionnel - element.temps_restant;
        let hourstoProduct = temps_vendu - hoursProducted;
        if (element.type_projet == 'PCD') {
          projects.counts.cdc.pcd.open.number += 1;
          projects.counts.cdc.pcd.open.hoursProducted += hoursProducted;
          projects.counts.cdc.pcd.open.hoursToProduct += hourstoProduct;
        }
        if (element.type_projet == 'PLD') {
          projects.counts.cdc.pld.open.number += 1;
          projects.counts.cdc.pld.open.hoursProducted += hoursProducted;
          projects.counts.cdc.pld.open.hoursToProduct += hourstoProduct;
        }
        let affaire = {};
        affaire.numero_cv = element.numero_cv;
        affaire.type = element.type_projet;
        affaire.client = element.Nom_Client;
        affaire.cdp = element.affectation_cdp;
        affaire.cdc = element.affectation_cdc;
        affaire.Description = element.Description_Offer;
        affaire.cloture = 0;
        affaire.temps_vendu = temps_vendu;
        affaire.temps_passe = hoursProducted.toFixed(0);
        affaire.temps_restants = (
          temps_vendu - element.temps_previsionnel
        ).toFixed(0);
        if (
          hoursProducted / temps_vendu == NaN ||
          hoursProducted / temps_vendu == Infinity
        ) {
          affaire.tp = 0;
        } else {
          affaire.tp = (hoursProducted / temps_vendu) * 100;
        }
        projects.list.push(affaire);
      });
    })
  );

  const cdcProjectsClosed = await fetch(
    `http://10.1.2.7:3000/requests/getProjectsByCdcCdp/1/total/${anneeEncours}/0/0/0/${cdp}`
  ).then(response =>
    response.json().then(json => {
      json.forEach(element => {
        const calcTempsVendu = () => {
          let calc = 0;
          if (element.temps_vendu_cp > 0) {
            calc += element.temps_vendu_cp;
          } else {
            calc += element.Sum_MOI;
          }
          if (element.temps_vendu_cc > 0) {
            calc += element.temps_vendu_cc;
          } else {
            calc += element.Sum_MOCC;
          }
          if (element.temps_vendu_tech_etude > 0) {
            calc += element.temps_vendu_tech_etude;
          } else {
            calc += element.Sum_MOE;
          }
          if (element.temps_vendu_prog > 0) {
            calc += element.temps_vendu_prog;
          } else {
            calc += element.Sum_MOPS + element.Sum_MOPA;
          }
          if (element.temps_vendu_exp > 0) {
            calc += element.temps_vendu_exp;
          } else {
            calc += element.Sum_MOXA + element.Sum_MOXS;
          }
          if (element.temps_vendu_tech > 0) {
            calc += element.temps_vendu_tech;
          } else {
            calc +=
              element.Sum_MOCS +
              element.Sum_MOCA +
              element.Sum_MOTS +
              element.Sum_MOTA;
          }
          return calc;
        };
        let temps_vendu = calcTempsVendu();
        let hoursProducted = element.temps_previsionnel - element.temps_restant;
        if (element.type_projet == 'PCD') {
          projects.counts.cdc.pcd.closed.number += 1;
          projects.counts.cdc.pcd.closed.hoursProducted += hoursProducted;
        }
        if (element.type_projet == 'PLD') {
          projects.counts.cdc.pld.closed.number += 1;
          projects.counts.cdc.pld.closed.hoursProducted += hoursProducted;
        }
        let affaire = {};
        affaire.numero_cv = element.numero_cv;
        affaire.type = element.type_projet;
        affaire.client = element.Nom_Client;
        affaire.cdp = element.affectation_cdp;
        affaire.cdc = element.affectation_cdc;
        affaire.Description = element.Description_Offer;
        affaire.cloture = 1;
        affaire.temps_vendu = temps_vendu;
        affaire.temps_passe = hoursProducted.toFixed(0);
        affaire.temps_restants = (
          temps_vendu - element.temps_previsionnel
        ).toFixed(0);
        if (
          hoursProducted / temps_vendu == NaN ||
          hoursProducted / temps_vendu == Infinity
        ) {
          affaire.tp = 0;
        } else {
          affaire.tp = (hoursProducted / temps_vendu) * 100;
        }
        projects.list.push(affaire);
      });
    })
  );

  const fillGeneralTableCdp = () => {
    $('#cdpPcdNumberOpen')
      .empty()
      .html(projects.counts.cdp.pcd.open.number);
    $('#cdpPcdProduitOpen')
      .empty()
      .html(projects.counts.cdp.pcd.open.hoursProducted.toFixed(0));
    $('#cdpPcdAproduireOpen')
      .empty()
      .html(projects.counts.cdp.pcd.open.hoursToProduct.toFixed(0));
    $('#cdpPcdNumberClosed')
      .empty()
      .html(projects.counts.cdp.pcd.closed.number);
    $('#cdpPcdProduitClosed')
      .empty()
      .html(projects.counts.cdp.pcd.closed.hoursProducted.toFixed(0));
    $('#cdpPldNumberOpen')
      .empty()
      .html(projects.counts.cdp.pld.open.number);
    $('#cdpPldProduitOpen')
      .empty()
      .html(projects.counts.cdp.pld.open.hoursProducted.toFixed(0));
    $('#cdpPldAproduireOpen')
      .empty()
      .html(projects.counts.cdp.pld.open.hoursToProduct.toFixed(0));
    $('#cdpPldNumberClosed')
      .empty()
      .html(projects.counts.cdp.pld.closed.number);
    $('#cdpPldProduitClosed')
      .empty()
      .html(projects.counts.cdp.pld.closed.hoursProducted.toFixed(0));
    $('#cdpTotalNumberOpen')
      .empty()
      .html(
        projects.counts.cdp.pcd.open.number +
          projects.counts.cdp.pld.open.number
      );
    $('#cdpTotalProduitOpen')
      .empty()
      .html(
        (
          projects.counts.cdp.pcd.open.hoursProducted +
          projects.counts.cdp.pld.open.hoursProducted
        ).toFixed(0)
      );
    $('#cdpTotalAproduireOpen')
      .empty()
      .html(
        (
          projects.counts.cdp.pcd.open.hoursToProduct +
          projects.counts.cdp.pld.open.hoursToProduct
        ).toFixed(0)
      );
    $('#cdpTotalNumberClosed')
      .empty()
      .html(
        projects.counts.cdp.pcd.closed.number +
          projects.counts.cdp.pld.closed.number
      );
    $('#cdpTotalProduitClosed')
      .empty()
      .html(
        (
          projects.counts.cdp.pcd.closed.hoursProducted +
          projects.counts.cdp.pld.closed.hoursProducted
        ).toFixed(0)
      );
  };

  const fillGeneralTableCdc = () => {
    $('#cdcPcdNumberOpen')
      .empty()
      .html(projects.counts.cdc.pcd.open.number);
    $('#cdcPcdProduitOpen')
      .empty()
      .html(projects.counts.cdc.pcd.open.hoursProducted.toFixed(0));
    $('#cdcPcdAproduireOpen')
      .empty()
      .html(projects.counts.cdc.pcd.open.hoursToProduct.toFixed(0));
    $('#cdcPcdNumberClosed')
      .empty()
      .html(projects.counts.cdc.pcd.closed.number);
    $('#cdcPcdProduitClosed')
      .empty()
      .html(projects.counts.cdc.pcd.closed.hoursProducted.toFixed(0));
    $('#cdcPldNumberOpen')
      .empty()
      .html(projects.counts.cdc.pld.open.number);
    $('#cdcPldProduitOpen')
      .empty()
      .html(projects.counts.cdc.pld.open.hoursProducted.toFixed(0));
    $('#cdcPldAproduireOpen')
      .empty()
      .html(projects.counts.cdc.pld.open.hoursToProduct.toFixed(0));
    $('#cdcPldNumberClosed')
      .empty()
      .html(projects.counts.cdc.pld.closed.number);
    $('#cdcPldProduitClosed')
      .empty()
      .html(projects.counts.cdc.pld.closed.hoursProducted.toFixed(0));
    $('#cdcTotalNumberOpen')
      .empty()
      .html(
        projects.counts.cdc.pcd.open.number +
          projects.counts.cdc.pld.open.number
      );
    $('#cdcTotalProduitOpen')
      .empty()
      .html(
        (
          projects.counts.cdc.pcd.open.hoursProducted +
          projects.counts.cdc.pld.open.hoursProducted
        ).toFixed(0)
      );
    $('#cdcTotalAproduireOpen')
      .empty()
      .html(
        (
          projects.counts.cdc.pcd.open.hoursToProduct +
          projects.counts.cdc.pld.open.hoursToProduct
        ).toFixed(0)
      );
    $('#cdcTotalNumberClosed')
      .empty()
      .html(
        projects.counts.cdc.pcd.closed.number +
          projects.counts.cdc.pld.closed.number
      );
    $('#cdcTotalProduitClosed')
      .empty()
      .html(
        (
          projects.counts.cdc.pcd.closed.hoursProducted +
          projects.counts.cdc.pld.closed.hoursProducted
        ).toFixed(0)
      );
  };

  const fillGeneralStats = () => {
    $('#DossiersTraites')
      .empty()
      .html(
        projects.counts.cdp.pcd.open.number +
          projects.counts.cdp.pld.open.number +
          projects.counts.cdp.pcd.closed.number +
          projects.counts.cdp.pld.closed.number +
          projects.counts.cdc.pcd.open.number +
          projects.counts.cdc.pld.open.number +
          projects.counts.cdc.pcd.closed.number +
          projects.counts.cdc.pld.closed.number
      );
    $('#hourstoProduct')
      .empty()
      .html(
        (
          projects.counts.cdp.pcd.open.hoursToProduct +
          projects.counts.cdp.pld.open.hoursToProduct +
          projects.counts.cdc.pcd.open.hoursToProduct +
          projects.counts.cdc.pld.open.hoursToProduct
        ).toFixed(0)
      );
    $('#hoursProducted')
      .empty()
      .html(
        (
          projects.counts.cdp.pcd.open.hoursProducted +
          projects.counts.cdp.pld.open.hoursProducted +
          projects.counts.cdc.pcd.open.hoursProducted +
          projects.counts.cdc.pld.open.hoursProducted +
          projects.counts.cdp.pcd.closed.hoursProducted +
          projects.counts.cdp.pld.closed.hoursProducted +
          projects.counts.cdc.pcd.closed.hoursProducted +
          projects.counts.cdc.pld.closed.hoursProducted
        ).toFixed(0)
      );
  };
  fillGeneralTableCdp();
  fillGeneralTableCdc();
  fillGeneralStats();
  var table = $('#table').DataTable();
  table.clear();
  table.rows.add(projects.list).draw();
  $('div.pageDiv a').html(
    table.page.info().page + 1 + '/' + table.page.info().pages + ' Pages'
  );
}

$(document).ready(function() {
  $('select.selectUser').change(function() {
    if (val !== '') {
      $('.btn-getProjects')
        .addClass('enabled')
        .removeClass('disabled');
    }
    userSelected = $(this).val();
  });
  function fileName() {
    user = $('select.selectUser').val();
    return `${today} - Dashboard Cdp-Cdc - ${user}`;
  }

  let table = $('#table').DataTable({
    data: projects.list,
    columns: [
      { data: 'cloture' },
      { data: 'numero_cv' },
      { data: 'client' },
      { data: 'type' },
      { data: 'cdp' },
      { data: 'cdc' },
      { data: 'Description' },
      { data: 'temps_vendu' },
      { data: 'temps_passe' },
      { data: 'temps_restants' },
      { data: 'tp' }
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
          if (rowData.cloture == 1) {
            $(td).css('background', 'green');
            $(td).css('color', '#ffffff');
          } else {
            $(td).css('background', '#d51366');
            $(td).css('color', '#ffffff');
          }
        }
      },
      {
        targets: 8,
        createdCell: function(td, cellData, rowData, row, col) {
          if (rowData.temps_vendu < rowData.temps_passe) {
            $(td).css('color', 'red');
          }
        }
      },
      {
        targets: 10,
        render: function(data, type, full, meta) {
          return Number(data.toFixed(0));
        },
        createdCell: function(td, cellData, rowData, row, col) {
          if (rowData.tp > 100) {
            $(td).css('background', 'red');
            $(td).css('color', '#ffffff');
          } else if (rowData.tp > 85 && rowData.tp < 99) {
            $(td).css('background', 'orange');
            $(td).css('color', '#ffffff');
          } else {
            $(td).css('background', 'green');
            $(td).css('color', '#ffffff');
          }
        }
      },
      {
        targets: 1
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
      infoFiltered: '(filtre sur _MAX_ total lignes)',
      thousands: ' '
    },
    order: [[10, 'desc']],
    pageLength: 5,
    colReorder: true,
    scrollCollapse: true,
    pageResize: false,
    fixedHeader: true,
    responsive: true,
    searching: true,
    paging: true,
    lengthChange: false,
    buttons: [
      {
        extend: 'excelHtml5',
        createEmptyCells: true,
        exportOptions: {
          order: 'applied'
          //   columns: ':visible'
        },
        autoFilter: true,
        filename: function() {
          return fileName();
        },
        title: '',
        customize: function(xlsx) {
          let source = xlsx.xl['workbook.xml'].getElementsByTagName('sheet')[0];
          source.setAttribute('name', $('select.selectUser').val());
          let sheet = xlsx.xl.worksheets['sheet1.xml'];
          $('col:eq(0)', sheet).attr('width', 8);
          $('col:eq(1)', sheet).attr('width', 12);
          $('col:eq(2)', sheet).attr('width', 20);
          $('col:eq(3)', sheet).attr('width', 4);
          $('col:eq(4)', sheet).attr('width', 20);
          $('col:eq(5)', sheet).attr('width', 20);
          $('col:eq(6)', sheet).attr('width', 40);
          $('col:eq(7)', sheet).attr('width', 8);

          let new_style =
            '<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="https://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"><numFmts count="2"><numFmt numFmtId="171" formatCode="d/mm/yyyy;@"/><numFmt numFmtId="172" formatCode="m/d/yyyy;@"/></numFmts><fonts count="3" x14ac:knownFonts="1"><font><b/><sz val="12"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font><font><sz val="10"/><color rgb="FF000000"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts><fills count="6"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFF00FF"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF808080"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF008000"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFF0000"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFF9900"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color indexed="64"/></left><right style="thin"><color indexed="64"/></right><top style="thin"><color indexed="64"/></top><bottom style="thin"><color indexed="64"/></bottom><diagonal/></border></borders><cellStyleXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="9" fontId="1" fillId="0" borderId="0" applyFont="0" applyFill="0" applyBorder="0" applyAlignment="0" applyProtection="0"/></cellStyleXfs><cellXfs count="8"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="1" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="4" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="5" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="2"><cellStyle name="Procent" xfId="1" builtinId="5"/><cellStyle name="Standard" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/><colors><mruColors><color rgb="FF663300"/><color rgb="FFFFCC00"/><color rgb="FF990033"/><color rgb="FF006600"/><color rgb="FFFF9999"/><color rgb="FF99CC00"/></mruColors></colors><extLst><ext uri="{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}" xmlns:x14="https://schemas.microsoft.com/office/spreadsheetml/2009/9/main"><x14:slicerStyles defaultSlicerStyle="SlicerStyleLight1"/></ext></extLst></styleSheet>';
          xlsx.xl['styles.xml'] = $.parseXML(new_style);
          //Apply a style to the header columns
          $('row c', sheet).attr('s', '1');
          $('row c[r^="D"]', sheet).each(function() {
            $(this).attr('s', '7');
          });
          $('row c[r^="H"]', sheet).each(function() {
            $(this).attr('s', '7');
          });
          $('row c[r^="I"]', sheet).each(function() {
            $(this).attr('s', '7');
          });
          $('row c[r^="J"]', sheet).each(function() {
            $(this).attr('s', '7');
          });
          $('row c[r^="K"]', sheet).each(function() {
            if ($(this).text() > 100) {
              $(this).attr('s', '5');
            } else if ($(this).text() > 85 && $(this).text() < 99) {
              $(this).attr('s', '6');
            } else {
              $(this).attr('s', '3');
            }
          });
          $('row c[r^="A"]', sheet).each(function() {
            if ($(this).text() > 0) {
              $(this).attr('s', '3');
            } else {
              $(this).attr('s', '4');
            }
          });
          $('row:first c', sheet).attr('s', '2');
          console.log(sheet);
        }
      },
      {
        extend: 'pdfHtml5',
        exportOptions: {
          order: 'applied',
          columns: ':visible'
        },
        filename: function() {
          return fileName();
        },
        title: function() {
          return fileName();
        },
        customize(doc) {
          doc.pageOrientation = 'landscape';
          doc.pageMargins = [40, 60, 40, 60];

          let nomFichier = function() {
            return fileName();
          };
          let objLayout = {};
          objLayout['hLineWidth'] = function(i) {
            return 0.5;
          };
          objLayout['vLineWidth'] = function(i) {
            return 0.5;
          };
          objLayout['hLineColor'] = function(i) {
            return '#aaa';
          };
          objLayout['vLineColor'] = function(i) {
            return '#aaa';
          };
          objLayout['paddingLeft'] = function(i) {
            return 4;
          };
          objLayout['paddingRight'] = function(i) {
            return 4;
          };
          doc.content[1].layout = objLayout;
          tpretard = table
            .column(10)
            .data()
            .toArray();
          for (var i = 0; i < tpretard.length; i++) {
            doc.content[1].table.body[i + 1][9].color = 'white';
            doc.content[1].table.body[i + 1][9].bold = 'true';
            if (tpretard[i] > 100) {
              doc.content[1].table.body[i + 1][9].fillColor = 'red';
            } else if (tpretard[i] > 85 && tpretard[i] < 99) {
              doc.content[1].table.body[i + 1][9].fillColor = 'orange';
            } else {
              doc.content[1].table.body[i + 1][9].fillColor = 'green';
            }
          }
          cloture = table
            .column(0)
            .data()
            .toArray();
          for (var i = 0; i < cloture.length; i++) {
            doc.content[1].table.body[i + 1][0].color = 'white';
            doc.content[1].table.body[i + 1][0].bold = 'true';
            if (cloture[i] > 0) {
              doc.content[1].table.body[i + 1][0].fillColor = 'green';
            } else {
              doc.content[1].table.body[i + 1][0].fillColor = '#d51366';
            }
          }
          doc.styles.title = {
            bold: 'true',
            color: '#d51366',
            fontSize: '20',
            alignment: 'center'
          };
          doc.styles.tableHeader = {
            bold: 'true',
            color: 'white',
            fillColor: '#6C757D',
            alignment: 'center'
          };
          doc.styles.tableBodyEven = {
            background: '',
            alignment: 'center'
          };
          doc.styles.tableBodyOdd = {
            fillColor: '#F2F2F2',
            alignment: 'center'
          };
          doc.styles.tableFooter = {
            background: '',
            alignment: 'center'
          };
          doc.styles['td:nth-child(2)'] = {
            width: '100px',
            'max-width': '100px'
          };
          doc.footer = function(page, pages) {
            return {
              columns: [
                {
                  text: fileName()
                },
                {
                  alignment: 'center',
                  image:
                    'data:image/png;base64,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',
                  fit: [75, 75]
                },
                {
                  //margin: [0, 40, 0, 0],
                  alignment: 'right',
                  text: [
                    'Page ',
                    { text: page.toString() },
                    ' sur ',
                    { text: pages.toString() }
                  ]
                }
              ],
              margin: 20
            };
          };
        }
      }
    ],
    dom:
      '<"bottom row"<"col-xl-2"<"pageDiv">><"col"<"row justify-content-start mt-2"B>><"col"<"row justify-content-center navDiv">><"col"<"row justify-content-end dateDiv">>'
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

  $('#table tfoot th').each(function() {
    var title = $('#table thead th')
      .eq($(this).index())
      .text();
    $(this).html('<input type="text" placeholder="' + title + '" />');
  });
  $('#table tfoot input').on('keyup change', function() {
    table
      .column(
        $(this)
          .parent()
          .index() + ':visible'
      )
      .search(this.value)
      .draw();
  });
});

//Date d'aujourd'hui
$(document).ready(function() {
  setInterval(function() {
    const date = moment().format('DD[/]MM[/]YYYY [|] HH[:]mm[:]ss');
    $('div.dateDiv a').html(date);
  }, 1000);
});

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
