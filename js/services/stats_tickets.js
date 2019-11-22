const capitalref = getUrlVars().cr;
let capitalName = '';
const clientref = getUrlVars().client;
const ownerref = getUrlVars().owner;
let ownername = '';
let clientName = '';
let ticketClotures = 0;
let ticketsEnCours = 0;
const gtrYears = new Object();
const closedTicketsYears = new Object();
const today = moment().format('YYYY[-]MM[-]DD');

/** ******************************************* Affichage Bandeau Haut  ****************************************** */
/** ************************************************************************************************************** */
const pageTitle = 'Stats Tickets';
$(document).prop('title', pageTitle);
$('#pageTitle').html(pageTitle);
$('#gaucheTexte').html('En cours : ');
$('#droiteTexte').html('Cloturés : ');

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
      ownername = data[0].ownername;
      $('#filterTitle').html(ownername);
    }
  );
}

/** ************************* Récupération Ticket  ************************ */

const getCountTicketsOpen = year =>
  fetch(
    `http://10.1.2.7:3100/requests/ticketscounts/0/${year}/${capitalref}/${ownerref}/${clientref}/mois`
  ).then(response =>
    response.json().then(json => {
      json.forEach(element => {
        ticketsEnCours += element.nombre;
      });
      $('#EnCours').html(ticketsEnCours);
    })
  );

/** ***************************************Chargement scripts onload ************* */
window.onload = function() {
  /** ***********************Chargement des Graphiques onload ********************* */
  const ctxTicketClotures = document
    .getElementById('TicketsClotures')
    .getContext('2d');
  window.TicketsClotures = new Chart(ctxTicketClotures, configTicketsClotures);
  const ctxGTR = document.getElementById('gtrchart').getContext('2d');
  window.gtrchart = new Chart(ctxGTR, configGTR);
  getCountTicketsOpen(2019);
  /** ***********************Gestion des clicks bouttons ********************* */

  $('.btn').click(function() {
    if ($(this).hasClass('clicked')) {
      $(this).removeClass('clicked');
      $(this).addClass('unClicked');
      $(this).css('background', '#5A6268');
    } else {
      $(this).removeClass('unClicked');
      $(this).addClass('clicked');
      color = this.textContent.trim();
      $(this).css('background', chartColors[color]);
    }
  });
  $('.Histo').each(function() {
    color = this.textContent.trim();
    $(this).css('background', chartColors[color]);
  });
};

/** ***************************** Constantes Graphiques****************************** */
const chartColors = {
  2015: '#3e2723',
  2016: '#ff6d00',
  2017: '#33691e',
  2018: '#0082C3',
  2019: '#d51366'
};

const effectColors = {
  highlight: 'rgba(108, 117, 125, 0.5)',
  shadow: 'rgba(0, 0, 0, 1)',
  glow: '#000000'
};

const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Aout',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre'
];

/** ***************************************Graphique Tickets Cloturés************* */

const configTicketsClotures = {
  type: 'bar',
  data: {
    labels: MONTHS,
    datasets: []
  },
  options: {
    plugins: {},
    title: {
      display: false,
      text: ''
    },
    scales: {
      xAxes: [
        {
          scaleLabel: {
            display: false,
            labelString: ''
          }
        }
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Tickets Clôturés'
          },
          ticks: {
            suggestedMin: 0
          }
        }
      ]
    },
    legend: {
      display: false
    },
    tooltips: {
      mode: 'label',
      intersect: false,
      backgroundColor: '#5A6268',
      titleFontSize: 18,
      bodyFontSize: 18,
      shadowOffsetX: 3,
      shadowOffsetY: 3,
      shadowBlur: 10,
      shadowColor: effectColors.shadow,
      bevelWidth: 2,
      bevelHighlightColor: effectColors.highlight,
      bevelShadowColor: effectColors.shadow
    },
    hover: {
      mode: 'index',
      intersect: false
    }
  }
};

function showTicketbyYear(year) {
  if (
    !configTicketsClotures.data.datasets.find(element => element.label == year)
  ) {
    ticketsCharts(year);
  } else {
    index = configTicketsClotures.data.datasets.findIndex(
      element => element.label == year
    );
    configTicketsClotures.data.datasets.splice(index, 1);
    window.TicketsClotures.update();
  }
}

const getClosedTickets = fetch(
  `http://10.1.2.7:3100/requests/ticketscounts/1/0/${capitalref}/${ownerref}/${clientref}/mois`
)
  .then(response => response.json())
  .then(json => {
    thisYear = moment().format('YYYY');
    json.forEach(compte => {
      if (!closedTicketsYears[compte.year]) {
        closedTicketsYears[compte.year] = {
          valeurs: new Array(12),
          periode: 0
        };
        closedTicketsYears[compte.year].valeurs.fill(0, 0, 12);
      }
      periode = 0;
      if (compte.month > periode) {
        closedTicketsYears[compte.year].periode = compte.month;
      }
      closedTicketsYears[compte.year].valeurs[compte.month - 1] = compte.nombre;
      if (compte.year == thisYear) {
        ticketClotures += compte.nombre;
      }
    });
    $('#EnRetard').html(ticketClotures);
    return thisYear;
  });

function ticketsCharts(year) {
  const newDataset = {
    label: year,
    backgroundColor: chartColors[year],
    borderWidth: 0,
    data: closedTicketsYears[year].valeurs,
    shadowOffsetX: 3,
    shadowOffsetY: 3,
    shadowBlur: 10,
    shadowColor: effectColors.shadow,
    bevelWidth: 2,
    bevelHighlightColor: effectColors.highlight,
    bevelShadowColor: effectColors.shadow,
    hoverInnerGlowWidth: 20,
    hoverInnerGlowColor: effectColors.glow,
    hoverOuterGlowWidth: 20,
    hoverOuterGlowColor: effectColors.glow
  };
  configTicketsClotures.data.datasets.push(newDataset);
  configTicketsClotures.data.datasets.sort((a, b) =>
    a.label > b.label ? 1 : -1
  );

  window.TicketsClotures.update();
}

const getHistoTickets = () => {
  let years = Object.keys(closedTicketsYears);
  moisIso = closedTicketsYears[Math.max(...years)].periode;
  years.forEach(year => {
    let compteur = 0;
    let somme = 0;
    closedTicketsYears[year].valeurs.forEach(valeur => {
      if (compteur < moisIso) {
        somme += valeur;
        compteur += 1;
      }
    });
    moyenne = (somme / Number(moisIso)).toFixed(1);
    $('#moyenneTickets' + year).html(moyenne);
    $('#totalTickets' + year).html(somme);
  });
};

getClosedTickets
  .then(thisyear => $('#2019Tickets').click())
  .then(() => getHistoTickets());

/** ***************************************Graphique GTR ************s************* */

const configGTR = {
  type: 'bar',
  data: {
    labels: MONTHS,
    datasets: []
  },
  options: {
    title: {
      display: false,
      text: ''
    },
    scales: {
      xAxes: [
        {
          scaleLabel: {
            display: false,
            labelString: ''
          }
        }
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Jours'
          },
          ticks: {
            suggestedMin: 0
          }
        }
      ]
    },
    legend: {
      display: false
    },
    tooltips: {
      mode: 'label',
      intersect: false,
      backgroundColor: '#5A6268',
      titleFontSize: 18,
      bodyFontSize: 18,
      shadowOffsetX: 3,
      shadowOffsetY: 3,
      shadowBlur: 10,
      shadowColor: effectColors.shadow,
      bevelWidth: 2,
      bevelHighlightColor: effectColors.highlight,
      bevelShadowColor: effectColors.shadow
    },
    hover: {
      mode: 'index',
      intersect: false
    }
  }
};

function showGtrbyYear(year) {
  if (!configGTR.data.datasets.find(element => element.label == year)) {
    gtrCharts(year);
  } else {
    index = configGTR.data.datasets.findIndex(element => element.label == year);
    configGTR.data.datasets.splice(index, 1);

    window.gtrchart.update();
  }
}

const getGTR = fetch(
  `http://10.1.2.7:3100/requests/gtrcounts/1/0/${capitalref}/${ownerref}/${clientref}/mois`
)
  .then(response => response.json())
  .then(json => {
    thisYear = moment().format('YYYY');
    json.forEach(compte => {
      if (!gtrYears[compte.year]) {
        gtrYears[compte.year] = { valeurs: new Array(12), periode: 0 };
        gtrYears[compte.year].valeurs.fill(0, 0, 12);
      }
      periode = 0;
      if (compte.month > periode) {
        gtrYears[compte.year].periode = compte.month;
      }
      gtrYears[compte.year].valeurs[compte.month - 1] = compte.nombre.toFixed(
        1
      );
    });
    return thisYear;
  });

function gtrCharts(year) {
  const newDataset = {
    label: year,
    backgroundColor: chartColors[year],
    borderWidth: 0,
    data: gtrYears[year].valeurs,
    shadowOffsetX: 3,
    shadowOffsetY: 3,
    shadowBlur: 10,
    shadowColor: effectColors.shadow,
    bevelWidth: 2,
    bevelHighlightColor: effectColors.highlight,
    bevelShadowColor: effectColors.shadow,
    hoverInnerGlowWidth: 20,
    hoverInnerGlowColor: effectColors.glow,
    hoverOuterGlowWidth: 20,
    hoverOuterGlowColor: effectColors.glow
  };
  configGTR.data.datasets.push(newDataset);
  configGTR.data.datasets.sort((a, b) => (a.label > b.label ? 1 : -1));
  window.gtrchart.update();
}

const getHistoGTR = () => {
  let years = Object.keys(gtrYears);
  years.forEach(year => {
    const add = (a, b) => Number(a) + Number(b);
    let somme = 0;
    somme = gtrYears[year].valeurs.reduce(add);
    moyenne = (somme / gtrYears[year].periode).toFixed(2);
    $('#moyenneGtr' + year).html(moyenne);
  });
};

getGTR.then(thisyear => $('#2019GTR').click()).then(() => getHistoGTR());

// Date d'aujourd'hui
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
