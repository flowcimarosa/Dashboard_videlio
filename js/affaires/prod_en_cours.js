let capitalref = getUrlVars()['cr'];
let capitalName = '';
let DossiersEnCours = 0;
let EnCoursPld = 0;
let EnCoursPcd = 0;
let nbrDossierAtelier = 0;
let retardsAtelier = 0;
let nbrDossierEtude = 0;
let retardsEtude = 0;
let nbrDossierProg = 0;
let retardsProg = 0;
let nbrDossierDoe = 0;
let retardsDoe = 0;
let nbrDossierFormation = 0;
let retardsFormation = 0;
let nbrDossierMeca = 0;
let retardsMeca = 0;
let nbrDossierIntegration = 0;
let retardsIntegration = 0;
let retardsDateCloture = 0;
let DossiersPld = 0;
let DossiersPcd = 0;
let PldRetard = 0;
let PrcPCDRetard = '';
let PrcPLDRetard = '';
let PrcPLDCorrect = '';
let PrcPCDCorrect = '';
let PcdRetard = 0;
let Retard = 0;
let PcdCorrect = 0;
let PldCorrect = 0;
let totalTpPCD = 0;
let totalTpPLD = 0;
let enPause = 1;
const today = moment().format('YYYY[-]MM[-]DD');

/** ******************************************* Affichage Bandeau Haut  ****************************************** */
/** ************************************************************************************************************** */
const pageTitle = 'Production en cours';
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
    if (result.name === 'NB_DOSSIER_EN_COURS_PLD') {
      EnCoursPld = result.value;
      $('#EnCoursPld').html(result.value);
    }
    if (result.name === 'NB_DOSSIER_EN_COURS_PCD') {
      EnCoursPcd = result.value;
      $('#EnCoursPcd').html(result.value);
    }
    if (result.name === 'NB_DOSSIER_A_CLOTURER_MOIS') {
      $('#ACloture').html(result.value);
    }
    if (result.name === 'NB_DOSSIER_EN_COURS_ETUDE') {
      nbHeures = result.value;
      $('#nbHeuresTotal').html(new Intl.NumberFormat().format(result.value));
    }
    if (result.name === 'NB_DOSSIER_EN_COURS_PROG') {
      nbHeuresDev = result.value;
      $('#nbHeuresDev').html(new Intl.NumberFormat().format(result.value));
      $('#txtnbHeuresDev').append(
        ' (' + ((result.value * 100) / nbHeures).toFixed(1) + '%) : '
      );
    }
    if (result.name === 'NB_DOSSIER_EN_COURS_DATE_RETARD_PLD') {
      PldRetard = result.value;
    }
    if (result.name === 'NB_DOSSIER_EN_COURS_DATE_RETARD_PCD') {
      PcdRetard = result.value;
    }
    if (result.name === 'NB_DOSSIER_EN_COURS_DATE_RETARD') {
      Retard = result.value;
    }
    if (result.name === 'NB_DOSSIER_EN_COURS') {
      if (result.name !== '') {
        DossiersEnCours = result.value;
        $('#EnCours').html(result.value);
      }
    }
  });
  $('#EnRetard').html(Retard);
  PcdCorrect = EnCoursPcd - PcdRetard;
  PldCorrect = EnCoursPld - PldRetard;
  totalTpPCD = PcdCorrect + PcdRetard;
  totalTpPLD = PldCorrect + PldRetard;

  let PrcPLDCorrect = '';
  let PrcPCDCorrect = '';
  PrcPCDCorrect = ((PcdCorrect * 100) / EnCoursPcd).toFixed(1) + '%';
  PrcPLDCorrect = ((PldCorrect * 100) / EnCoursPld).toFixed(1) + '%';
  PrcPCDRetard = ((PcdRetard * 100) / EnCoursPcd).toFixed(1) + '%';
  PrcPLDRetard = ((PldRetard * 100) / EnCoursPld).toFixed(1) + '%';

  /****************************************** Chart Effect *****************************/
  /*************************************************************************************/

  let effectColors = {
    highlight: 'rgba(255, 255, 255, 0.75)',
    shadow: 'rgba(0, 0, 0, 0.5)',
    glow: 'rgb(255, 255, 0)'
  };
  /****************************************** PLD Chart ********************************/
  /*************************************************************************************/
  let ctx1 = document.getElementById('retardPld').getContext('2d');
  let pieOptions1 = {
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
      text: 'PLD',
      position: 'bottom'
    },
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
            text: 'PLD',
            font: {
              size: '35'
            }
          },
          {
            text: PrcPLDRetard,
            font: {
              size: '25'
            },
            color: 'red'
          },
          {
            text: PrcPLDCorrect,
            font: {
              size: '25'
            },
            color: 'green'
          }
        ]
      }
    }
  };

  let pieChart = new Chart(ctx1, {
    type: 'doughnut',
    data: {
      datasets: [
        {
          fill: true,
          backgroundColor: ['red', 'green'],
          data: [PldRetard, PldCorrect],
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
      labels: ['En Retard', 'En Cours']
    },
    options: pieOptions1
  });

  /****************************************** PCD Chart ********************************/
  /*************************************************************************************/
  let ctx2 = document.getElementById('retardPcd').getContext('2d');

  let pieOptions2 = {
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
      text: 'PCD',
      position: 'bottom'
    },
    rotation: 45,
    events: false,
    plugins: {
      labels: {
        render: 'value',
        fontSize: 18,
        fontStyle: 'bold',
        fontColor: '#ffff',
        align: 'center'
      },
      doughnutlabel: {
        labels: [
          {
            text: 'PCD',
            font: {
              size: '35'
            }
          },
          {
            text: PrcPCDRetard,
            font: {
              size: '25'
            },
            color: 'red'
          },
          {
            text: PrcPCDCorrect,
            font: {
              size: '25'
            },
            color: 'green'
          }
        ]
      }
    }
  };

  let pieChart1 = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      datasets: [
        {
          fill: true,
          backgroundColor: ['red', 'green'],
          data: [PcdRetard, PcdCorrect],
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
      labels: ['En Retard', 'En Cours']
    },
    options: pieOptions2
  });
  let newHeigth = pieChart1.canvas.parentNode.style.height;
});

/*********************************************************
 * Fonction récupération des données (Projets a clôturés)
 *********************************************************/
$.getJSON('http://10.1.2.7:3000/requests/prodencours/0/' + capitalref, function(
  data
) {
  //Filtre par date
  $.each(data, function(key, result) {
    if (
      result.etude_cocher == 1 &&
      result.avancement_etude_percent_plan_implantation !== 100
    ) {
      nbrDossierEtude++;
      if (
        result.etude_cocher === 1 &&
        (result.avancement_etude_date_plan_implantation < today ||
          result.avancement_etude_date_plan_implantation === null ||
          result.avancement_etude_date_plan_implantation === '0000-00-00') &&
        result.avancement_etude_percent_plan_implantation < 100
      ) {
        retardsEtude++;
      }
    }
    if (result.doe_cocher == 1 && result.avancement_doe_percent !== 100) {
      nbrDossierDoe++;
      if (
        result.doe_cocher === 1 &&
        (result.avancement_doe_date < today ||
          result.avancement_doe_date === null ||
          result.avancement_doe_date === '0000-00-00') &&
        result.avancement_doe_percent < 100
      ) {
        retardsDoe++;
      }
    }
    if (
      result.atelier_cocher == 1 &&
      result.avancement_integration_percent_preparation_atelier !== 100
    ) {
      nbrDossierAtelier++;
      if (
        result.atelier_cocher === 1 &&
        (result.avancement_integration_date_preparation_atelier < today ||
          result.avancement_integration_date_preparation_atelier === null ||
          result.avancement_integration_date_preparation_atelier ===
            '0000-00-00') &&
        result.avancement_integration_percent_preparation_atelier < 100
      ) {
        retardsAtelier++;
      }
    }
    if (
      result.programmation_cocher == 1 &&
      result.avancement_integration_percent_prog_expert !== 100
    ) {
      nbrDossierProg++;
      if (
        result.programmation_cocher === 1 &&
        (result.avancement_integration_date_prog_expert < today ||
          result.avancement_integration_date_prog_expert === null ||
          result.avancement_integration_date_prog_expert === '0000-00-00') &&
        result.avancement_integration_percent_prog_expert < 100
      ) {
        retardsProg++;
      }
    }
    if (
      result.formation_cocher == 1 &&
      result.avancement_formation_percent !== 100
    ) {
      nbrDossierFormation++;
      if (
        result.formation_cocher === 1 &&
        (result.avancement_formation_date < today ||
          result.avancement_formation_date === null ||
          result.avancement_formation_date === '0000-00-00') &&
        result.avancement_formation_percent < 100
      ) {
        retardsFormation++;
      }
    }
    if (
      result.avancement_integration_percent_maillage_mecanique !== 100 &&
      (result.avancement_integration_date_maillage_mecanique !== null &&
        result.avancement_integration_date_maillage_mecanique !== '0000-00-00')
    ) {
      nbrDossierMeca++;
      if (
        result.avancement_integration_date_maillage_mecanique < today &&
        result.avancement_integration_date_maillage_mecanique !== null &&
        result.avancement_integration_date_maillage_mecanique !==
          '0000-00-00' &&
        result.avancement_integration_percent_maillage_mecanique < 100
      ) {
        retardsMeca++;
      }
    }
    if (
      result.avancement_integration_percent_integration_equipement !== 100 &&
      (result.avancement_integration_date_integration_equipement !== null &&
        result.avancement_integration_date_integration_equipement !==
          '0000-00-00')
    ) {
      nbrDossierIntegration++;
      if (
        result.avancement_integration_date_integration_equipement < today &&
        result.avancement_integration_date_integration_equipement !== null &&
        result.avancement_integration_date_integration_equipement !==
          '0000-00-00' &&
        result.avancement_integration_percent_integration_equipement < 100
      ) {
        retardsIntegration++;
      }
    }
    if (
      result.cloture_prevu < today &&
      result.cloture_prevu !== null &&
      result.cloture_prevu !== '0000-00-00'
    ) {
      retardsDateCloture++;
    }
  });
  $('#EtudeTotal').html(nbrDossierEtude);
  $('#EtudeRetard').html(retardsEtude);
  $('#EtudeEnCours').html(nbrDossierEtude - retardsEtude);
  $('#DoeTotal').html(nbrDossierDoe);
  $('#DoeRetard').html(retardsDoe);
  $('#DoeEnCours').html(nbrDossierDoe - retardsDoe);
  $('#AtelierTotal').html(nbrDossierAtelier);
  $('#AtelierRetard').html(retardsAtelier);
  $('#AtelierEnCours').html(nbrDossierAtelier - retardsAtelier);
  $('#ProgTotal').html(nbrDossierProg);
  $('#ProgRetard').html(retardsProg);
  $('#ProgEnCours').html(nbrDossierProg - retardsProg);
  $('#FormationTotal').html(nbrDossierFormation);
  $('#FormationRetard').html(retardsFormation);
  $('#FormationEnCours').html(nbrDossierFormation - retardsFormation);
  $('#MecaTotal').html(nbrDossierMeca);
  $('#MecaRetard').html(retardsMeca);
  $('#MecaEnCours').html(nbrDossierMeca - retardsMeca);
  $('#IntegrationTotal').html(nbrDossierIntegration);
  $('#IntegrationRetard').html(retardsIntegration);
  $('#DateClotureRetard').html(retardsDateCloture);
  $('#IntegrationEnCours').html(nbrDossierIntegration - retardsIntegration);
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
