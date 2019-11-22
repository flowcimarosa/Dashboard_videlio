/*********************************************************
 * Fonction récupération des données (Projets en cours)
 *********************************************************/
let capitalref = getUrlVars()['cr'];
let capitalName = '';
let nbHeures = 0;
let nbHeuresDev = 0;
let nbHeuresCma = 0;
let nbHeuresSav = 0;
let nbHeuresDPE = 0;
let TpInf = 0;
let TpSup = 0;
let Tptotal = 0;
let percentTpInf = 0;
let percentTpSup = 0;
let DossiersEnCours = 0;
let enPause = 1;
let Retard = 0;
const today = moment().format('YYYY[-]MM[-]DD');

/** ******************************************* Affichage Bandeau Haut  ****************************************** */
/** ************************************************************************************************************** */
const pageTitle = 'Production effectuée';
$(document).prop('title', pageTitle);
$('#pageTitle').html(pageTitle);
$('#gaucheTexte').html('En cours : ');
$('#droiteTexte').html('En retard : ');

// Nom de la BU
$.getJSON('http://10.1.2.7:3000/requests/CapitaleRegion', function(data) {
  $('#groupTitle').append(' - BU : ');
  $.each(data, function(a, b) {
    if (b.Code_Capitale_Regionale == capitalref) {
      capitalName = b.Capitale_Regionale;
    }
    if (capitalref == 'total') {
      $('#filterTitle').html('NATIONAL');
    } else {
      $('#filterTitle').html(capitalName);
    }
  });
});

$.getJSON('http://10.1.2.7:3000/requests/kpiCapital/' + capitalref, function(
  data
) {
  $.each(data, function(key, result) {
    if (result.name === 'NB_DOSSIER_CLOTURE') {
      $('#Cloture').html(result.value);
    }
    if (result.name === 'DELAI_MOY_D_CMD_D_CLOTURE_PCD') {
      $('#DelaiPcd').html(result.value);
    }
    if (result.name === 'DELAI_MOY_D_CMD_D_CLOTURE_PLD') {
      $('#DelaiPld').html(result.value);
    }
    if (result.name === 'NB_HEURES_CV') {
      nbHeures = result.value;
      $('#nbHeuresTotal').html(new Intl.NumberFormat().format(result.value));
    }
    if (result.name === 'NB_HEURES_DEV') {
      nbHeuresDev = result.value;
      $('#nbHeuresDev').html(new Intl.NumberFormat().format(result.value));
      $('#txtnbHeuresDev').append(
        ' (' + ((result.value * 100) / nbHeures).toFixed(1) + '%) : '
      );
    }
    if (result.name === 'NB_HEURES_CV_CMA') {
      nbHeuresCma = result.value;
      $('#nbHeuresCma').html(new Intl.NumberFormat().format(result.value));
      $('#txtnbHeuresCma').append(
        ' (' + ((result.value * 100) / nbHeures).toFixed(1) + '%) : '
      );
    }
    if (result.name === 'NB_HEURES_CV_SAV') {
      nbHeuresSav = result.value;
      $('#nbHeuresSav').html(new Intl.NumberFormat().format(result.value));
      $('#txtnbHeuresSav').append(
        ' (' + ((result.value * 100) / nbHeures).toFixed(1) + '%) : '
      );
    }
    if (result.name === 'NB_HEURES_CV_DPE') {
      nbHeuresDPE = result.value;
      $('#nbHeuresDPE').html(new Intl.NumberFormat().format(result.value));
      $('#txtnbHeuresDPE').append(
        ' (' + ((result.value * 100) / nbHeures).toFixed(1) + '%) : '
      );
    }
    if (result.name === 'NB_DOSSIER_CLOTURE_TP_INF_1') {
      TpInf = result.value;
    }
    if (result.name === 'NB_DOSSIER_CLOTURE_TP_SUP_1') {
      TpSup = result.value;
    }
    if (result.name === 'NB_DOSSIER_EN_COURS') {
      if (result.name !== '') {
        DossiersEnCours = result.value;
        $('#EnCours').html(result.value);
      }
    }
    if (result.name === 'NB_DOSSIER_EN_COURS_DATE_RETARD') {
      Retard = result.value;
      $('#EnRetard').html(result.value);
    }
  });
  let Tptotal = TpInf + TpSup;
  const nbHeuresAffaires =
    nbHeures - (nbHeuresCma + nbHeuresDPE + nbHeuresSav + nbHeuresDev);
  $('#nbHeuresCv').html(new Intl.NumberFormat().format(nbHeuresAffaires));
  $('#txtnbHeuresCv').append(
    ' (' + ((nbHeuresAffaires * 100) / nbHeures).toFixed(1) + '%) : '
  );
  //percentTpInf = Math.round((TpInf*100)/(TpInf+TpSup));
  percentTpSup = ((TpSup * 100) / (TpInf + TpSup)).toFixed(1) + '%';
  percentTpInf = ((TpInf * 100) / (TpInf + TpSup)).toFixed(1) + '%';

  if (TpInf == 0 && TpSup == 0) {
    $('#ratioTP').hide();
  } else {
    let ctx = document.getElementById('tptotal').getContext('2d');

    /*************************************TP Inf et Sup Chart **************************** */
    /************************************************************************************* */
    let pieOptions = {
      responsive: true,
      legend: {
        display: false
      },
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 8,
          bottom: 15
        }
      },
      title: {
        display: false,
        fontSize: 18,
        fontStyle: 'bold',
        fontColor: 'black',
        text: '',
        position: 'bottom'
      },
      rotation: 45,
      events: false,
      plugins: {
        labels: {
          render: 'value',
          fontSize: 18,
          fontStyle: 'bold',
          fontColor: '#ffff'
        },
        doughnutlabel: {
          labels: [
            {
              text: 'TP',
              font: {
                size: '35'
              }
            },
            {
              text: percentTpSup,
              font: {
                size: '25'
              },
              color: 'red'
            },
            {
              text: percentTpInf,
              font: {
                size: '25'
              },
              color: 'green'
            }
          ]
        }
      }
    };
    let effectColors = {
      highlight: 'rgba(255, 255, 255, 0.75)',
      shadow: 'rgba(0, 0, 0, 0.5)',
      glow: 'rgb(255, 255, 0)'
    };
    let pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            fill: true,
            backgroundColor: ['green', 'red'],
            data: [TpInf, TpSup],
            shadowOffsetX: 5,
            shadowOffsetY: 5,
            shadowBlur: 15,
            shadowColor: effectColors.shadow,
            bevelWidth: 5,
            bevelHighlightColor: effectColors.highlight,
            bevelShadowColor: effectColors.shadow,
            hoverInnerGlowWidth: 20,
            hoverInnerGlowColor: effectColors.glow,
            hoverOuterGlowWidth: 20,
            hoverOuterGlowColor: effectColors.glow
          }
        ],
        labels: ['TpSup', 'TpInf']
      },
      options: pieOptions
    });
  }
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
